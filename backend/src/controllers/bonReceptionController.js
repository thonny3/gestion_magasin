const {
	listBonsReception,
	listBonsReceptionByUser,
	getBonReceptionById,
	createBonReception,
	updateBonReception,
	deleteBonReception,
	listLignes,
	replaceLignes,
} = require('../models/BonReception');
const fs = require('fs');
const path = require('path');

async function list(req, res) {
	try {
		const isAdmin = req.user?.role === 'admin';
		const items = isAdmin
			? await listBonsReception()
			: await listBonsReceptionByUser(req.user?.userId);
		return res.json({ items });
	} catch (e) {
		return res.status(500).json({ message: 'Failed to fetch bons de réception', error: e.message });
	}
}

async function getOne(req, res) {
	try {
		const id = Number(req.params.id);
		const item = await getBonReceptionById(id);
		if (!item) return res.status(404).json({ message: 'Bon de réception introuvable' });
		// Authorization: non-admin can only access their own
		if (req.user?.role !== 'admin' && item.utilisateur_id !== req.user?.userId) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const lignes = await listLignes(id);
		return res.json({ item, lignes });
	} catch (e) {
		return res.status(500).json({ message: 'Failed to fetch bon de réception', error: e.message });
	}
}

async function create(req, res) {
	try {
		const payload = req.body || {};
		if (!payload.date_reception || !payload.district || !payload.commune || !payload.fournisseur) {
			return res.status(400).json({ message: 'Champs requis manquants' });
		}
		// Generate numero_bon if absent
		if (!payload.numero_bon) {
			const year = new Date(payload.date_reception).getFullYear();
			payload.numero_bon = `BR-${year}-${Math.floor(Math.random() * 900 + 100)}`;
		}
		const item = await createBonReception({ ...payload, utilisateur_id: req.user?.userId || null });
		return res.status(201).json({ item });
	} catch (e) {
		return res.status(500).json({ message: 'Failed to create bon de réception', error: e.message });
	}
}

async function update(req, res) {
	try {
		const id = Number(req.params.id);
		const existing = await getBonReceptionById(id);
		if (!existing) return res.status(404).json({ message: 'Bon de réception introuvable' });
		if (req.user?.role !== 'admin' && existing.utilisateur_id !== req.user?.userId) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const updated = await updateBonReception(id, { ...existing, ...req.body });
		return res.json({ item: updated });
	} catch (e) {
		return res.status(500).json({ message: 'Failed to update bon de réception', error: e.message });
	}
}

async function remove(req, res) {
	try {
		const id = Number(req.params.id);
		const existing = await getBonReceptionById(id);
		if (!existing) return res.status(404).json({ message: 'Bon de réception introuvable' });
		if (req.user?.role !== 'admin' && existing.utilisateur_id !== req.user?.userId) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		await deleteBonReception(id);
		return res.status(204).send();
	} catch (e) {
		return res.status(500).json({ message: 'Failed to delete bon de réception', error: e.message });
	}
}

async function saveLignes(req, res) {
	try {
		const id = Number(req.params.id);
		const existing = await getBonReceptionById(id);
		if (!existing) return res.status(404).json({ message: 'Bon de réception introuvable' });
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
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'bons_reception');
    fs.mkdirSync(uploadsDir, { recursive: true });
    const filename = `br_${id}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, filename);
    const base64Data = String(fileBase64).replace(/^data:application\/pdf;base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');
    const relPath = `/uploads/bons_reception/${filename}`;
    const pool = require('../db').getPool();
    await pool.query('UPDATE bons_reception SET pdf_path=? WHERE id=?', [relPath, id]);
    return res.json({ pdf_path: relPath });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to upload PDF', error: e.message });
  }
}

module.exports = { list, getOne, create, update, remove, saveLignes, uploadPdf };


