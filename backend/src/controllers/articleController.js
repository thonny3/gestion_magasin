const {
	listArticles,
	getArticleById,
	createArticle,
	updateArticle,
	deleteArticle,
} = require('../models/Article');

async function getAll(req, res) {
	try {
		const items = await listArticles();
		return res.json({ items });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch articles', error: error.message });
	}
}

async function getOne(req, res) {
	try {
		const item = await getArticleById(Number(req.params.id));
		if (!item) return res.status(404).json({ message: 'Article introuvable' });
		return res.json({ item });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch article', error: error.message });
	}
}

async function create(req, res) {
	try {
		const payload = req.body || {};
		if (!payload.code_article || !payload.designation) {
			return res.status(400).json({ message: 'code_article et designation sont requis' });
		}
		const item = await createArticle(payload);
		return res.status(201).json({ item });
	} catch (error) {
		if (error && error.code === 'ER_DUP_ENTRY') {
			return res.status(409).json({ message: 'Code article déjà existant' });
		}
		return res.status(500).json({ message: 'Failed to create article', error: error.message });
	}
}

async function update(req, res) {
	try {
		const id = Number(req.params.id);
		const existing = await getArticleById(id);
		if (!existing) return res.status(404).json({ message: 'Article introuvable' });
		const updated = await updateArticle(id, { ...existing, ...req.body });
		return res.json({ item: updated });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to update article', error: error.message });
	}
}

async function remove(req, res) {
	try {
		const id = Number(req.params.id);
		const existing = await getArticleById(id);
		if (!existing) return res.status(404).json({ message: 'Article introuvable' });
		await deleteArticle(id);
		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({ message: 'Failed to delete article', error: error.message });
	}
}

module.exports = { getAll, getOne, create, update, remove };


