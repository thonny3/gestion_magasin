import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  Camera, 
  Settings,
  Bell,
  Shield,
  Palette,
  Key,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userManagementApi } from '../../utils/api';
import { User as UserType, UserRole } from '../../types';

export default function ProfileSettings() {
  const { user: authUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    role_id: ''
  });

  // États du changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // États des préférences
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailNotifications: true,
    darkMode: false,
    language: 'fr',
    timezone: 'Indian/Antananarivo'
  });

  // Charger les données de l'utilisateur
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const response = await userManagementApi.getProfile();
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setFormData({
          username: userData.username,
          email: userData.email || '',
          phone: userData.phone || '',
          role_id: userData.role_id?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les rôles
  const loadRoles = async () => {
    try {
      const response = await userManagementApi.listRoles();
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
      // Fallback avec des rôles par défaut
      setRoles([
        { id: 1, name: 'admin', display_name: 'Administrateur', description: 'Accès complet', permissions: ['all'], is_active: true },
        { id: 2, name: 'manager', display_name: 'Gestionnaire', description: 'Gestion des opérations', permissions: ['read', 'write', 'manage_users'], is_active: true },
        { id: 3, name: 'operator', display_name: 'Opérateur', description: 'Opérations quotidiennes', permissions: ['read', 'write'], is_active: true },
        { id: 4, name: 'viewer', display_name: 'Consultant', description: 'Consultation uniquement', permissions: ['read'], is_active: true }
      ]);
    }
  };

  useEffect(() => {
    loadUserData();
    loadRoles();
  }, [authUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userManagementApi.updateProfile(formData);
      if (response.data.success) {
        setUser(response.data.data);
        setIsEditing(false);
        showMessage('success', 'Profil mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      showMessage('error', 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await userManagementApi.changeProfilePassword({
        newPassword: passwordData.newPassword
      });
      if (response.data.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        showMessage('success', 'Mot de passe changé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      showMessage('error', 'Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      // Logique de suppression de compte
      logout();
    }
  };

  const getRoleDisplayName = (roleId: string) => {
    const role = roles.find(r => r.id.toString() === roleId);
    return role ? role.display_name : 'Aucun rôle';
  };

  if (isLoading && !user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Message de notification */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user?.username || authUser?.username}</h1>
              <p className="text-blue-100">{getRoleDisplayName(formData.role_id)}</p>
              <p className="text-blue-100 text-sm">
                Membre depuis {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Formes décoratives */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations du profil */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profil principal */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User size={24} className="mr-2 text-blue-600" />
                Informations du Profil
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </button>
            </div>

            <div className="space-y-6">
              {/* Photo de profil */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <Camera size={24} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Photo de profil</h3>
                  <p className="text-sm text-gray-600">JPG, PNG ou GIF. Max 2MB.</p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                    Changer la photo
                  </button>
                </div>
              </div>

              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                    placeholder="+261 XX XX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle
                  </label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => handleInputChange('role_id', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                  >
                    <option value="">Sélectionner un rôle</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Informations système */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Informations système</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Statut:</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user?.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                    }`}>
                      {user?.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dernière connexion:</span>
                    <span className="ml-2 text-gray-900">
                      {user?.last_login ? new Date(user.last_login).toLocaleString('fr-FR') : 'Jamais'}
                    </span>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      // Restaurer les données originales
                      if (user) {
                        setFormData({
                          username: user.username,
                          email: user.email || '',
                          phone: user.phone || '',
                          role_id: user.role_id?.toString() || ''
                        });
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sauvegarde...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Sauvegarder</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Changement de mot de passe */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Lock size={24} className="mr-2 text-blue-600" />
              Changer le Mot de Passe
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Entrez le nouveau mot de passe"
                  />
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showNewPassword ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirmez le nouveau mot de passe"
                  />
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={isLoading || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Changement...</span>
                    </>
                  ) : (
                    <>
                      <Key size={16} />
                      <span>Changer le mot de passe</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Préférences et actions */}
        <div className="space-y-6">
          {/* Préférences */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Settings size={24} className="mr-2 text-blue-600" />
              Préférences
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Notifications</p>
                    <p className="text-sm text-gray-600">Recevoir des notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Notifications email</p>
                    <p className="text-sm text-gray-600">Recevoir des emails</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Palette size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Mode sombre</p>
                    <p className="text-sm text-gray-600">Activer le thème sombre</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.darkMode}
                    onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Langue
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="mg">Malagasy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuseau horaire
                </label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Indian/Antananarivo">Antananarivo (GMT+3)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="Europe/Paris">Paris (GMT+1/+2)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions dangereuses */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Shield size={24} className="mr-2 text-red-600" />
              Actions Dangereuses
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-medium text-red-800 mb-2">Supprimer le compte</h3>
                <p className="text-sm text-red-600 mb-3">
                  Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Supprimer le compte</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}