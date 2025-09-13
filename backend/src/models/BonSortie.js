const { getPool } = require('../db');

async function listBonsSortie() {
	const pool = getPool();
	const [rows] = await pool.query('SELECT * FROM bons_sortie ORDER BY id DESC');
	return rows;
}

async function listBonsSortieByUser(userId) {
	const pool = getPool();
	const [rows] = await pool.query(
		'SELECT * FROM bons_sortie WHERE utilisateur_id = ? ORDER BY id DESC',
		[userId]
	);
	return rows;
}

async function getBonSortieById(id) {
	const pool = getPool();
	const [rows] = await pool.query('SELECT * FROM bons_sortie WHERE id = ?', [id]);
	return rows[0] || null;
}

async function createBonSortie(data) {
	const pool = getPool();
	const [result] = await pool.query(
		`INSERT INTO bons_sortie (numero_bon, date_sortie, district, commune, destinataire, utilisateur_id)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		[
			data.numero_bon,
			data.date_sortie,
			data.district,
			data.commune,
			data.destinataire,
			data.utilisateur_id || null,
		]
	);
	return await getBonSortieById(result.insertId);
}

async function updateBonSortie(id, data) {
	const pool = getPool();
	await pool.query(
		`UPDATE bons_sortie SET numero_bon=?, date_sortie=?, district=?, commune=?, destinataire=?, utilisateur_id=? WHERE id=?`,
		[
			data.numero_bon,
			data.date_sortie,
			data.district,
			data.commune,
			data.destinataire,
			data.utilisateur_id || null,
			id,
		]
	);
	return await getBonSortieById(id);
}

async function deleteBonSortie(id) {
	const pool = getPool();
	await pool.query('DELETE FROM bons_sortie WHERE id = ?', [id]);
}

async function listLignes(bonId) {
	const pool = getPool();
	const [rows] = await pool.query('SELECT * FROM lignes_sortie WHERE bon_sortie_id = ? ORDER BY id ASC', [bonId]);
	return rows;
}

async function replaceLignes(bonId, lignes) {
	const pool = getPool();
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();
		// Quantités avant remplacement
		const [beforeRows] = await conn.query(
			'SELECT article_id, SUM(quantite) as qty FROM lignes_sortie WHERE bon_sortie_id = ? GROUP BY article_id',
			[bonId]
		);

		// Supprimer anciennes lignes
		await conn.query('DELETE FROM lignes_sortie WHERE bon_sortie_id = ?', [bonId]);
		// Insérer nouvelles lignes avec validation stock
		for (const l of lignes) {
			// Vérifier stock disponible
			const [[art]] = await conn.query('SELECT stock_actuel FROM articles WHERE id = ?', [l.article_id]);
			const available = Number(art?.stock_actuel || 0);
			if (Number(l.quantite) > available) {
				throw new Error(`Stock insuffisant pour l'article ${l.article_id}. Disponible: ${available}`);
			}
			await conn.query(
				'INSERT INTO lignes_sortie (bon_sortie_id, article_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
				[bonId, l.article_id, Number(l.quantite), Number(l.prix_unitaire)]
			);
		}

		// Quantités après remplacement
		const [afterRows] = await conn.query(
			'SELECT article_id, SUM(quantite) as qty FROM lignes_sortie WHERE bon_sortie_id = ? GROUP BY article_id',
			[bonId]
		);

		// Mettre à jour stock: sortie => stock -= delta (jamais négatif)
		const beforeMap = new Map(beforeRows.map(r => [r.article_id, Number(r.qty)]));
		for (const r of afterRows) {
			const articleId = r.article_id;
			const afterQty = Number(r.qty || 0);
			const beforeQty = Number(beforeMap.get(articleId) || 0);
			const delta = afterQty - beforeQty; // quantité supplémentaire sortie
			if (delta !== 0) {
				await conn.query('UPDATE articles SET stock_actuel = GREATEST(0, stock_actuel - ?) WHERE id = ?', [delta, articleId]);
			}
			beforeMap.delete(articleId);
		}
		for (const [articleId, beforeQty] of beforeMap.entries()) {
			const delta = 0 - Number(beforeQty || 0); // lignes supprimées => on restitue du stock
			if (delta !== 0) {
				// delta est négatif, donc -delta restitue
				await conn.query('UPDATE articles SET stock_actuel = GREATEST(0, stock_actuel - ?) WHERE id = ?', [delta, articleId]);
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
	listBonsSortie,
	listBonsSortieByUser,
	getBonSortieById,
	createBonSortie,
	updateBonSortie,
	deleteBonSortie,
	listLignes,
	replaceLignes,
};



