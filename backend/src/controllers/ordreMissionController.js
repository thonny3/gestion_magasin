const OrdreMission = require('../models/OrdreMission');

// Générer un numéro d'ordre de mission unique
const generateNumeroOM = async () => {
  const { getPool } = require('../db');
  const pool = getPool();
  const year = new Date().getFullYear();
  const prefix = `OM${year}`;
  
  // Récupérer le dernier numéro de l'année
  const [rows] = await pool.query(
    `SELECT numero_om FROM ordres_mission 
     WHERE numero_om LIKE ? 
     ORDER BY numero_om DESC LIMIT 1`,
    [`${prefix}%`]
  );
  
  if (rows.length === 0) {
    return `${prefix}001`;
  }
  
  const lastNumber = rows[0].numero_om.replace(prefix, '');
  const nextNumber = String(parseInt(lastNumber) + 1).padStart(3, '0');
  return `${prefix}${nextNumber}`;
};

// Obtenir tous les ordres de mission
const getAllOrdresMission = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      statut,
      nom_personne,
      fonction,
      date_depart_debut,
      date_depart_fin
    } = req.query;

    const filters = {
      statut,
      nom_personne,
      fonction,
      date_depart_debut,
      date_depart_fin
    };

    const offset = (page - 1) * limit;
    const ordres = await OrdreMission.findAll({
      ...filters,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await OrdreMission.count(filters);

    res.json({
      success: true,
      data: ordres,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ordres de mission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des ordres de mission',
      error: error.message
    });
  }
};

// Obtenir un ordre de mission par ID
const getOrdreMissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const ordre = await OrdreMission.findById(id);

    if (!ordre) {
      return res.status(404).json({
        success: false,
        message: 'Ordre de mission non trouvé'
      });
    }

    res.json({
      success: true,
      data: ordre
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ordre de mission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'ordre de mission',
      error: error.message
    });
  }
};

// Créer un nouvel ordre de mission
const createOrdreMission = async (req, res) => {
  try {
    const {
      nom_personne,
      fonction,
      moto_no,
      districts_visites,
      date_depart,
      km_depart = 0,
      date_arrivee,
      km_arrivee = 0,
      statut = 'en_cours',
      observations
    } = req.body;

    // Validation des champs obligatoires
    if (!nom_personne || !fonction || !date_depart) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom_personne, fonction et date_depart sont obligatoires'
      });
    }

    // Générer le numéro d'ordre de mission
    const numero_om = await generateNumeroOM();

    const ordreData = {
      numero_om,
      nom_personne,
      fonction,
      moto_no: moto_no || null,
      districts_visites: districts_visites || null,
      date_depart,
      km_depart,
      date_arrivee: date_arrivee || null,
      km_arrivee,
      statut,
      observations: observations || null,
      utilisateur_id: req.user?.userId || null
    };

    const id = await OrdreMission.create(ordreData);
    const newOrdre = await OrdreMission.findById(id);

    res.status(201).json({
      success: true,
      message: 'Ordre de mission créé avec succès',
      data: newOrdre
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'ordre de mission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'ordre de mission',
      error: error.message
    });
  }
};

// Mettre à jour un ordre de mission
const updateOrdreMission = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier que l'ordre existe
    const existingOrdre = await OrdreMission.findById(id);
    if (!existingOrdre) {
      return res.status(404).json({
        success: false,
        message: 'Ordre de mission non trouvé'
      });
    }

    // Ne pas permettre la modification du numéro d'ordre
    if (updateData.numero_om) {
      delete updateData.numero_om;
    }

    const updatedOrdre = await OrdreMission.update(id, updateData);

    res.json({
      success: true,
      message: 'Ordre de mission mis à jour avec succès',
      data: updatedOrdre
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre de mission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'ordre de mission',
      error: error.message
    });
  }
};

// Supprimer un ordre de mission
const deleteOrdreMission = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'ordre existe
    const existingOrdre = await OrdreMission.findById(id);
    if (!existingOrdre) {
      return res.status(404).json({
        success: false,
        message: 'Ordre de mission non trouvé'
      });
    }

    await OrdreMission.delete(id);

    res.json({
      success: true,
      message: 'Ordre de mission supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'ordre de mission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'ordre de mission',
      error: error.message
    });
  }
};

// Obtenir les statistiques des ordres de mission
const getOrdresMissionStats = async (req, res) => {
  try {
    const stats = await OrdreMission.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Marquer un ordre de mission comme terminé
const completeOrdreMission = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_arrivee, km_arrivee, observations } = req.body;

    if (!date_arrivee || km_arrivee === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Les champs date_arrivee et km_arrivee sont obligatoires pour terminer la mission'
      });
    }

    const updateData = {
      statut: 'termine',
      date_arrivee,
      km_arrivee,
      observations: observations || null
    };

    const updatedOrdre = await OrdreMission.update(id, updateData);

    res.json({
      success: true,
      message: 'Ordre de mission marqué comme terminé',
      data: updatedOrdre
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation de l\'ordre de mission:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la finalisation de l\'ordre de mission',
      error: error.message
    });
  }
};

module.exports = {
  getAllOrdresMission,
  getOrdreMissionById,
  createOrdreMission,
  updateOrdreMission,
  deleteOrdreMission,
  getOrdresMissionStats,
  completeOrdreMission
};
