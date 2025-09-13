const { listPaiements, getPaiementById, createPaiement, updatePaiement, deletePaiement } = require('../models/Paiement');

async function list(req, res) {
  try {
    const items = await listPaiements();
    return res.json({ items });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch paiements', error: e.message });
  }
}

async function getOne(req, res) {
  try {
    const id = Number(req.params.id);
    const item = await getPaiementById(id);
    if (!item) return res.status(404).json({ message: 'Paiement introuvable' });
    return res.json({ item });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch paiement', error: e.message });
  }
}

async function create(req, res) {
  try {
    const payload = req.body || {};
    if (!payload.numero) {
      const year = new Date(payload.date_emission || Date.now()).getFullYear();
      payload.numero = `FACT-${year}-${Math.floor(Math.random() * 900 + 100)}`;
    }
    const item = await createPaiement(payload);
    return res.status(201).json({ item });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to create paiement', error: e.message });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await getPaiementById(id);
    if (!existing) return res.status(404).json({ message: 'Paiement introuvable' });
    const item = await updatePaiement(id, { ...existing, ...req.body });
    return res.json({ item });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to update paiement', error: e.message });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    await deletePaiement(id);
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ message: 'Failed to delete paiement', error: e.message });
  }
}

module.exports = { list, getOne, create, update, remove };


