const { getPool } = require('../db');

class PVReception {
  static async create(data) {
    const {
      numero_pv,
      id_bon_reception,
      date_pv,
      adresse,
      fournisseur,
      livreur,
      telephone_livreur,
      details_articles,
      observations,
      statut = 'draft',
      utilisateur_id
    } = data;

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO pv_reception 
       (numero_pv, id_bon_reception, date_pv, adresse, fournisseur, livreur, 
        telephone_livreur, details_articles, observations, statut, utilisateur_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero_pv, id_bon_reception, date_pv, adresse, fournisseur, livreur,
        telephone_livreur, details_articles, observations, statut, utilisateur_id
      ]
    );

    return result.insertId;
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let sql = `
      SELECT pv.*, br.numero_bon, br.date_reception, br.district, br.commune,
             u.username as createur
      FROM pv_reception pv
      LEFT JOIN bons_reception br ON pv.id_bon_reception = br.id
      LEFT JOIN users u ON pv.utilisateur_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.statut) {
      sql += ' AND pv.statut = ?';
      params.push(filters.statut);
    }

    if (filters.fournisseur) {
      sql += ' AND pv.fournisseur LIKE ?';
      params.push(`%${filters.fournisseur}%`);
    }

    if (filters.numero_pv) {
      sql += ' AND pv.numero_pv LIKE ?';
      params.push(`%${filters.numero_pv}%`);
    }

    if (filters.date_pv_debut) {
      sql += ' AND pv.date_pv >= ?';
      params.push(filters.date_pv_debut);
    }

    if (filters.date_pv_fin) {
      sql += ' AND pv.date_pv <= ?';
      params.push(filters.date_pv_fin);
    }

    sql += ' ORDER BY pv.created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT pv.*, br.numero_bon, br.date_reception, br.district, br.commune,
              u.username as createur
       FROM pv_reception pv
       LEFT JOIN bons_reception br ON pv.id_bon_reception = br.id
       LEFT JOIN users u ON pv.utilisateur_id = u.id
       WHERE pv.id_pv = ?`,
      [id]
    );

    return rows[0] || null;
  }

  static async findByNumero(numero_pv) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT pv.*, br.numero_bon, br.date_reception, br.district, br.commune,
              u.username as createur
       FROM pv_reception pv
       LEFT JOIN bons_reception br ON pv.id_bon_reception = br.id
       LEFT JOIN users u ON pv.utilisateur_id = u.id
       WHERE pv.numero_pv = ?`,
      [numero_pv]
    );

    return rows[0] || null;
  }

  static async update(id, data) {
    const pool = getPool();
    const allowedFields = [
      'numero_pv', 'id_bon_reception', 'date_pv', 'adresse', 'fournisseur',
      'livreur', 'telephone_livreur', 'details_articles', 'observations',
      'statut', 'utilisateur_id'
    ];

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
      `UPDATE pv_reception SET ${updateFields.join(', ')} WHERE id_pv = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id) {
    const pool = getPool();
    await pool.query('DELETE FROM pv_reception WHERE id_pv = ?', [id]);
    return true;
  }

  static async count(filters = {}) {
    const pool = getPool();
    let sql = 'SELECT COUNT(*) as total FROM pv_reception WHERE 1=1';
    const params = [];

    if (filters.statut) {
      sql += ' AND statut = ?';
      params.push(filters.statut);
    }

    if (filters.fournisseur) {
      sql += ' AND fournisseur LIKE ?';
      params.push(`%${filters.fournisseur}%`);
    }

    if (filters.numero_pv) {
      sql += ' AND numero_pv LIKE ?';
      params.push(`%${filters.numero_pv}%`);
    }

    if (filters.date_pv_debut) {
      sql += ' AND date_pv >= ?';
      params.push(filters.date_pv_debut);
    }

    if (filters.date_pv_fin) {
      sql += ' AND date_pv <= ?';
      params.push(filters.date_pv_fin);
    }

    const [rows] = await pool.query(sql, params);
    return rows[0].total;
  }

  static async getStats() {
    const pool = getPool();
    const [stats] = await pool.query(`
      SELECT 
        statut,
        COUNT(*) as count
      FROM pv_reception 
      GROUP BY statut
    `);

    const [total] = await pool.query('SELECT COUNT(*) as total FROM pv_reception');
    
    return {
      total: total[0].total,
      by_status: stats.reduce((acc, stat) => {
        acc[stat.statut] = stat.count;
        return acc;
      }, {})
    };
  }

  static async getBonsReception() {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT id, numero_bon, date_reception, fournisseur, district, commune
      FROM bons_reception 
      ORDER BY date_reception DESC
    `);
    return rows;
  }
}

module.exports = PVReception;

