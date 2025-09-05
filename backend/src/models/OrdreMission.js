const { getPool } = require('../db');

class OrdreMission {
  static async create(data) {
    const {
      numero_om,
      nom_personne,
      fonction,
      moto_no,
      districts_visites,
      date_depart,
      km_depart = 0,
      date_arrivee,
      km_arrivee = 0,
      statut = 'en_cours',
      observations,
      utilisateur_id
    } = data;

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO ordres_mission 
       (numero_om, nom_personne, fonction, moto_no, districts_visites, 
        date_depart, km_depart, date_arrivee, km_arrivee, statut, 
        observations, utilisateur_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero_om, nom_personne, fonction, moto_no, districts_visites,
        date_depart, km_depart, date_arrivee, km_arrivee, statut,
        observations, utilisateur_id
      ]
    );

    return result.insertId;
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let sql = `
      SELECT om.*
      FROM ordres_mission om
      WHERE 1=1
    `;
    const params = [];

    if (filters.statut) {
      sql += ' AND om.statut = ?';
      params.push(filters.statut);
    }

    if (filters.nom_personne) {
      sql += ' AND om.nom_personne LIKE ?';
      params.push(`%${filters.nom_personne}%`);
    }

    if (filters.fonction) {
      sql += ' AND om.fonction LIKE ?';
      params.push(`%${filters.fonction}%`);
    }

    if (filters.date_depart_debut) {
      sql += ' AND om.date_depart >= ?';
      params.push(filters.date_depart_debut);
    }

    if (filters.date_depart_fin) {
      sql += ' AND om.date_depart <= ?';
      params.push(filters.date_depart_fin);
    }

    sql += ' ORDER BY om.created_at DESC';

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
      `SELECT om.*
       FROM ordres_mission om
       WHERE om.id_om = ?`,
      [id]
    );

    return rows[0] || null;
  }

  static async findByNumero(numero_om) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT om.*
       FROM ordres_mission om
       WHERE om.numero_om = ?`,
      [numero_om]
    );

    return rows[0] || null;
  }

  static async update(id, data) {
    const pool = getPool();
    const allowedFields = [
      'numero_om', 'nom_personne', 'fonction', 'moto_no', 'districts_visites',
      'date_depart', 'km_depart', 'date_arrivee', 'km_arrivee', 'statut',
      'observations', 'utilisateur_id'
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
      `UPDATE ordres_mission SET ${updateFields.join(', ')} WHERE id_om = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id) {
    const pool = getPool();
    await pool.query('DELETE FROM ordres_mission WHERE id_om = ?', [id]);
    return true;
  }

  static async count(filters = {}) {
    const pool = getPool();
    let sql = 'SELECT COUNT(*) as total FROM ordres_mission WHERE 1=1';
    const params = [];

    if (filters.statut) {
      sql += ' AND statut = ?';
      params.push(filters.statut);
    }

    if (filters.nom_personne) {
      sql += ' AND nom_personne LIKE ?';
      params.push(`%${filters.nom_personne}%`);
    }

    if (filters.fonction) {
      sql += ' AND fonction LIKE ?';
      params.push(`%${filters.fonction}%`);
    }

    if (filters.date_depart_debut) {
      sql += ' AND date_depart >= ?';
      params.push(filters.date_depart_debut);
    }

    if (filters.date_depart_fin) {
      sql += ' AND date_depart <= ?';
      params.push(filters.date_depart_fin);
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
      FROM ordres_mission 
      GROUP BY statut
    `);

    const [total] = await pool.query('SELECT COUNT(*) as total FROM ordres_mission');
    
    return {
      total: total[0].total,
      by_status: stats.reduce((acc, stat) => {
        acc[stat.statut] = stat.count;
        return acc;
      }, {})
    };
  }
}

module.exports = OrdreMission;