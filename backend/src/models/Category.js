const { getPool } = require('../db');

async function listCategories() {
	const pool = getPool();
	const [rows] = await pool.query(`
		SELECT c.*, (
			SELECT COUNT(*) FROM articles a WHERE a.categorie = c.nom
		) AS nbArticles
		FROM categories c
		ORDER BY c.nom ASC
	`);
	return rows;
}

async function getCategoryById(id) {
	const pool = getPool();
	const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
	return rows[0] || null;
}

async function createCategory(data) {
	const pool = getPool();
	const [result] = await pool.query(
		'INSERT INTO categories (nom, code, description, couleur) VALUES (?, ?, ?, ?)',
		[data.nom, data.code, data.description || null, data.couleur || null]
	);
	return await getCategoryById(result.insertId);
}

async function updateCategory(id, data) {
	const pool = getPool();
	await pool.query(
		'UPDATE categories SET nom=?, code=?, description=?, couleur=? WHERE id=?',
		[data.nom, data.code, data.description || null, data.couleur || null, id]
	);
	return await getCategoryById(id);
}

async function deleteCategory(id) {
	const pool = getPool();
	await pool.query('DELETE FROM categories WHERE id = ?', [id]);
}

module.exports = { listCategories, getCategoryById, createCategory, updateCategory, deleteCategory };


