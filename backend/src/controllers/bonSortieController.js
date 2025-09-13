const {
	listBonsSortie,
	listBonsSortieByUser,
	getBonSortieById,
	createBonSortie,
	updateBonSortie,
	deleteBonSortie,
	listLignes,
	replaceLignes,
} = require('../models/BonSortie');
const fs = require('fs');
const path = require('path');

async function list(req, res) {
	try {
		const isAdmin = req.user?.role === 'admin';
		const items = isAdmin
			? await listBonsSortie()
			: await listBonsSortieByUser(req.user?.userId);
		return res.json({ items });
	} catch (e) {
		return res.status(500).json({ message: 'Failed to fetch bons de sortie', error: e.message });
	}
}

async function getOne(req, res) {
	try {
		const id = Number(req.params.id);
		const item = await getBonSortieById(id);
		if (!item) return res.status(404).json({ message: 'Bon de sortie introuvable' });
		if (req.user?.role !== 'admin' && item.utilisateur_id !== req.user?.userId) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const lignes = await listLignes(id);
		return res.json({ item, lignes });
	} catch (e) {
		return res.status(500).json({ message: 'Failed to fetch bon de sortie', error: e.message });
	}
}

async function create(req, res) {
	try {
		const payload = req.body || {};
		if (!payload.date_sortie || !payload.district || !payload.commune || !payload.destinataire) {
			return res.status(400).json({ message: 'Champs requis manquants' });
		}
		if (!payload.numero_bon) {
			const year = new Date(payload.date_sortie).getFullYear();
			payload.numero_bon = `BS-${year}-${Math.floor(Math.random() * 900 + 100)}`;
		}
		const item = await createBonSortie({ ...payload, utilisateur_id: req.user?.userId || null });
		return res.status(201).json({ item });
	} catch (e) {
		return res.status(500).json({ message: 'Failed to create bon de sortie', error: e.message });
	}
}

async function update(req, res) {
	try {
		const id = Number(req.params.id);
		const existing = await getBonSortieById(id);
		if (!existing) return res.status(404).json({ message: 'Bon de sortie introuvable' });
		if (req.user?.role !== 'admin' && existing.utilisateur_id !== req.user?.userId) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const updated = await updateBonSortie(id, { ...existing, ...req.body });
		return res.json({ item: updated });
	} catch (e) {
		return res.status(500).json({ message: 'Failed to update bon de sortie', error: e.message });
	}
}

async function remove(req, res) {
	try {
		const id = Number(req.params.id);
		const existing = await getBonSortieById(id);
		if (!existing) return res.status(404).json({ message: 'Bon de sortie introuvable' });
		if (req.user?.role !== 'admin' && existing.utilisateur_id !== req.user?.userId) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		await deleteBonSortie(id);
		return res.status(204).send();
	} catch (e) {
		return res.status(500).json({ message: 'Failed to delete bon de sortie', error: e.message });
	}
}

async function saveLignes(req, res) {
	try {
		const id = Number(req.params.id);
		const existing = await getBonSortieById(id);
		if (!existing) return res.status(404).json({ message: 'Bon de sortie introuvable' });
		if (req.user?.role !== 'admin' && existing.utilisateur_id !== req.user?.userId) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		await replaceLignes(id, req.body?.lignes || []);
		const lignes = await listLignes(id);
		return res.json({ lignes });
	} catch (e) {
		return res.status(500).json({ message: 'Failed to save lignes', error: e.message });
	}
}

async function uploadPdf(req, res) {
  try {
    const id = Number(req.params.id);
    const { fileBase64 } = req.body || {};
    if (!fileBase64) return res.status(400).json({ message: 'fileBase64 requis' });
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'bons_sortie');
    fs.mkdirSync(uploadsDir, { recursive: true });
    const filename = `bs_${id}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, filename);
    const base64Data = String(fileBase64).replace(/^data:application\/pdf;base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');
    const relPath = `/uploads/bons_sortie/${filename}`;
    const pool = require('../db').getPool();
    await pool.query('UPDATE bons_sortie SET pdf_path=? WHERE id=?', [relPath, id]);
    return res.json({ pdf_path: relPath });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to upload PDF', error: e.message });
  }
}

module.exports = { list, getOne, create, update, remove, saveLignes, uploadPdf };



