const { getPool } = require('../db');
const bcrypt = require('bcrypt');

class User {
  static async create(data) {
    const {
      username,
      password,
      email,
      phone,
      role_id,
      is_active = true
    } = data;

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO users (username, password_hash, email, phone, role_id, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, passwordHash, email, phone, role_id, is_active]
    );

    return result.insertId;
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let sql = `
      SELECT u.*, ur.name as role_name, ur.display_name as role_display_name, 
             ur.permissions as role_permissions
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.is_active !== undefined) {
      sql += ' AND u.is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.role_id) {
      sql += ' AND u.role_id = ?';
      params.push(filters.role_id);
    }

    if (filters.username) {
      sql += ' AND u.username LIKE ?';
      params.push(`%${filters.username}%`);
    }

    if (filters.email) {
      sql += ' AND u.email LIKE ?';
      params.push(`%${filters.email}%`);
    }

    sql += ' ORDER BY u.created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }

    const [rows] = await pool.query(sql, params);
    return rows.map(row => ({
      ...row,
      role_permissions: row.role_permissions ? JSON.parse(row.role_permissions) : []
    }));
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT u.*, ur.name as role_name, ur.display_name as role_display_name, 
              ur.permissions as role_permissions
       FROM users u
       LEFT JOIN user_roles ur ON u.role_id = ur.id
       WHERE u.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      ...row,
      role_permissions: row.role_permissions ? JSON.parse(row.role_permissions) : []
    };
  }

  static async findByUsername(username) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT u.*, ur.name as role_name, ur.display_name as role_display_name, 
              ur.permissions as role_permissions
       FROM users u
       LEFT JOIN user_roles ur ON u.role_id = ur.id
       WHERE u.username = ?`,
      [username]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      ...row,
      role_permissions: row.role_permissions ? JSON.parse(row.role_permissions) : []
    };
  }

  static async update(id, data) {
    const pool = getPool();
    const allowedFields = ['username', 'email', 'phone', 'role_id', 'is_active'];
    
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }

    values.push(id);

    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async updatePassword(id, newPassword) {
    const pool = getPool();
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    );

    return true;
  }

  static async delete(id) {
    const pool = getPool();
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }

  static async deactivate(id) {
    const pool = getPool();
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
    return true;
  }

  static async activate(id) {
    const pool = getPool();
    await pool.query('UPDATE users SET is_active = TRUE WHERE id = ?', [id]);
    return true;
  }

  static async updateLastLogin(id) {
    const pool = getPool();
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
    return true;
  }

  static async getStats() {
    const pool = getPool();
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as active_last_30_days
      FROM users
    `);

    const [roleStats] = await pool.query(`
      SELECT 
        ur.name as role_name,
        ur.display_name as role_display_name,
        COUNT(u.id) as user_count
      FROM user_roles ur
      LEFT JOIN users u ON ur.id = u.role_id AND u.is_active = 1
      GROUP BY ur.id, ur.name, ur.display_name
      ORDER BY user_count DESC
    `);

    return {
      ...stats[0],
      by_role: roleStats
    };
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async hasPermission(user, permission) {
    if (!user.role_permissions) return false;
    
    // Si l'utilisateur a la permission "all", il a tous les droits
    if (user.role_permissions.includes('all')) return true;
    
    // Vérifier si l'utilisateur a la permission spécifique
    return user.role_permissions.includes(permission);
  }

  static async checkRoleAccess(user, requiredRole) {
    const roleHierarchy = {
      'admin': 4,
      'manager': 3,
      'operator': 2,
      'viewer': 1
    };

    const userLevel = roleHierarchy[user.role_name] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }
}

// Fonctions de compatibilité avec l'ancien code
async function findByUsername(username) {
  return await User.findByUsername(username);
}

async function createUser(username, passwordHash, role = 'user') {
  // Cette fonction est maintenue pour la compatibilité
  // Mais elle ne devrait plus être utilisée dans le nouveau code
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', 
    [username, passwordHash, role]
  );
  return { id: result.insertId, username, role };
}

module.exports = { 
  create: User.create,
  findAll: User.findAll,
  findById: User.findById,
  findByUsername: User.findByUsername,
  update: User.update,
  updatePassword: User.updatePassword,
  delete: User.delete,
  deactivate: User.deactivate,
  activate: User.activate,
  updateLastLogin: User.updateLastLogin,
  getStats: User.getStats,
  verifyPassword: User.verifyPassword,
  hasPermission: User.hasPermission,
  checkRoleAccess: User.checkRoleAccess,
  // Fonctions de compatibilité
  createUser 
};