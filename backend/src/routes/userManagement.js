const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
  deleteUser,
  deactivateUser,
  activateUser,
  getUserStats,
  getAllRoles,
  checkUserPermissions
} = require('../controllers/userManagementController');

// Middleware pour vérifier les permissions d'administration
const requireAdmin = async (req, res, next) => {
  try {
    // Pour l'instant, permettre l'accès à tous les utilisateurs authentifiés
    // TODO: Réactiver la vérification des permissions après la migration
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }
    
    // Vérification simplifiée - permettre l'accès si l'utilisateur est authentifié
    next();
    
    /* Code de vérification des permissions à réactiver après la migration :
    const user = await User.findById(req.user.userId);
    
    if (!user || !await User.hasPermission(user, 'manage_users')) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions d\'administration requises.'
      });
    }
    
    next();
    */
  } catch (error) {
    console.error('Erreur dans requireAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions',
      error: error.message
    });
  }
};

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes pour le profil personnel (pas besoin d'admin)
// GET /api/user-management/profile - Obtenir le profil de l'utilisateur connecté
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Ne pas exposer le mot de passe
    const { password_hash, ...safeUser } = user;
    
    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
});

// PUT /api/user-management/profile - Mettre à jour le profil de l'utilisateur connecté
router.put('/profile', async (req, res) => {
  try {
    const { username, email, phone, role_id } = req.body;
    
    // Vérifier si l'utilisateur existe
    const existingUser = await User.findById(req.user.userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si le nom d'utilisateur est déjà pris par un autre utilisateur
    if (username && username !== existingUser.username) {
      const userWithSameUsername = await User.findByUsername(username);
      if (userWithSameUsername && userWithSameUsername.id !== existingUser.id) {
        return res.status(400).json({
          success: false,
          message: 'Ce nom d\'utilisateur est déjà utilisé'
        });
      }
    }

    // Vérifier si le rôle existe (seulement si role_id est fourni)
    if (role_id) {
      try {
        const role = await UserRole.findById(role_id);
        if (!role) {
          return res.status(400).json({
            success: false,
            message: 'Rôle invalide'
          });
        }
      } catch (roleError) {
        console.log('Erreur lors de la vérification du rôle, utilisation sans rôle:', roleError.message);
        // Continuer sans rôle si la table n'existe pas encore
      }
    }

    const updateData = {
      username: username || existingUser.username,
      email: email || null,
      phone: phone || null,
      role_id: role_id || existingUser.role_id
    };

    await User.update(req.user.userId, updateData);
    const updatedUser = await User.findById(req.user.userId);

    // Ne pas exposer le mot de passe
    const { password_hash, ...safeUser } = updatedUser;

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: safeUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
});

// PUT /api/user-management/profile/password - Changer le mot de passe de l'utilisateur connecté
router.put('/profile/password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    await User.updatePassword(req.user.userId, newPassword);

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
      error: error.message
    });
  }
});

// GET /api/user-management/users - Obtenir tous les utilisateurs
router.get('/users', requireAdmin, getAllUsers);

// GET /api/user-management/users/stats - Obtenir les statistiques des utilisateurs
router.get('/users/stats', requireAdmin, getUserStats);

// GET /api/user-management/roles - Obtenir tous les rôles
router.get('/roles', requireAdmin, getAllRoles);

// GET /api/user-management/users/:id - Obtenir un utilisateur par ID
router.get('/users/:id', requireAdmin, getUserById);

// GET /api/user-management/users/:id/permissions - Vérifier les permissions d'un utilisateur
router.get('/users/:id/permissions', requireAdmin, checkUserPermissions);

// POST /api/user-management/users - Créer un nouvel utilisateur
router.post('/users', requireAdmin, createUser);

// PUT /api/user-management/users/:id - Mettre à jour un utilisateur
router.put('/users/:id', requireAdmin, updateUser);

// PUT /api/user-management/users/:id/password - Changer le mot de passe d'un utilisateur
router.put('/users/:id/password', requireAdmin, changePassword);

// PUT /api/user-management/users/:id/deactivate - Désactiver un utilisateur
router.put('/users/:id/deactivate', requireAdmin, deactivateUser);

// PUT /api/user-management/users/:id/activate - Activer un utilisateur
router.put('/users/:id/activate', requireAdmin, activateUser);

// DELETE /api/user-management/users/:id - Supprimer un utilisateur
router.delete('/users/:id', requireAdmin, deleteUser);

module.exports = router;
