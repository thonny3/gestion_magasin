import React, { useState, useMemo } from 'react';
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
  RefreshCw
} from 'lucide-react';
import UserModal from './UserModal';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'pending';
  phone?: string;
  department?: string;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

// Données mockées pour les utilisateurs
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@stockmanager.com',
    fullName: 'Administrateur Principal',
    role: 'admin',
    status: 'active',
    phone: '+261 34 12 345 67',
    department: 'IT',
    createdAt: '2024-01-15',
    lastLogin: '2024-12-19T10:30:00'
  },
  {
    id: '2',
    username: 'manager1',
    email: 'manager1@stockmanager.com',
    fullName: 'Jean Dupont',
    role: 'manager',
    status: 'active',
    phone: '+261 34 23 456 78',
    department: 'Logistique',
    createdAt: '2024-02-20',
    lastLogin: '2024-12-19T09:15:00'
  },
  {
    id: '3',
    username: 'user1',
    email: 'user1@stockmanager.com',
    fullName: 'Marie Martin',
    role: 'user',
    status: 'active',
    phone: '+261 34 34 567 89',
    department: 'Stock',
    createdAt: '2024-03-10',
    lastLogin: '2024-12-18T16:45:00'
  },
  {
    id: '4',
    username: 'user2',
    email: 'user2@stockmanager.com',
    fullName: 'Pierre Durand',
    role: 'user',
    status: 'inactive',
    phone: '+261 34 45 678 90',
    department: 'Réception',
    createdAt: '2024-04-05',
    lastLogin: '2024-12-10T14:20:00'
  },
  {
    id: '5',
    username: 'manager2',
    email: 'manager2@stockmanager.com',
    fullName: 'Sophie Bernard',
    role: 'manager',
    status: 'pending',
    phone: '+261 34 56 789 01',
    department: 'Distribution',
    createdAt: '2024-12-15',
    lastLogin: undefined
  }
];

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user' | 'manager'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrage des utilisateurs
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  // Statistiques
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    const pending = users.filter(u => u.status === 'pending').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const managers = users.filter(u => u.role === 'manager').length;
    const regularUsers = users.filter(u => u.role === 'user').length;

    return {
      total,
      active,
      inactive,
      pending,
      admins,
      managers,
      regularUsers
    };
  }, [users]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  const handleSaveUser = (userData: Partial<User>) => {
    if (selectedUser) {
      // Modification d'un utilisateur existant
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? { ...u, ...userData } : u
      ));
    } else {
      // Ajout d'un nouvel utilisateur
      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username || '',
        email: userData.email || '',
        fullName: userData.fullName || '',
        role: userData.role || 'user',
        status: userData.status || 'pending',
        phone: userData.phone,
        department: userData.department,
        createdAt: new Date().toISOString().split('T')[0],
        ...userData
      };
      setUsers(prev => [...prev, newUser]);
    }
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    // Simulation d'export
    console.log('Export des utilisateurs...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'manager': return 'text-blue-600 bg-blue-100';
      case 'user': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'inactive': return <XCircle size={16} />;
      case 'pending': return <AlertCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
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
                disabled={isLoading}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-3 hover:bg-opacity-30 transition-all duration-300"
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
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
              <p className="text-sm font-medium text-gray-600 mb-1">Administrateurs</p>
              <p className="text-3xl font-bold text-purple-600 mb-1">{stats.admins}</p>
              <p className="text-xs text-gray-500">Accès complet</p>
            </div>
            <div className="p-4 bg-purple-500 rounded-xl">
              <Shield size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">En Attente</p>
              <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</p>
              <p className="text-xs text-gray-500">Validation requise</p>
            </div>
            <div className="p-4 bg-yellow-500 rounded-xl">
              <AlertCircle size={24} className="text-white" />
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
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Administrateurs</option>
                <option value="manager">Managers</option>
                <option value="user">Utilisateurs</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="pending">En attente</option>
              </select>
            </div>
          </div>

          {/* Bouton Ajouter */}
          <button
            onClick={handleAddUser}
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
                  Département
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
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.fullName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <Users size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role === 'admin' ? 'Administrateur' : 
                       user.role === 'manager' ? 'Manager' : 'Utilisateur'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                      <span className="ml-1">
                        {user.status === 'active' ? 'Actif' : 
                         user.status === 'inactive' ? 'Inactif' : 'En attente'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.lastLogin ? (
                      <div>
                        <div>{new Date(user.lastLogin).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(user.lastLogin).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Jamais connecté</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
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
      </div>

      {/* État vide */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-gray-400 mb-4">
              <Users size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Aucun utilisateur trouvé</h3>
            <p className="text-gray-600 mb-4">Modifiez vos critères de recherche ou ajoutez un nouvel utilisateur</p>
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Ajouter un utilisateur
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          onSave={handleSaveUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showDeleteModal && selectedUser && (
        <ConfirmDeleteModal
          title="Supprimer l'utilisateur"
          message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${selectedUser.fullName}" ? Cette action est irréversible.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}


