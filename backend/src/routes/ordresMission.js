const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllOrdresMission,
  getOrdreMissionById,
  createOrdreMission,
  updateOrdreMission,
  deleteOrdreMission,
  getOrdresMissionStats,
  completeOrdreMission
} = require('../controllers/ordreMissionController');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// GET /api/ordres-mission - Obtenir tous les ordres de mission
router.get('/', getAllOrdresMission);

// GET /api/ordres-mission/stats - Obtenir les statistiques
router.get('/stats', getOrdresMissionStats);

// GET /api/ordres-mission/:id - Obtenir un ordre de mission par ID
router.get('/:id', getOrdreMissionById);

// POST /api/ordres-mission - Créer un nouvel ordre de mission
router.post('/', createOrdreMission);

// PUT /api/ordres-mission/:id - Mettre à jour un ordre de mission
router.put('/:id', updateOrdreMission);

// PUT /api/ordres-mission/:id/complete - Marquer un ordre de mission comme terminé
router.put('/:id/complete', completeOrdreMission);

// DELETE /api/ordres-mission/:id - Supprimer un ordre de mission
router.delete('/:id', deleteOrdreMission);

module.exports = router;
