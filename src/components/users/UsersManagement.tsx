import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import { userManagementApi } from '../../utils/api';
import { User, UserRole, UserStats } from '../../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Key,
  UserCheck,
  UserX,
  Crown,
  Settings,
  BarChart3
} from 'lucide-react';

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    active_last_30_days: 0,
    by_role: []
  });

  const [addForm, setAddForm] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    role_id: ''
  });

  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phone: '',
    role_id: '',
    is_active: true
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Charger les utilisateurs
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userManagementApi.listUsers({
        page: 1,
        limit: 100,
        is_active: filterStatus === 'all' ? undefined : filterStatus === 'active',
        role_id: filterRole === 'all' ? undefined : filterRole,
        username: searchTerm || undefined
      });
      
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les rôles
  const loadRoles = async () => {
    try {
      console.log('Chargement des rôles...');
      const response = await userManagementApi.listRoles();
      console.log('Réponse des rôles:', response);
      if (response.data.success) {
        setRoles(response.data.data);
        console.log('Rôles chargés:', response.data.data);
      } else {
        console.error('Erreur dans la réponse des rôles:', response.data);
        // Fallback avec des rôles par défaut
        setRoles([
          { id: 1, name: 'admin', display_name: 'Administrateur', description: 'Accès complet', permissions: ['all'], is_active: true },
          { id: 2, name: 'manager', display_name: 'Gestionnaire', description: 'Gestion des opérations', permissions: ['read', 'write', 'manage_users'], is_active: true },
          { id: 3, name: 'operator', display_name: 'Opérateur', description: 'Opérations quotidiennes', permissions: ['read', 'write'], is_active: true },
          { id: 4, name: 'viewer', display_name: 'Consultant', description: 'Consultation uniquement', permissions: ['read'], is_active: true }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
      // Fallback avec des rôles par défaut en cas d'erreur
      setRoles([
        { id: 1, name: 'admin', display_name: 'Administrateur', description: 'Accès complet', permissions: ['all'], is_active: true },
        { id: 2, name: 'manager', display_name: 'Gestionnaire', description: 'Gestion des opérations', permissions: ['read', 'write', 'manage_users'], is_active: true },
        { id: 3, name: 'operator', display_name: 'Opérateur', description: 'Opérations quotidiennes', permissions: ['read', 'write'], is_active: true },
        { id: 4, name: 'viewer', display_name: 'Consultant', description: 'Consultation uniquement', permissions: ['read'], is_active: true }
      ]);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const response = await userManagementApi.getUserStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [filterRole, filterStatus, searchTerm]);

  // Charger les rôles une seule fois au démarrage
  useEffect(() => {
    loadRoles();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [users, searchTerm]);

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'manager': return 'text-blue-600 bg-blue-100';
      case 'operator': return 'text-teal-600 bg-teal-100';
      case 'viewer': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle size={16} /> : <XCircle size={16} />;
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'admin': return <Crown size={16} />;
      case 'manager': return <Settings size={16} />;
      case 'operator': return <Users size={16} />;
      case 'viewer': return <Eye size={16} />;
      default: return <Users size={16} />;
    }
  };

  const handleCreate = async () => {
    try {
      if (!addForm.username || !addForm.password) {
        alert('Veuillez remplir les champs obligatoires');
        return;
      }

      if (addForm.password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      const response = await userManagementApi.createUser(addForm);
      if (response.data.success) {
        await loadUsers();
        await loadStats();
        setShowUserModal(false);
        setAddForm({
          username: '',
          password: '',
          email: '',
          phone: '',
          role_id: ''
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email || '',
      phone: user.phone || '',
      role_id: user.role_id?.toString() || '',
      is_active: user.is_active
    });
    setShowUserModal(true);
  };

  const handleUpdate = async () => {
    try {
      if (!selectedUser || !editForm.username) {
        alert('Veuillez remplir les champs obligatoires');
        return;
      }

      const response = await userManagementApi.updateUser(selectedUser.id, editForm);
      if (response.data.success) {
        await loadUsers();
        await loadStats();
        setShowUserModal(false);
        setSelectedUser(null);
        setEditForm({
          username: '',
          email: '',
          phone: '',
          role_id: '',
          is_active: true
        });
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await userManagementApi.deleteUser(selectedUser.id);
      if (response.data.success) {
        await loadUsers();
        await loadStats();
      setShowDeleteModal(false);
      setSelectedUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.is_active) {
        await userManagementApi.deactivateUser(user.id);
    } else {
        await userManagementApi.activateUser(user.id);
      }
      await loadUsers();
      await loadStats();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert('Erreur lors du changement de statut de l\'utilisateur');
    }
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const confirmPasswordChange = async () => {
    if (!selectedUser) return;

    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      const response = await userManagementApi.changePassword(selectedUser.id, {
        newPassword: passwordForm.newPassword
      });
      if (response.data.success) {
        setShowPasswordModal(false);
    setSelectedUser(null);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      alert('Erreur lors du changement de mot de passe');
    }
  };

  const handleRefresh = () => {
    loadUsers();
    loadStats();
  };

  const handleExport = () => {
    console.log('Export des utilisateurs...');
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gestion des Utilisateurs</h1>
              <p className="text-blue-100 text-lg">Administration des comptes et permissions</p>
              <div className="flex items-center mt-4 space-x-4 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Users size={20} />
                  <span>{stats.total} utilisateurs au total</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={20} />
                  <span>{stats.active} actifs</span>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-3 hover:bg-opacity-30 transition-all duration-300"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleExport}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-3 hover:bg-opacity-30 transition-all duration-300"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Formes décoratives */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Utilisateurs</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs text-gray-500">Tous les comptes</p>
            </div>
            <div className="p-4 bg-blue-500 rounded-xl">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Utilisateurs Actifs</p>
              <p className="text-3xl font-bold text-green-600 mb-1">{stats.active}</p>
              <p className="text-xs text-gray-500">Connectés récemment</p>
            </div>
            <div className="p-4 bg-green-500 rounded-xl">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Inactifs</p>
              <p className="text-3xl font-bold text-red-600 mb-1">{stats.inactive}</p>
              <p className="text-xs text-gray-500">Comptes désactivés</p>
            </div>
            <div className="p-4 bg-red-500 rounded-xl">
              <XCircle size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Actifs (30j)</p>
              <p className="text-3xl font-bold text-teal-600 mb-1">{stats.active_last_30_days}</p>
              <p className="text-xs text-gray-500">Connexions récentes</p>
            </div>
            <div className="p-4 bg-teal-500 rounded-xl">
              <BarChart3 size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={roles.length === 0}
              >
                <option value="all">Tous les rôles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.display_name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </div>

          {/* Bouton Ajouter */}
          <button
            onClick={async () => {
              setSelectedUser(null);
              // S'assurer que les rôles sont chargés avant d'ouvrir le modal
              if (roles.length === 0) {
                await loadRoles();
              }
              setShowUserModal(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <UserPlus size={20} />
            <span>Ajouter un utilisateur</span>
          </button>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Liste des Utilisateurs</h3>
          <p className="text-sm text-gray-600 mt-1">{filteredUsers.length} utilisateurs trouvés</p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Chargement des utilisateurs...</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users size={20} className="text-gray-400" />
                      </div>
                      <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                          {user.email && (
                        <div className="text-sm text-gray-500">{user.email}</div>
                          )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role_name || '')}`}>
                        {getRoleIcon(user.role_name || '')}
                        <span className="ml-1">{user.role_display_name || 'Aucun rôle'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.is_active)}`}>
                        {getStatusIcon(user.is_active)}
                        <span className="ml-1">{user.is_active ? 'Actif' : 'Inactif'}</span>
                    </span>
                  </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {user.email && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {user.email}
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone size={14} className="mr-2 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                      {user.last_login ? (
                      <div>
                          <div>{new Date(user.last_login).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-gray-500">
                            {new Date(user.last_login).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Jamais connecté</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                          onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                          onClick={() => handleChangePassword(user)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                          title="Changer le mot de passe"
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            user.is_active 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.is_active ? 'Désactiver' : 'Activer'}
                        >
                          {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* État vide */}
      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-gray-400 mb-4">
              <Users size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Aucun utilisateur trouvé</h3>
            <p className="text-gray-600 mb-4">Modifiez vos critères de recherche ou ajoutez un nouvel utilisateur</p>
            <button
              onClick={async () => {
                setSelectedUser(null);
                // S'assurer que les rôles sont chargés avant d'ouvrir le modal
                if (roles.length === 0) {
                  await loadRoles();
                }
                setShowUserModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Ajouter un utilisateur
            </button>
          </div>
        </div>
      )}

      {/* Modal: Création/Modification d'utilisateur */}
      <Modal 
        isOpen={showUserModal} 
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        title={selectedUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"} 
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom d'utilisateur *</label>
              <input 
                value={selectedUser ? editForm.username : addForm.username} 
                onChange={e => selectedUser 
                  ? setEditForm({ ...editForm, username: e.target.value })
                  : setAddForm({ ...addForm, username: e.target.value })
                } 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="nom_utilisateur"
              />
            </div>
            {!selectedUser && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe *</label>
                <input 
                  type="password"
                  value={addForm.password} 
                  onChange={e => setAddForm({ ...addForm, password: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg" 
                  placeholder="Mot de passe"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email"
                value={selectedUser ? editForm.email : addForm.email} 
                onChange={e => selectedUser 
                  ? setEditForm({ ...editForm, email: e.target.value })
                  : setAddForm({ ...addForm, email: e.target.value })
                } 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
              <input 
                value={selectedUser ? editForm.phone : addForm.phone} 
                onChange={e => selectedUser 
                  ? setEditForm({ ...editForm, phone: e.target.value })
                  : setAddForm({ ...addForm, phone: e.target.value })
                } 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="+261 XX XX XX XX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
              <select 
                value={selectedUser ? editForm.role_id : addForm.role_id} 
                onChange={e => selectedUser 
                  ? setEditForm({ ...editForm, role_id: e.target.value })
                  : setAddForm({ ...addForm, role_id: e.target.value })
                } 
                className="w-full px-3 py-2 border rounded-lg"
                disabled={roles.length === 0}
              >
                <option value="">
                  {roles.length === 0 ? 'Chargement des rôles...' : 'Sélectionner un rôle'}
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.display_name} {role.description && `- ${role.description}`}
                  </option>
                ))}
              </select>
              {roles.length === 0 && (
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <RefreshCw size={12} className="animate-spin mr-1" />
                  Chargement des rôles en cours...
                </div>
              )}
            </div>
            {selectedUser && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                <select 
                  value={editForm.is_active ? 'active' : 'inactive'} 
                  onChange={e => setEditForm({ ...editForm, is_active: e.target.value === 'active' })} 
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => {
                setShowUserModal(false);
                setSelectedUser(null);
              }} 
              className="px-4 py-2 bg-slate-100 rounded-lg"
            >
              Annuler
            </button>
            <button 
              onClick={selectedUser ? handleUpdate : handleCreate} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              {selectedUser ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Changement de mot de passe */}
      <Modal 
        isOpen={showPasswordModal} 
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedUser(null);
        }} 
        title="Changer le mot de passe" 
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Utilisateur:</strong> {selectedUser.username}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Email:</strong> {selectedUser.email || 'Non spécifié'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe *</label>
              <input 
                type="password"
                value={passwordForm.newPassword} 
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="Nouveau mot de passe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer le mot de passe *</label>
              <input 
                type="password"
                value={passwordForm.confirmPassword} 
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="Confirmer le mot de passe"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedUser(null);
                }} 
                className="px-4 py-2 bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button 
                onClick={confirmPasswordChange} 
                className="px-4 py-2 bg-orange-600 text-white rounded-lg"
              >
                Changer le mot de passe
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Confirmation de suppression */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }} 
        title="Confirmer la suppression" 
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Supprimer l'utilisateur</h3>
                <p className="text-gray-600">Cette action est irréversible</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Utilisateur:</strong> {selectedUser.username}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Email:</strong> {selectedUser.email || 'Non spécifié'}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Rôle:</strong> {selectedUser.role_display_name || 'Aucun rôle'}
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
                className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors duration-200"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}