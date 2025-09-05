const User = require('../models/User');
const UserRole = require('../models/UserRole');

// Obtenir tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      is_active,
      role_id,
      username,
      email
    } = req.query;

    const filters = {
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      role_id,
      username,
      email
    };

    const offset = (page - 1) * limit;
    const users = await User.findAll({
      ...filters,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Ne pas exposer les mots de passe
    const safeUsers = users.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });

    res.json({
      success: true,
      data: safeUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// Obtenir un utilisateur par ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

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
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

// Créer un nouvel utilisateur
const createUser = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      phone,
      role_id
    } = req.body;

    // Validation des champs obligatoires
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Le nom d\'utilisateur et le mot de passe sont obligatoires'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ce nom d\'utilisateur existe déjà'
      });
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

    const userData = {
      username,
      password,
      email: email || null,
      phone: phone || null,
      role_id: role_id || null
    };

    const id = await User.create(userData);
    const newUser = await User.findById(id);

    // Ne pas exposer le mot de passe
    const { password_hash, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: safeUser
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    
    // Si la table n'a pas les nouvelles colonnes, essayer avec l'ancienne méthode
    if (error.code === 'ER_BAD_FIELD_ERROR' || error.message.includes('role_id')) {
      try {
        const { username, password } = req.body;
        const id = await User.createUser(username, password, 'user');
        
        return res.status(201).json({
          success: true,
          message: 'Utilisateur créé avec succès (mode compatibilité)',
          data: { id, username, role: 'user' }
        });
      } catch (fallbackError) {
        console.error('Erreur lors de la création en mode compatibilité:', fallbackError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
};

// Mettre à jour un utilisateur
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier que l'utilisateur existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si le rôle existe
    if (updateData.role_id) {
      const role = await UserRole.findById(updateData.role_id);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Rôle invalide'
        });
      }
    }

    // Ne pas permettre la modification du mot de passe via cette route
    if (updateData.password) {
      delete updateData.password;
    }

    const updatedUser = await User.update(id, updateData);

    // Ne pas exposer le mot de passe
    const { password_hash, ...safeUser } = updatedUser;

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: safeUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
};

// Changer le mot de passe d'un utilisateur
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe est obligatoire'
      });
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    await User.updatePassword(id, newPassword);

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
      error: error.message
    });
  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher la suppression de son propre compte
    if (req.user && req.user.userId && parseInt(req.user.userId) === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    await User.delete(id);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
};

// Désactiver un utilisateur
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher la désactivation de son propre compte
    if (req.user && req.user.userId && parseInt(req.user.userId) === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas désactiver votre propre compte'
      });
    }

    await User.deactivate(id);

    res.json({
      success: true,
      message: 'Utilisateur désactivé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la désactivation de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la désactivation de l\'utilisateur',
      error: error.message
    });
  }
};

// Activer un utilisateur
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    await User.activate(id);

    res.json({
      success: true,
      message: 'Utilisateur activé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'activation de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'activation de l\'utilisateur',
      error: error.message
    });
  }
};

// Obtenir les statistiques des utilisateurs
const getUserStats = async (req, res) => {
  try {
    const stats = await User.getStats();

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

// Obtenir tous les rôles
const getAllRoles = async (req, res) => {
  try {
    const roles = await UserRole.findAll({ is_active: true });

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    
    // Si la table n'existe pas encore, retourner des rôles par défaut
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes('user_roles')) {
      const defaultRoles = [
        { id: 1, name: 'admin', display_name: 'Administrateur', description: 'Accès complet', permissions: ['all'], is_active: true },
        { id: 2, name: 'manager', display_name: 'Gestionnaire', description: 'Gestion des opérations', permissions: ['read', 'write', 'manage_users'], is_active: true },
        { id: 3, name: 'operator', display_name: 'Opérateur', description: 'Opérations quotidiennes', permissions: ['read', 'write'], is_active: true },
        { id: 4, name: 'viewer', display_name: 'Consultant', description: 'Consultation uniquement', permissions: ['read'], is_active: true }
      ];
      
      return res.json({
        success: true,
        data: defaultRoles
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rôles',
      error: error.message
    });
  }
};

// Vérifier les permissions d'un utilisateur
const checkUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const hasPermission = await User.hasPermission(user, permission);

    res.json({
      success: true,
      data: {
        hasPermission,
        user: {
          id: user.id,
          username: user.username,
          role_name: user.role_name,
          role_permissions: user.role_permissions
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions',
      error: error.message
    });
  }
};

module.exports = {
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
};
