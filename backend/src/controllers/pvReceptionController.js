const PVReception = require('../models/PVReception');

// Générer un numéro de PV unique
const generateNumeroPV = async () => {
  const { getPool } = require('../db');
  const pool = getPool();
  const year = new Date().getFullYear();
  const prefix = `PV${year}`;
  
  // Récupérer le dernier numéro de l'année
  const [rows] = await pool.query(
    `SELECT numero_pv FROM pv_reception 
     WHERE numero_pv LIKE ? 
     ORDER BY numero_pv DESC LIMIT 1`,
    [`${prefix}%`]
  );
  
  if (rows.length === 0) {
    return `${prefix}001`;
  }
  
  const lastNumber = rows[0].numero_pv.replace(prefix, '');
  const nextNumber = String(parseInt(lastNumber) + 1).padStart(3, '0');
  return `${prefix}${nextNumber}`;
};

// Obtenir tous les PV de réception
const getAllPVReception = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      statut,
      fournisseur,
      numero_pv,
      date_pv_debut,
      date_pv_fin
    } = req.query;

    const filters = {
      statut,
      fournisseur,
      numero_pv,
      date_pv_debut,
      date_pv_fin
    };

    const offset = (page - 1) * limit;
    const pvs = await PVReception.findAll({
      ...filters,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await PVReception.count(filters);

    res.json({
      success: true,
      data: pvs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des PV de réception:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des PV de réception',
      error: error.message
    });
  }
};

// Obtenir un PV par ID
const getPVReceptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const pv = await PVReception.findById(id);

    if (!pv) {
      return res.status(404).json({
        success: false,
        message: 'PV de réception non trouvé'
      });
    }

    res.json({
      success: true,
      data: pv
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du PV de réception:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du PV de réception',
      error: error.message
    });
  }
};

// Créer un nouveau PV de réception
const createPVReception = async (req, res) => {
  try {
    const {
      id_bon_reception,
      date_pv,
      adresse,
      fournisseur,
      livreur,
      telephone_livreur,
      details_articles,
      observations,
      statut = 'draft'
    } = req.body;

    // Validation des champs obligatoires
    if (!date_pv || !adresse || !fournisseur) {
      return res.status(400).json({
        success: false,
        message: 'Les champs date_pv, adresse et fournisseur sont obligatoires'
      });
    }

    // Générer le numéro de PV
    const numero_pv = await generateNumeroPV();

    const pvData = {
      numero_pv,
      id_bon_reception: id_bon_reception || null,
      date_pv,
      adresse,
      fournisseur,
      livreur: livreur || null,
      telephone_livreur: telephone_livreur || null,
      details_articles: details_articles || null,
      observations: observations || null,
      statut,
      utilisateur_id: req.user?.userId || null
    };

    const id = await PVReception.create(pvData);
    const newPV = await PVReception.findById(id);

    res.status(201).json({
      success: true,
      message: 'PV de réception créé avec succès',
      data: newPV
    });
  } catch (error) {
    console.error('Erreur lors de la création du PV de réception:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du PV de réception',
      error: error.message
    });
  }
};

// Mettre à jour un PV de réception
const updatePVReception = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier que le PV existe
    const existingPV = await PVReception.findById(id);
    if (!existingPV) {
      return res.status(404).json({
        success: false,
        message: 'PV de réception non trouvé'
      });
    }

    // Ne pas permettre la modification du numéro de PV
    if (updateData.numero_pv) {
      delete updateData.numero_pv;
    }

    const updatedPV = await PVReception.update(id, updateData);

    res.json({
      success: true,
      message: 'PV de réception mis à jour avec succès',
      data: updatedPV
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du PV de réception:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du PV de réception',
      error: error.message
    });
  }
};

// Supprimer un PV de réception
const deletePVReception = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le PV existe
    const existingPV = await PVReception.findById(id);
    if (!existingPV) {
      return res.status(404).json({
        success: false,
        message: 'PV de réception non trouvé'
      });
    }

    await PVReception.delete(id);

    res.json({
      success: true,
      message: 'PV de réception supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du PV de réception:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du PV de réception',
      error: error.message
    });
  }
};

// Obtenir les statistiques des PV de réception
const getPVReceptionStats = async (req, res) => {
  try {
    const stats = await PVReception.getStats();

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

// Finaliser un PV de réception
const finalizePVReception = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le PV existe
    const existingPV = await PVReception.findById(id);
    if (!existingPV) {
      return res.status(404).json({
        success: false,
        message: 'PV de réception non trouvé'
      });
    }

    const updateData = {
      statut: 'finalise'
    };

    const updatedPV = await PVReception.update(id, updateData);

    res.json({
      success: true,
      message: 'PV de réception finalisé avec succès',
      data: updatedPV
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation du PV de réception:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la finalisation du PV de réception',
      error: error.message
    });
  }
};

// Obtenir la liste des bons de réception
const getBonsReception = async (req, res) => {
  try {
    const bons = await PVReception.getBonsReception();

    res.json({
      success: true,
      data: bons
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des bons de réception:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des bons de réception',
      error: error.message
    });
  }
};

module.exports = {
  getAllPVReception,
  getPVReceptionById,
  createPVReception,
  updatePVReception,
  deletePVReception,
  getPVReceptionStats,
  finalizePVReception,
  getBonsReception
};

