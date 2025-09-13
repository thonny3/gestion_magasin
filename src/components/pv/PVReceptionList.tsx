import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import { pvReceptionApi } from '../../utils/api';
import { PVReception } from '../../types';
import { 
  FileText, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Archive,
  Calendar,
  User,
  Building,
  Package,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  BarChart3,
  FolderOpen,
  FileCheck,
  FileX,
  FileArchive,
  Phone,
  MapPin
} from 'lucide-react';

export default function PVReceptionList() {
  const [pvs, setPvs] = useState<PVReception[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'draft' | 'finalise'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPV, setSelectedPV] = useState<PVReception | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    by_status: {
      draft: 0,
      finalise: 0
    }
  });

  const [addForm, setAddForm] = useState({
    id_bon_reception: '',
    date_pv: '',
    adresse: '',
    fournisseur: '',
    livreur: '',
    telephone_livreur: '',
    details_articles: '',
    observations: ''
  });

  const [editForm, setEditForm] = useState({
    id_bon_reception: '',
    date_pv: '',
    adresse: '',
    fournisseur: '',
    livreur: '',
    telephone_livreur: '',
    details_articles: '',
    observations: '',
    statut: 'draft' as 'draft' | 'finalise'
  });

  const [bonsReception, setBonsReception] = useState<any[]>([]);

  // Charger les PV de réception
  const loadPVs = async () => {
    try {
      setLoading(true);
      const response = await pvReceptionApi.list({
        page: 1,
        limit: 100,
        statut: filterStatut === 'all' ? undefined : filterStatut,
        fournisseur: searchTerm || undefined
      });
      
      if (response.data.success) {
        setPvs(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des PV de réception:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const response = await pvReceptionApi.stats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  // Charger les bons de réception
  const loadBonsReception = async () => {
    try {
      const response = await pvReceptionApi.getBonsReception();
      if (response.data.success) {
        setBonsReception(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des bons de réception:', error);
    }
  };

  useEffect(() => {
    loadPVs();
    loadStats();
    loadBonsReception();
  }, [filterStatut, searchTerm]);

  const filteredPVs = useMemo(() => {
    return pvs.filter(pv => {
      const matchesSearch = 
        pv.numero_pv.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pv.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pv.livreur && pv.livreur.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [pvs, searchTerm]);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'finalise': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'draft': return <Clock size={16} />;
      case 'finalise': return <CheckCircle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const handleCreate = async () => {
    try {
      if (!addForm.date_pv || !addForm.adresse || !addForm.fournisseur) {
        alert('Veuillez remplir les champs obligatoires');
        return;
      }

      // Préparer les données en convertissant les chaînes vides en null pour les champs optionnels
      const dataToSend = {
        ...addForm,
        id_bon_reception: addForm.id_bon_reception || null,
        livreur: addForm.livreur || null,
        telephone_livreur: addForm.telephone_livreur || null,
        details_articles: addForm.details_articles || null,
        observations: addForm.observations || null
      };

      const response = await pvReceptionApi.create(dataToSend);
      if (response.data.success) {
        await loadPVs();
        await loadStats();
        setIsAddOpen(false);
        setAddForm({
          id_bon_reception: '',
          date_pv: '',
          adresse: '',
          fournisseur: '',
          livreur: '',
          telephone_livreur: '',
          details_articles: '',
          observations: ''
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création du PV de réception');
    }
  };

  const handleView = (pv: PVReception) => {
    setSelectedPV(pv);
    setIsViewOpen(true);
  };

  const handleEdit = (pv: PVReception) => {
    setSelectedPV(pv);
    setEditForm({
      id_bon_reception: pv.id_bon_reception?.toString() || '',
      date_pv: pv.date_pv,
      adresse: pv.adresse,
      fournisseur: pv.fournisseur,
      livreur: pv.livreur || '',
      telephone_livreur: pv.telephone_livreur || '',
      details_articles: pv.details_articles || '',
      observations: pv.observations || '',
      statut: pv.statut
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      if (!selectedPV || !editForm.date_pv || !editForm.adresse || !editForm.fournisseur) {
        alert('Veuillez remplir les champs obligatoires');
        return;
      }

      // Préparer les données en convertissant les chaînes vides en null pour les champs optionnels
      const dataToSend = {
        ...editForm,
        id_bon_reception: editForm.id_bon_reception || null,
        livreur: editForm.livreur || null,
        telephone_livreur: editForm.telephone_livreur || null,
        details_articles: editForm.details_articles || null,
        observations: editForm.observations || null
      };

      const response = await pvReceptionApi.update(selectedPV.id_pv, dataToSend);
      if (response.data.success) {
        await loadPVs();
        await loadStats();
        setIsEditOpen(false);
        setSelectedPV(null);
        setEditForm({
          id_bon_reception: '',
          date_pv: '',
          adresse: '',
          fournisseur: '',
          livreur: '',
          telephone_livreur: '',
          details_articles: '',
          observations: '',
          statut: 'draft'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification du PV de réception');
    }
  };

  const handleDelete = (pv: PVReception) => {
    setSelectedPV(pv);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPV) return;

    try {
      const response = await pvReceptionApi.remove(selectedPV.id_pv);
      if (response.data.success) {
        await loadPVs();
        await loadStats();
        setIsDeleteOpen(false);
        setSelectedPV(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du PV de réception');
    }
  };

  const handleFinalize = async (pv: PVReception) => {
    try {
      const response = await pvReceptionApi.finalize(pv.id_pv);
      if (response.data.success) {
        await loadPVs();
        await loadStats();
      }
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      alert('Erreur lors de la finalisation du PV de réception');
    }
  };

  const handleRefresh = () => {
    loadPVs();
    loadStats();
  };

  const handleExport = () => {
    console.log('Export des PV de réception...');
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
              <h1 className="text-3xl font-bold mb-2">PV de Réception</h1>
              <p className="text-indigo-100 text-lg">Gestion des procès-verbaux de réception</p>
              <div className="flex items-center mt-4 space-x-4 text-indigo-100">
                <div className="flex items-center space-x-2">
                  <FileText size={20} />
                  <span>{stats.total} PV au total</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileCheck size={20} />
                  <span>{stats.by_status.finalise} finalisés</span>
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
        <div className="absolute top-4 right-4 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total PV</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs text-gray-500">Tous les procès-verbaux</p>
            </div>
            <div className="p-4 bg-indigo-500 rounded-xl">
              <FileText size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Brouillons</p>
              <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.by_status.draft}</p>
              <p className="text-xs text-gray-500">En cours de rédaction</p>
            </div>
            <div className="p-4 bg-yellow-500 rounded-xl">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Finalisés</p>
              <p className="text-3xl font-bold text-green-600 mb-1">{stats.by_status.finalise}</p>
              <p className="text-xs text-gray-500">PV approuvés</p>
            </div>
            <div className="p-4 bg-green-500 rounded-xl">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Taux de finalisation</p>
              <p className="text-3xl font-bold text-blue-600 mb-1">
                {stats.total > 0 ? Math.round((stats.by_status.finalise / stats.total) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500">PV complétés</p>
            </div>
            <div className="p-4 bg-blue-500 rounded-xl">
              <BarChart3 size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un PV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillons</option>
                <option value="finalise">Finalisés</option>
              </select>
            </div>
          </div>

          <button 
            onClick={() => setIsAddOpen(true)} 
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nouveau PV</span>
          </button>
        </div>
      </div>

      {/* Tableau des PV */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Liste des PV de Réception</h3>
          <p className="text-sm text-gray-600 mt-1">{filteredPVs.length} PV trouvés</p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-gray-600">Chargement des PV de réception...</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PV
                </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bon de réception
                  </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Livreur
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredPVs.map((pv) => (
                  <tr key={pv.id_pv} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{pv.numero_pv}</div>
                        <div className="text-xs text-gray-500">
                          Créé le {new Date(pv.created_at || '').toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{pv.numero_bon || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{pv.fournisseur}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{pv.livreur || 'N/A'}</div>
                        {pv.telephone_livreur && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <Phone size={12} className="mr-1" />
                            {pv.telephone_livreur}
                          </div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(pv.date_pv).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                      <div className="flex items-center max-w-xs">
                        <MapPin size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate">{pv.adresse}</span>
                      </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(pv.statut)}`}>
                      {getStatutIcon(pv.statut)}
                      <span className="ml-1">
                          {pv.statut === 'draft' ? 'Brouillon' : 'Finalisé'}
                        </span>
                      </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleView(pv)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" 
                          title="Voir détails"
                        >
                        <Eye size={16} />
                      </button>
                        <button 
                          onClick={() => handleEdit(pv)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200" 
                          title="Modifier"
                        >
                        <Edit size={16} />
                      </button>
                        {pv.statut === 'draft' && (
                          <button 
                            onClick={() => handleFinalize(pv)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200" 
                            title="Finaliser"
                          >
                            <CheckCircle size={16} />
                      </button>
                        )}
                      <button
                          onClick={() => handleDelete(pv)}
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
      {!loading && filteredPVs.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-gray-400 mb-4">
              <FileText size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📄 Aucun PV trouvé</h3>
            <p className="text-gray-600 mb-4">Modifiez vos critères de recherche ou créez un nouveau PV</p>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Nouveau PV
            </button>
          </div>
        </div>
      )}

      {/* Modal: Nouveau PV */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nouveau PV de Réception" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bon de réception</label>
              <select 
                value={addForm.id_bon_reception} 
                onChange={e => setAddForm({ ...addForm, id_bon_reception: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Sélectionner un bon de réception</option>
                {bonsReception.map((bon) => (
                  <option key={bon.id} value={bon.id}>
                    {bon.numero_bon} - {bon.fournisseur} ({bon.date_reception})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date du PV *</label>
              <input 
                type="date" 
                value={addForm.date_pv} 
                onChange={e => setAddForm({ ...addForm, date_pv: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresse *</label>
              <input 
                value={addForm.adresse} 
                onChange={e => setAddForm({ ...addForm, adresse: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="Adresse de réception"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fournisseur *</label>
              <input 
                value={addForm.fournisseur} 
                onChange={e => setAddForm({ ...addForm, fournisseur: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="Nom du fournisseur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Livreur</label>
              <input 
                value={addForm.livreur} 
                onChange={e => setAddForm({ ...addForm, livreur: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="Nom du livreur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone livreur</label>
              <input 
                value={addForm.telephone_livreur} 
                onChange={e => setAddForm({ ...addForm, telephone_livreur: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="+261 XX XX XX XX"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Détails des articles</label>
              <textarea 
                value={addForm.details_articles} 
                onChange={e => setAddForm({ ...addForm, details_articles: e.target.value })} 
                rows={3} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="Description des articles reçus"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observations</label>
              <textarea 
                value={addForm.observations} 
                onChange={e => setAddForm({ ...addForm, observations: e.target.value })} 
                rows={3} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="Observations particulières"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setIsAddOpen(false)} 
              className="px-4 py-2 bg-slate-100 rounded-lg"
            >
              Annuler
            </button>
            <button 
              onClick={handleCreate} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Visualisation des détails */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails du PV de Réception" size="lg">
        {selectedPV && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro du PV</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedPV.numero_pv}</p>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bon de réception</label>
                  <p className="text-gray-900">{selectedPV.numero_bon || 'Non lié'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                  <p className="text-gray-900">{selectedPV.fournisseur}</p>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Livreur</label>
                  <p className="text-gray-900">{selectedPV.livreur || 'Non spécifié'}</p>
                </div>
                {selectedPV.telephone_livreur && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone livreur</label>
                    <p className="text-gray-900 flex items-center">
                      <Phone size={16} className="mr-2" />
                      {selectedPV.telephone_livreur}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date du PV</label>
                  <p className="text-gray-900">{new Date(selectedPV.date_pv).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <p className="text-gray-900 flex items-start">
                    <MapPin size={16} className="mr-2 mt-1 flex-shrink-0" />
                    {selectedPV.adresse}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(selectedPV.statut)}`}>
                    {getStatutIcon(selectedPV.statut)}
                    <span className="ml-1">
                      {selectedPV.statut === 'draft' ? 'Brouillon' : 'Finalisé'}
                    </span>
                  </span>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Créé par</label>
                  <p className="text-gray-900">{selectedPV.createur || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {selectedPV.details_articles && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Détails des articles</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPV.details_articles}</p>
              </div>
            )}
            
            {selectedPV.observations && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPV.observations}</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => printPV(selectedPV)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 mr-2"
              >
                Télécharger PDF
              </button>
              <button
                onClick={() => setIsViewOpen(false)} 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Fermer
              </button>
          </div>
        </div>
      )}
      </Modal>

      {/* Modal: Modification */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modifier le PV de Réception" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bon de réception</label>
              <select 
                value={editForm.id_bon_reception} 
                onChange={e => setEditForm({ ...editForm, id_bon_reception: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Sélectionner un bon de réception</option>
                {bonsReception.map((bon) => (
                  <option key={bon.id} value={bon.id}>
                    {bon.numero_bon} - {bon.fournisseur} ({bon.date_reception})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date du PV *</label>
              <input 
                type="date" 
                value={editForm.date_pv} 
                onChange={e => setEditForm({ ...editForm, date_pv: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresse *</label>
              <input 
                value={editForm.adresse} 
                onChange={e => setEditForm({ ...editForm, adresse: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="Adresse de réception"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fournisseur *</label>
              <input 
                value={editForm.fournisseur} 
                onChange={e => setEditForm({ ...editForm, fournisseur: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="Nom du fournisseur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Livreur</label>
              <input 
                value={editForm.livreur} 
                onChange={e => setEditForm({ ...editForm, livreur: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="Nom du livreur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone livreur</label>
              <input 
                value={editForm.telephone_livreur} 
                onChange={e => setEditForm({ ...editForm, telephone_livreur: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="+261 XX XX XX XX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select 
                value={editForm.statut} 
                onChange={e => setEditForm({ ...editForm, statut: e.target.value as any })} 
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="draft">Brouillon</option>
                <option value="finalise">Finalisé</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Détails des articles</label>
              <textarea 
                value={editForm.details_articles} 
                onChange={e => setEditForm({ ...editForm, details_articles: e.target.value })} 
                rows={3} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="Description des articles reçus"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observations</label>
              <textarea 
                value={editForm.observations} 
                onChange={e => setEditForm({ ...editForm, observations: e.target.value })} 
                rows={3} 
                className="w-full px-3 py-2 border rounded-lg" 
                placeholder="Observations particulières"
              />
                  </div>
                </div>
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setIsEditOpen(false)} 
              className="px-4 py-2 bg-slate-100 rounded-lg"
            >
              Annuler
            </button>
            <button 
              onClick={handleUpdate} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Mettre à jour
            </button>
                  </div>
                </div>
      </Modal>

      {/* Modal: Confirmation de suppression */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirmer la suppression" size="md">
        {selectedPV && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Supprimer le PV de réception</h3>
                <p className="text-gray-600">Cette action est irréversible</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>PV:</strong> {selectedPV.numero_pv}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Fournisseur:</strong> {selectedPV.fournisseur}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Date:</strong> {new Date(selectedPV.date_pv).toLocaleDateString('fr-FR')}
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsDeleteOpen(false)} 
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

function printPV(pv: any) {
  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>PV de Réception ${pv.numero_pv}</title>
      <style>
        body{font-family:Arial, sans-serif; padding:24px;}
        .brand{display:flex; align-items:center; gap:12px}
        .brand img{width:48px; height:48px; object-fit:contain}
        h1{margin:0}
        .section{margin-top:12px}
        .label{color:#475569; font-size:12px}
        .value{font-weight:600}
        .box{background:#f8fafc; padding:12px; border-radius:8px}
      </style>
    </head>
    <body>
      <div class="brand">
        <img src="${location.origin}/logo.jpg" />
        <div>
          <h1>PV de Réception</h1>
          <div>${pv.numero_pv}</div>
        </div>
      </div>
      <div class="section">
        <div><span class="label">Date:</span> <span class="value">${new Date(pv.date_pv).toLocaleDateString('fr-FR')}</span></div>
        <div><span class="label">Fournisseur:</span> <span class="value">${pv.fournisseur||''}</span></div>
        <div><span class="label">Bon de réception:</span> <span class="value">${pv.numero_bon||''}</span></div>
        <div><span class="label">Adresse:</span> <span class="value">${pv.adresse||''}</span></div>
      </div>
      ${pv.details_articles ? `<div class="section box"><div class="label">Détails des articles</div><div>${pv.details_articles}</div></div>` : ''}
      ${pv.observations ? `<div class="section box"><div class="label">Observations</div><div>${pv.observations}</div></div>` : ''}
      <script>window.onload = () => window.print();</script>
    </body>
  </html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}