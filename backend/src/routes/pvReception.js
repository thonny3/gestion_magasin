const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllPVReception,
  getPVReceptionById,
  createPVReception,
  updatePVReception,
  deletePVReception,
  getPVReceptionStats,
  finalizePVReception,
  getBonsReception
} = require('../controllers/pvReceptionController');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// GET /api/pv-reception - Obtenir tous les PV de réception
router.get('/', getAllPVReception);

// GET /api/pv-reception/stats - Obtenir les statistiques
router.get('/stats', getPVReceptionStats);

// GET /api/pv-reception/bons-reception - Obtenir la liste des bons de réception
router.get('/bons-reception', getBonsReception);

// GET /api/pv-reception/:id - Obtenir un PV par ID
router.get('/:id', getPVReceptionById);

// POST /api/pv-reception - Créer un nouveau PV de réception
router.post('/', createPVReception);

// PUT /api/pv-reception/:id - Mettre à jour un PV de réception
router.put('/:id', updatePVReception);

// PUT /api/pv-reception/:id/finalize - Finaliser un PV de réception
router.put('/:id/finalize', finalizePVReception);

// DELETE /api/pv-reception/:id - Supprimer un PV de réception
router.delete('/:id', deletePVReception);

module.exports = router;

