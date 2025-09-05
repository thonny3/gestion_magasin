const { listDistributions, getDistributionById, createDistribution, updateDistribution, deleteDistribution } = require('../models/Distribution');

async function list(req, res) {
  try {
    const items = await listDistributions();
    return res.json({ items });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch distributions', error: e.message });
  }
}

async function getOne(req, res) {
  try {
    const id = Number(req.params.id);
    const item = await getDistributionById(id);
    if (!item) return res.status(404).json({ message: 'Distribution introuvable' });
    return res.json({ item });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch distribution', error: e.message });
  }
}

async function create(req, res) {
  try {
    const payload = req.body || {};
    if (!payload.reference) {
      const year = new Date(payload.date_planification || Date.now()).getFullYear();
      payload.reference = `DIST-${year}-${Math.floor(Math.random() * 900 + 100)}`;
    }
    const item = await createDistribution(payload);
    return res.status(201).json({ item });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to create distribution', error: e.message });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await getDistributionById(id);
    if (!existing) return res.status(404).json({ message: 'Distribution introuvable' });
    const item = await updateDistribution(id, { ...existing, ...req.body });
    return res.json({ item });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to update distribution', error: e.message });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    await deleteDistribution(id);
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ message: 'Failed to delete distribution', error: e.message });
  }
}

module.exports = { list, getOne, create, update, remove };
