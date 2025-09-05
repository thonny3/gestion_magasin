const { getPool } = require('../db');

async function listArticles() {
	const pool = getPool();
	const [rows] = await pool.query('SELECT * FROM articles ORDER BY id DESC');
	return rows;
}

async function getArticleById(id) {
	const pool = getPool();
	const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);
	return rows[0] || null;
}

async function createArticle(data) {
	const pool = getPool();
	const [result] = await pool.query(
		`INSERT INTO articles (code_article, designation, description, unite_mesure, categorie, prix_unitaire, stock_minimum, stock_actuel, fournisseur, marque, reference_fournisseur, emplacement, date_peremption, numero_lot, statut)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			data.code_article,
			data.designation,
			data.description || null,
			data.unite_mesure || 'pièce',
			data.categorie || null,
			Number(data.prix_unitaire || 0),
			Number(data.stock_minimum || 0),
			Number(data.stock_actuel || 0),
			data.fournisseur || null,
			data.marque || null,
			data.reference_fournisseur || null,
			data.emplacement || null,
			data.date_peremption || null,
			data.numero_lot || null,
			data.statut || 'actif',
		]
	);
	return await getArticleById(result.insertId);
}

async function updateArticle(id, data) {
	const pool = getPool();
	await pool.query(
		`UPDATE articles SET code_article=?, designation=?, description=?, unite_mesure=?, categorie=?, prix_unitaire=?, stock_minimum=?, stock_actuel=?, fournisseur=?, marque=?, reference_fournisseur=?, emplacement=?, date_peremption=?, numero_lot=?, statut=? WHERE id=?`,
		[
			data.code_article,
			data.designation,
			data.description || null,
			data.unite_mesure || 'pièce',
			data.categorie || null,
			Number(data.prix_unitaire || 0),
			Number(data.stock_minimum || 0),
			Number(data.stock_actuel || 0),
			data.fournisseur || null,
			data.marque || null,
			data.reference_fournisseur || null,
			data.emplacement || null,
			data.date_peremption || null,
			data.numero_lot || null,
			data.statut || 'actif',
			id,
		]
	);
	return await getArticleById(id);
}

async function deleteArticle(id) {
	const pool = getPool();
	await pool.query('DELETE FROM articles WHERE id = ?', [id]);
}

module.exports = { listArticles, getArticleById, createArticle, updateArticle, deleteArticle };


