const { getPool } = require('../db');

async function listBonsReception() {
	const pool = getPool();
	const [rows] = await pool.query('SELECT * FROM bons_reception ORDER BY id DESC');
	return rows;
}

async function listBonsReceptionByUser(userId) {
	const pool = getPool();
	const [rows] = await pool.query(
		'SELECT * FROM bons_reception WHERE utilisateur_id = ? ORDER BY id DESC',
		[userId]
	);
	return rows;
}

async function getBonReceptionById(id) {
	const pool = getPool();
	const [rows] = await pool.query('SELECT * FROM bons_reception WHERE id = ?', [id]);
	return rows[0] || null;
}

async function createBonReception(data) {
	const pool = getPool();
	const [result] = await pool.query(
		`INSERT INTO bons_reception (numero_bon, date_reception, district, commune, fournisseur, utilisateur_id)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		[
			data.numero_bon,
			data.date_reception,
			data.district,
			data.commune,
			data.fournisseur,
			data.utilisateur_id || null,
		]
	);
	return await getBonReceptionById(result.insertId);
}

async function updateBonReception(id, data) {
	const pool = getPool();
	await pool.query(
		`UPDATE bons_reception SET numero_bon=?, date_reception=?, district=?, commune=?, fournisseur=?, utilisateur_id=? WHERE id=?`,
		[
			data.numero_bon,
			data.date_reception,
			data.district,
			data.commune,
			data.fournisseur,
			data.utilisateur_id || null,
			id,
		]
	);
	return await getBonReceptionById(id);
}

async function deleteBonReception(id) {
	const pool = getPool();
	await pool.query('DELETE FROM bons_reception WHERE id = ?', [id]);
}

async function listLignes(bonId) {
	const pool = getPool();
	const [rows] = await pool.query('SELECT * FROM lignes_reception WHERE bon_reception_id = ? ORDER BY id ASC', [bonId]);
	return rows;
}

async function replaceLignes(bonId, lignes) {
	const pool = getPool();
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();
		// Quantités avant remplacement
		const [beforeRows] = await conn.query(
			'SELECT article_id, SUM(quantite) as qty FROM lignes_reception WHERE bon_reception_id = ? GROUP BY article_id',
			[bonId]
		);

		// Supprimer anciennes lignes
		await conn.query('DELETE FROM lignes_reception WHERE bon_reception_id = ?', [bonId]);
		// Insérer nouvelles lignes
		for (const l of lignes) {
			await conn.query(
				'INSERT INTO lignes_reception (bon_reception_id, article_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
				[bonId, l.article_id, Number(l.quantite), Number(l.prix_unitaire)]
			);
		}

		// Quantités après remplacement
		const [afterRows] = await conn.query(
			'SELECT article_id, SUM(quantite) as qty FROM lignes_reception WHERE bon_reception_id = ? GROUP BY article_id',
			[bonId]
		);

		// Mettre à jour stock: réception => stock += delta
		const beforeMap = new Map(beforeRows.map(r => [r.article_id, Number(r.qty)]));
		for (const r of afterRows) {
			const articleId = r.article_id;
			const afterQty = Number(r.qty || 0);
			const beforeQty = Number(beforeMap.get(articleId) || 0);
			const delta = afterQty - beforeQty;
			if (delta !== 0) {
				await conn.query('UPDATE articles SET stock_actuel = GREATEST(0, stock_actuel + ?) WHERE id = ?', [delta, articleId]);
			}
			beforeMap.delete(articleId);
		}
		for (const [articleId, beforeQty] of beforeMap.entries()) {
			const delta = 0 - Number(beforeQty || 0);
			if (delta !== 0) {
				await conn.query('UPDATE articles SET stock_actuel = GREATEST(0, stock_actuel + ?) WHERE id = ?', [delta, articleId]);
			}
		}

		await conn.commit();
	} catch (e) {
		await conn.rollback();
		throw e;
	} finally {
		conn.release();
	}
}

module.exports = {
	listBonsReception,
	listBonsReceptionByUser,
	getBonReceptionById,
	createBonReception,
	updateBonReception,
	deleteBonReception,
	listLignes,
	replaceLignes,
};


