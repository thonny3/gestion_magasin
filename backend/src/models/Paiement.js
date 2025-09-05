const { getPool } = require('../db');

async function listPaiements() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM paiements ORDER BY id DESC');
  return rows;
}

async function getPaiementById(id) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM paiements WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createPaiement(data) {
  const pool = getPool();
  const [result] = await pool.query(
    `INSERT INTO paiements (numero, client, date_emission, date_echeance, montant, montant_paye, statut, mode_paiement, date_paiement, observations, categorie)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.numero,
      data.client,
      data.date_emission,
      data.date_echeance,
      Number(data.montant || 0),
      Number(data.montant_paye || 0),
      data.statut || 'impayee',
      data.mode_paiement || null,
      data.date_paiement || null,
      data.observations || null,
      data.categorie || 'Services',
    ]
  );
  return await getPaiementById(result.insertId);
}

async function updatePaiement(id, data) {
  const pool = getPool();
  await pool.query(
    `UPDATE paiements SET numero=?, client=?, date_emission=?, date_echeance=?, montant=?, montant_paye=?, statut=?, mode_paiement=?, date_paiement=?, observations=?, categorie=? WHERE id=?`,
    [
      data.numero,
      data.client,
      data.date_emission,
      data.date_echeance,
      Number(data.montant || 0),
      Number(data.montant_paye || 0),
      data.statut || 'impayee',
      data.mode_paiement || null,
      data.date_paiement || null,
      data.observations || null,
      data.categorie || 'Services',
      id,
    ]
  );
  return await getPaiementById(id);
}

async function deletePaiement(id) {
  const pool = getPool();
  await pool.query('DELETE FROM paiements WHERE id = ?', [id]);
}

module.exports = { listPaiements, getPaiementById, createPaiement, updatePaiement, deletePaiement };


