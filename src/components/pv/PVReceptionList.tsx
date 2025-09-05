import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
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
  FileArchive
} from 'lucide-react';

interface PVReception {
  id: string;
  numero: string;
  dateReception: string;
  fournisseur: string;
  agentReception: string;
  statut: 'en_attente' | 'valide' | 'rejete' | 'archive';
  type: 'marchandises' | 'equipements' | 'materiaux' | 'services';
  montant: number;
  observations?: string;
  documents: string[];
  signature?: string;
  dateValidation?: string;
  validateur?: string;
}

const mockPVReceptions: PVReception[] = [
  {
    id: '1',
    numero: 'PV-2024-001',
    dateReception: '2024-12-19',
    fournisseur: 'Société ABC Import',
    agentReception: 'Jean Rakoto',
    statut: 'valide',
    type: 'marchandises',
    montant: 2500000,
    observations: 'Réception conforme, marchandises en bon état',
    documents: ['facture.pdf', 'bon-livraison.pdf', 'photos-reception.pdf'],
    signature: 'signature-jr.jpg',
    dateValidation: '2024-12-19T14:30:00',
    validateur: 'Marie Ranaivo'
  },
  {
    id: '2',
    numero: 'PV-2024-002',
    dateReception: '2024-12-18',
    fournisseur: 'Tech Solutions Ltd',
    agentReception: 'Pierre Andriamahazo',
    statut: 'en_attente',
    type: 'equipements',
    montant: 1800000,
    observations: 'Équipements reçus, validation en cours',
    documents: ['bon-commande.pdf', 'specifications.pdf']
  },
  {
    id: '3',
    numero: 'PV-2024-003',
    dateReception: '2024-12-17',
    fournisseur: 'Matériaux Plus',
    agentReception: 'Sophie Rasoanaivo',
    statut: 'rejete',
    type: 'materiaux',
    montant: 950000,
    observations: 'Matériaux non conformes aux spécifications',
    documents: ['rapport-non-conformite.pdf', 'photos-defauts.pdf']
  },
  {
    id: '4',
    numero: 'PV-2023-045',
    dateReception: '2023-11-15',
    fournisseur: 'Services Pro',
    agentReception: 'Lucas Randrianarivo',
    statut: 'archive',
    type: 'services',
    montant: 3200000,
    observations: 'Services de maintenance terminés avec succès',
    documents: ['contrat-service.pdf', 'rapport-final.pdf'],
    signature: 'signature-lr.jpg',
    dateValidation: '2023-11-16T09:15:00',
    validateur: 'Directeur Général'
  }
];

export default function PVReceptionList() {
  const [pvReceptions, setPvReceptions] = useState<PVReception[]>(mockPVReceptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'en_attente' | 'valide' | 'rejete' | 'archive'>('all');
  const [filterType, setFilterType] = useState<'all' | 'marchandises' | 'equipements' | 'materiaux' | 'services'>('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    numero: '',
    dateReception: '',
    fournisseur: '',
    agentReception: '',
    type: 'marchandises' as PVReception['type'],
    montant: '',
    observations: ''
  });

  const filteredPVReceptions = useMemo(() => {
    return pvReceptions.filter(pv => {
      const matchesSearch = 
        pv.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pv.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pv.agentReception.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatut = filterStatut === 'all' || pv.statut === filterStatut;
      const matchesType = filterType === 'all' || pv.type === filterType;
      
      return matchesSearch && matchesStatut && matchesType;
    });
  }, [pvReceptions, searchTerm, filterStatut, filterType]);

  const stats = useMemo(() => {
    const total = pvReceptions.length;
    const enAttente = pvReceptions.filter(pv => pv.statut === 'en_attente').length;
    const valide = pvReceptions.filter(pv => pv.statut === 'valide').length;
    const rejete = pvReceptions.filter(pv => pv.statut === 'rejete').length;
    const archive = pvReceptions.filter(pv => pv.statut === 'archive').length;
    
    const montantTotal = pvReceptions.reduce((sum, pv) => sum + pv.montant, 0);
    const montantValide = pvReceptions.filter(pv => pv.statut === 'valide').reduce((sum, pv) => sum + pv.montant, 0);

    return {
      total,
      enAttente,
      valide,
      rejete,
      archive,
      montantTotal,
      montantValide
    };
  }, [pvReceptions]);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'text-yellow-600 bg-yellow-100';
      case 'valide': return 'text-green-600 bg-green-100';
      case 'rejete': return 'text-red-600 bg-red-100';
      case 'archive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'marchandises': return 'text-blue-600 bg-blue-100';
      case 'equipements': return 'text-purple-600 bg-purple-100';
      case 'materiaux': return 'text-orange-600 bg-orange-100';
      case 'services': return 'text-teal-600 bg-teal-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'en_attente': return <Clock size={16} />;
      case 'valide': return <CheckCircle size={16} />;
      case 'rejete': return <FileX size={16} />;
      case 'archive': return <FileArchive size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    console.log('Export des PV...');
  };

  const handleCreate = () => {
    if (!addForm.numero || !addForm.dateReception || !addForm.fournisseur || !addForm.agentReception) return;
    const newItem: PVReception = {
      id: `${Date.now()}`,
      numero: addForm.numero,
      dateReception: addForm.dateReception,
      fournisseur: addForm.fournisseur,
      agentReception: addForm.agentReception,
      statut: 'en_attente',
      type: addForm.type,
      montant: Number(addForm.montant) || 0,
      observations: addForm.observations || undefined,
      documents: []
    };
    setPvReceptions(prev => [newItem, ...prev]);
    setIsAddOpen(false);
    setAddForm({ numero: '', dateReception: '', fournisseur: '', agentReception: '', type: 'marchandises', montant: '', observations: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce PV de réception ?')) {
      setPvReceptions(pvReceptions.filter(pv => pv.id !== id));
    }
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
                  <span>{stats.valide} validés</span>
                </div>
              </div>
        </div>
            <div className="mt-6 lg:mt-0 flex space-x-3">
              <button
                onClick={() => setShowTemplates(true)}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-3 hover:bg-opacity-30 transition-all duration-300"
              >
                <FolderOpen size={20} />
              </button>
              <button
                onClick={() => setShowArchives(true)}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-3 hover:bg-opacity-30 transition-all duration-300"
              >
                <Archive size={20} />
              </button>
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
              <p className="text-sm font-medium text-gray-600 mb-1">En Attente</p>
              <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.enAttente}</p>
              <p className="text-xs text-gray-500">Validation requise</p>
            </div>
            <div className="p-4 bg-yellow-500 rounded-xl">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Validés</p>
              <p className="text-3xl font-bold text-green-600 mb-1">{stats.valide}</p>
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
              <p className="text-sm font-medium text-gray-600 mb-1">Montant Validé</p>
              <p className="text-3xl font-bold text-blue-600 mb-1">{stats.montantValide.toLocaleString()} Ar</p>
              <p className="text-xs text-gray-500">Valeur approuvée</p>
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
                <option value="en_attente">En attente</option>
                <option value="valide">Validés</option>
                <option value="rejete">Rejetés</option>
                <option value="archive">Archivés</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Tous types</option>
                <option value="marchandises">Marchandises</option>
                <option value="equipements">Équipements</option>
                <option value="materiaux">Matériaux</option>
                <option value="services">Services</option>
              </select>
            </div>
          </div>

          <button onClick={() => setIsAddOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2">
            <Plus size={20} />
            <span>Nouveau PV</span>
          </button>
        </div>
      </div>

      {/* Tableau des PV */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Liste des PV de Réception</h3>
          <p className="text-sm text-gray-600 mt-1">{filteredPVReceptions.length} PV trouvés</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PV
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
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
              {filteredPVReceptions.map((pv) => (
                <tr key={pv.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                      <div>
                      <div className="text-sm font-semibold text-gray-900">{pv.numero}</div>
                      <div className="text-xs text-gray-500">{pv.documents.length} documents</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{pv.fournisseur}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{pv.agentReception}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(pv.dateReception).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(pv.type)}`}>
                      <Package size={12} className="mr-1" />
                      {pv.type === 'marchandises' ? 'Marchandises' : 
                       pv.type === 'equipements' ? 'Équipements' : 
                       pv.type === 'materiaux' ? 'Matériaux' : 'Services'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-semibold">{pv.montant.toLocaleString()} Ar</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(pv.statut)}`}>
                      {getStatutIcon(pv.statut)}
                      <span className="ml-1">
                        {pv.statut === 'en_attente' ? 'En attente' : 
                         pv.statut === 'valide' ? 'Validé' : 
                         pv.statut === 'rejete' ? 'Rejeté' : 'Archivé'}
                      </span>
                    </span>
                    {pv.validateur && (
                      <div className="text-xs text-gray-500 mt-1">
                        Par: {pv.validateur}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="Voir détails">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200" title="Modifier">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200" title="Télécharger">
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(pv.id)}
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
      {filteredPVReceptions.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-gray-400 mb-4">
              <FileText size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📄 Aucun PV trouvé</h3>
            <p className="text-gray-600 mb-4">Modifiez vos critères de recherche ou créez un nouveau PV</p>
            <button onClick={() => setIsAddOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Nouveau PV
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nouveau PV de Réception" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Numéro *</label>
              <input value={addForm.numero} onChange={e => setAddForm({ ...addForm, numero: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="PV-2025-001"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de réception *</label>
              <input type="date" value={addForm.dateReception} onChange={e => setAddForm({ ...addForm, dateReception: e.target.value })} className="w-full px-3 py-2 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fournisseur *</label>
              <input value={addForm.fournisseur} onChange={e => setAddForm({ ...addForm, fournisseur: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Fournisseur"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Agent réception *</label>
              <input value={addForm.agentReception} onChange={e => setAddForm({ ...addForm, agentReception: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Agent"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select value={addForm.type} onChange={e => setAddForm({ ...addForm, type: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg">
                <option value="marchandises">Marchandises</option>
                <option value="equipements">Équipements</option>
                <option value="materiaux">Matériaux</option>
                <option value="services">Services</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Montant (Ar)</label>
              <input type="number" value={addForm.montant} onChange={e => setAddForm({ ...addForm, montant: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="0"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observations</label>
              <textarea value={addForm.observations} onChange={e => setAddForm({ ...addForm, observations: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Observations"/>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Annuler</button>
            <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Enregistrer</button>
          </div>
        </div>
      </Modal>

      {/* Modals */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Modèles de PV</h2>
              <p className="text-gray-600 mt-1">Templates et modèles de procès-verbaux</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">PV Marchandises</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Package size={48} className="mx-auto mb-4" />
                    <p>Modèle pour réception de marchandises</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">PV Équipements</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Building size={48} className="mx-auto mb-4" />
                    <p>Modèle pour réception d'équipements</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">PV Services</h3>
                  <div className="text-center py-8 text-gray-500">
                    <FileCheck size={48} className="mx-auto mb-4" />
                    <p>Modèle pour validation de services</p>
              </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">PV Matériaux</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Package size={48} className="mx-auto mb-4" />
                    <p>Modèle pour réception de matériaux</p>
                  </div>
                </div>
              </div>
              </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowTemplates(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showArchives && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Archives des PV</h2>
              <p className="text-gray-600 mt-1">Historique et archives des procès-verbaux</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Archives par Année</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Calendar size={48} className="mx-auto mb-4" />
                    <p>Consultation par période</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Recherche Avancée</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Search size={48} className="mx-auto mb-4" />
                    <p>Recherche dans les archives</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowArchives(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}