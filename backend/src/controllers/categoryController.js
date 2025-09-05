const {
	listCategories,
	getCategoryById,
	createCategory,
	updateCategory,
	deleteCategory,
} = require('../models/Category');

async function getAll(req, res) {
	try {
		const items = await listCategories();
		return res.json({ items });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
	}
}

async function getOne(req, res) {
	try {
		const item = await getCategoryById(Number(req.params.id));
		if (!item) return res.status(404).json({ message: 'Catégorie introuvable' });
		return res.json({ item });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch category', error: error.message });
	}
}

async function create(req, res) {
	try {
		const payload = req.body || {};
		if (!payload.nom || !payload.code) {
			return res.status(400).json({ message: 'nom et code sont requis' });
		}
		const item = await createCategory(payload);
		return res.status(201).json({ item });
	} catch (error) {
		if (error && error.code === 'ER_DUP_ENTRY') {
			return res.status(409).json({ message: 'Code de catégorie déjà existant' });
		}
		return res.status(500).json({ message: 'Failed to create category', error: error.message });
	}
}

async function update(req, res) {
	try {
		const id = Number(req.params.id);
		const existing = await getCategoryById(id);
		if (!existing) return res.status(404).json({ message: 'Catégorie introuvable' });
		const updated = await updateCategory(id, { ...existing, ...req.body });
		return res.json({ item: updated });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to update category', error: error.message });
	}
}

async function remove(req, res) {
	try {
		const id = Number(req.params.id);
		const existing = await getCategoryById(id);
		if (!existing) return res.status(404).json({ message: 'Catégorie introuvable' });
		await deleteCategory(id);
		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({ message: 'Failed to delete category', error: error.message });
	}
}

module.exports = { getAll, getOne, create, update, remove };


