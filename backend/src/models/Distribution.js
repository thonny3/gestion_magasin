const { getPool } = require('../db');

async function listDistributions() {
	const pool = getPool();
	const [rows] = await pool.query('SELECT * FROM distributions ORDER BY id DESC');
	return rows;
}

async function getDistributionById(id) {
	const pool = getPool();
	const [rows] = await pool.query('SELECT * FROM distributions WHERE id = ?', [id]);
	return rows[0] || null;
}

async function createDistribution(data) {
	const pool = getPool();
	const [result] = await pool.query(
		`INSERT INTO distributions (reference, titre, description, destination, date_planification, date_execution, statut, priorite, responsable, vehicule, beneficiaires, observations, coord_lat, coord_lng)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			data.reference,
			data.titre,
			data.description || null,
			data.destination,
			data.date_planification,
			data.date_execution || null,
			data.statut || 'planifie',
			data.priorite || 'normale',
			data.responsable,
			data.vehicule || null,
			Number(data.beneficiaires || 0),
			data.observations || null,
			data.coord_lat || null,
			data.coord_lng || null,
		]
	);
	return await getDistributionById(result.insertId);
}

async function updateDistribution(id, data) {
	const pool = getPool();
	await pool.query(
		`UPDATE distributions SET reference=?, titre=?, description=?, destination=?, date_planification=?, date_execution=?, statut=?, priorite=?, responsable=?, vehicule=?, beneficiaires=?, observations=?, coord_lat=?, coord_lng=? WHERE id=?`,
		[
			data.reference,
			data.titre,
			data.description || null,
			data.destination,
			data.date_planification,
			data.date_execution || null,
			data.statut || 'planifie',
			data.priorite || 'normale',
			data.responsable,
			data.vehicule || null,
			Number(data.beneficiaires || 0),
			data.observations || null,
			data.coord_lat || null,
			data.coord_lng || null,
			id,
		]
	);
	return await getDistributionById(id);
}

async function deleteDistribution(id) {
	const pool = getPool();
	await pool.query('DELETE FROM distributions WHERE id = ?', [id]);
}

module.exports = { listDistributions, getDistributionById, createDistribution, updateDistribution, deleteDistribution };
