const { getPool } = require('../db');

class UserRole {
  static async create(data) {
    const {
      name,
      display_name,
      description,
      permissions = [],
      is_active = true
    } = data;

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO user_roles (name, display_name, description, permissions, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, display_name, description, JSON.stringify(permissions), is_active]
    );

    return result.insertId;
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let sql = 'SELECT * FROM user_roles WHERE 1=1';
    const params = [];

    if (filters.is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.name) {
      sql += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    sql += ' ORDER BY display_name ASC';

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
      permissions: JSON.parse(row.permissions || '[]')
    }));
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM user_roles WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      ...row,
      permissions: JSON.parse(row.permissions || '[]')
    };
  }

  static async findByName(name) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM user_roles WHERE name = ?',
      [name]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      ...row,
      permissions: JSON.parse(row.permissions || '[]')
    };
  }

  static async update(id, data) {
    const pool = getPool();
    const allowedFields = ['name', 'display_name', 'description', 'permissions', 'is_active'];
    
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'permissions') {
          updateFields.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      }
    }

    if (updateFields.length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }

    values.push(id);

    await pool.query(
      `UPDATE user_roles SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id) {
    const pool = getPool();
    
    // Vérifier si le rôle est utilisé par des utilisateurs
    const [users] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
      [id]
    );

    if (users[0].count > 0) {
      throw new Error('Ce rôle est utilisé par des utilisateurs et ne peut pas être supprimé');
    }

    await pool.query('DELETE FROM user_roles WHERE id = ?', [id]);
    return true;
  }

  static async getStats() {
    const pool = getPool();
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
      FROM user_roles
    `);

    const [userStats] = await pool.query(`
      SELECT 
        ur.name as role_name,
        ur.display_name,
        COUNT(u.id) as user_count
      FROM user_roles ur
      LEFT JOIN users u ON ur.id = u.role_id
      GROUP BY ur.id, ur.name, ur.display_name
      ORDER BY user_count DESC
    `);

    return {
      ...stats[0],
      by_role: userStats
    };
  }

  static async getPermissions() {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT DISTINCT permission
      FROM user_roles, JSON_TABLE(permissions, '$[*]' COLUMNS (permission VARCHAR(50) PATH '$')) AS jt
      WHERE is_active = 1
      ORDER BY permission
    `);

    return rows.map(row => row.permission);
  }
}

module.exports = UserRole;

