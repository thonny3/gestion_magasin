import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Car, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  BarChart3,
  Navigation,
  Target,
  Route,
  Zap,
  Phone,
  Mail
} from 'lucide-react';

interface Mission {
  id: string;
  reference: string;
  titre: string;
  description: string;
  destination: string;
  dateDebut: string;
  dateFin: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  agent: string;
  vehicule?: string;
  budget: number;
  budgetUtilise: number;
  observations?: string;
  coordonnees?: {
    latitude: number;
    longitude: number;
  };
  derniereMiseAJour: string;
}

const mockMissions: Mission[] = [
  {
    id: '1',
    reference: 'MIS-2024-001',
    titre: 'Inspection des stocks régionaux',
    description: 'Vérification des stocks dans les entrepôts régionaux',
    destination: 'Toamasina',
    dateDebut: '2024-12-20',
    dateFin: '2024-12-22',
    statut: 'en_cours',
    priorite: 'haute',
    agent: 'Jean Rakoto',
    vehicule: '4x4 - AB-123-CD',
    budget: 500000,
    budgetUtilise: 250000,
    observations: 'Mission en cours, inspection terminée à 60%',
    coordonnees: { latitude: -18.1499, longitude: 49.4023 },
    derniereMiseAJour: '2024-12-19T15:30:00'
  },
  {
    id: '2',
    reference: 'MIS-2024-002',
    titre: 'Formation des équipes locales',
    description: 'Formation sur les nouvelles procédures de gestion',
    destination: 'Fianarantsoa',
    dateDebut: '2024-12-25',
    dateFin: '2024-12-27',
    statut: 'planifie',
    priorite: 'normale',
    agent: 'Marie Ranaivo',
    vehicule: 'Voiture - CD-456-EF',
    budget: 300000,
    budgetUtilise: 0,
    coordonnees: { latitude: -21.4536, longitude: 47.0855 },
    derniereMiseAJour: '2024-12-19T10:15:00'
  },
  {
    id: '3',
    reference: 'MIS-2024-003',
    titre: 'Audit de sécurité',
    description: 'Audit complet des systèmes de sécurité',
    destination: 'Mahajanga',
    dateDebut: '2024-12-18',
    dateFin: '2024-12-19',
    statut: 'termine',
    priorite: 'urgente',
    agent: 'Pierre Andriamahazo',
    vehicule: '4x4 - EF-789-GH',
    budget: 800000,
    budgetUtilise: 750000,
    observations: 'Mission terminée avec succès, rapport remis',
    coordonnees: { latitude: -15.7167, longitude: 46.3167 },
    derniereMiseAJour: '2024-12-19T18:45:00'
  },
  {
    id: '4',
    reference: 'MIS-2024-004',
    titre: 'Maintenance préventive',
    description: 'Maintenance des équipements de production',
    destination: 'Antsirabe',
    dateDebut: '2024-12-23',
    dateFin: '2024-12-24',
    statut: 'annule',
    priorite: 'basse',
    agent: 'Sophie Rasoanaivo',
    budget: 200000,
    budgetUtilise: 0,
    observations: 'Mission annulée - Équipements indisponibles',
    coordonnees: { latitude: -19.8667, longitude: 47.0333 },
    derniereMiseAJour: '2024-12-19T09:20:00'
  }
];

export default function OrdresMissionList() {
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'planifie' | 'en_cours' | 'termine' | 'annule'>('all');
  const [filterPriorite, setFilterPriorite] = useState<'all' | 'basse' | 'normale' | 'haute' | 'urgente'>('all');
  const [showPlanning, setShowPlanning] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    reference: '',
    titre: '',
    description: '',
    destination: '',
    dateDebut: '',
    dateFin: '',
    statut: 'planifie' as Mission['statut'],
    priorite: 'normale' as Mission['priorite'],
    agent: '',
    vehicule: '',
    budget: ''
  });

  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      const matchesSearch = 
        mission.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.agent.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatut = filterStatut === 'all' || mission.statut === filterStatut;
      const matchesPriorite = filterPriorite === 'all' || mission.priorite === filterPriorite;
      
      return matchesSearch && matchesStatut && matchesPriorite;
    });
  }, [missions, searchTerm, filterStatut, filterPriorite]);

  const stats = useMemo(() => {
    const total = missions.length;
    const planifie = missions.filter(m => m.statut === 'planifie').length;
    const enCours = missions.filter(m => m.statut === 'en_cours').length;
    const termine = missions.filter(m => m.statut === 'termine').length;
    const annule = missions.filter(m => m.statut === 'annule').length;
    
    const budgetTotal = missions.reduce((sum, m) => sum + m.budget, 0);
    const budgetUtilise = missions.reduce((sum, m) => sum + m.budgetUtilise, 0);
    const budgetRestant = budgetTotal - budgetUtilise;

    return {
      total,
      planifie,
      enCours,
      termine,
      annule,
      budgetTotal,
      budgetUtilise,
      budgetRestant
    };
  }, [missions]);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'text-blue-600 bg-blue-100';
      case 'en_cours': return 'text-yellow-600 bg-yellow-100';
      case 'termine': return 'text-green-600 bg-green-100';
      case 'annule': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'basse': return 'text-gray-600 bg-gray-100';
      case 'normale': return 'text-blue-600 bg-blue-100';
      case 'haute': return 'text-orange-600 bg-orange-100';
      case 'urgente': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'planifie': return <Calendar size={16} />;
      case 'en_cours': return <Clock size={16} />;
      case 'termine': return <CheckCircle size={16} />;
      case 'annule': return <XCircle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const getProgressionMission = (mission: Mission) => {
    const debut = new Date(mission.dateDebut);
    const fin = new Date(mission.dateFin);
    const maintenant = new Date();
    
    if (mission.statut === 'termine') return 100;
    if (mission.statut === 'annule') return 0;
    if (maintenant < debut) return 0;
    if (maintenant > fin) return 100;
    
    const total = fin.getTime() - debut.getTime();
    const ecoule = maintenant.getTime() - debut.getTime();
    return Math.min((ecoule / total) * 100, 100);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    console.log('Export des missions...');
  };

  const handleCreate = () => {
    if (!addForm.reference || !addForm.titre || !addForm.destination || !addForm.dateDebut || !addForm.dateFin || !addForm.agent) return;
    const newMission: Mission = {
      id: `${Date.now()}`,
      reference: addForm.reference,
      titre: addForm.titre,
      description: addForm.description,
      destination: addForm.destination,
      dateDebut: addForm.dateDebut,
      dateFin: addForm.dateFin,
      statut: addForm.statut,
      priorite: addForm.priorite,
      agent: addForm.agent,
      vehicule: addForm.vehicule || undefined,
      budget: Number(addForm.budget) || 0,
      budgetUtilise: 0,
      observations: '',
      derniereMiseAJour: new Date().toISOString(),
    };
    setMissions(prev => [newMission, ...prev]);
    setIsAddOpen(false);
    setAddForm({ reference: '', titre: '', description: '', destination: '', dateDebut: '', dateFin: '', statut: 'planifie', priorite: 'normale', agent: '', vehicule: '', budget: '' });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
              <h1 className="text-3xl font-bold mb-2">Ordres de Mission</h1>
              <p className="text-teal-100 text-lg">Planification et suivi des missions</p>
              <div className="flex items-center mt-4 space-x-4 text-teal-100">
                <div className="flex items-center space-x-2">
                  <MapPin size={20} />
                  <span>{stats.total} missions au total</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Navigation size={20} />
                  <span>{stats.enCours} en cours</span>
                </div>
              </div>
        </div>
            <div className="mt-6 lg:mt-0 flex space-x-3">
              <button
                onClick={() => setShowPlanning(true)}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-3 hover:bg-opacity-30 transition-all duration-300"
              >
                <Calendar size={20} />
              </button>
              <button
                onClick={() => setShowTracking(true)}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-3 hover:bg-opacity-30 transition-all duration-300"
              >
                <Navigation size={20} />
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
              <p className="text-sm font-medium text-gray-600 mb-1">Total Missions</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs text-gray-500">Toutes les missions</p>
            </div>
            <div className="p-4 bg-teal-500 rounded-xl">
              <MapPin size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">En Cours</p>
              <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.enCours}</p>
              <p className="text-xs text-gray-500">Missions actives</p>
            </div>
            <div className="p-4 bg-yellow-500 rounded-xl">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Terminées</p>
              <p className="text-3xl font-bold text-green-600 mb-1">{stats.termine}</p>
              <p className="text-xs text-gray-500">Missions accomplies</p>
            </div>
            <div className="p-4 bg-green-500 rounded-xl">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Budget Restant</p>
              <p className="text-3xl font-bold text-blue-600 mb-1">{stats.budgetRestant.toLocaleString()} Ar</p>
              <p className="text-xs text-gray-500">Budget disponible</p>
            </div>
            <div className="p-4 bg-blue-500 rounded-xl">
              <TrendingUp size={24} className="text-white" />
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
                placeholder="Rechercher une mission..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Tous les statuts</option>
                <option value="planifie">Planifiées</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminées</option>
                <option value="annule">Annulées</option>
              </select>

              <select
                value={filterPriorite}
                onChange={(e) => setFilterPriorite(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Toutes priorités</option>
                <option value="basse">Basse</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <button onClick={() => setIsAddOpen(true)} className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center space-x-2">
            <Plus size={20} />
            <span>Nouvelle Mission</span>
          </button>
        </div>
      </div>

      {/* Tableau des missions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Liste des Missions</h3>
          <p className="text-sm text-gray-600 mt-1">{filteredMissions.length} missions trouvées</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mission
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progression
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMissions.map((mission) => (
                <tr key={mission.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                      <div>
                      <div className="text-sm font-semibold text-gray-900">{mission.reference}</div>
                      <div className="text-sm text-gray-900">{mission.titre}</div>
                      <div className="text-xs text-gray-500">{mission.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPin size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{mission.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{mission.agent}</span>
                    </div>
                    {mission.vehicule && (
                      <div className="text-xs text-gray-500 mt-1">
                        <Car size={12} className="inline mr-1" />
                        {mission.vehicule}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>Du {new Date(mission.dateDebut).toLocaleDateString('fr-FR')}</div>
                    <div>Au {new Date(mission.dateFin).toLocaleDateString('fr-FR')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          mission.statut === 'termine' ? 'bg-green-500' :
                          mission.statut === 'en_cours' ? 'bg-yellow-500' :
                          mission.statut === 'annule' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${getProgressionMission(mission)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(getProgressionMission(mission))}% complété
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(mission.statut)}`}>
                        {getStatutIcon(mission.statut)}
                        <span className="ml-1">
                          {mission.statut === 'planifie' ? 'Planifiée' : 
                           mission.statut === 'en_cours' ? 'En cours' : 
                           mission.statut === 'termine' ? 'Terminée' : 'Annulée'}
                        </span>
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioriteColor(mission.priorite)}`}>
                        {mission.priorite === 'basse' ? 'Basse' : 
                         mission.priorite === 'normale' ? 'Normale' : 
                         mission.priorite === 'haute' ? 'Haute' : 'Urgente'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-semibold">{mission.budget.toLocaleString()} Ar</div>
                    <div className="text-xs text-gray-500">
                      Utilisé: {mission.budgetUtilise.toLocaleString()} Ar
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="Voir détails">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200" title="Modifier">
                        <Edit size={16} />
                      </button>
                      {mission.coordonnees && (
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200" title="Suivi GPS">
                          <Navigation size={16} />
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* État vide */}
      {filteredMissions.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-gray-400 mb-4">
              <MapPin size={64} className="mx-auto" />
                </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🗺️ Aucune mission trouvée</h3>
            <p className="text-gray-600 mb-4">Modifiez vos critères de recherche ou créez une nouvelle mission</p>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200">
              Nouvelle Mission
            </button>
                </div>
              </div>
      )}

      {/* Modal: Nouvelle Mission */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nouvelle Mission" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Référence *</label>
              <input value={addForm.reference} onChange={e => setAddForm({ ...addForm, reference: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="MIS-2025-001"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
              <input value={addForm.titre} onChange={e => setAddForm({ ...addForm, titre: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Titre de la mission"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Description"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination *</label>
              <input value={addForm.destination} onChange={e => setAddForm({ ...addForm, destination: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Ville"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Agent *</label>
              <input value={addForm.agent} onChange={e => setAddForm({ ...addForm, agent: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Nom de l'agent"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date début *</label>
              <input type="date" value={addForm.dateDebut} onChange={e => setAddForm({ ...addForm, dateDebut: e.target.value })} className="w-full px-3 py-2 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date fin *</label>
              <input type="date" value={addForm.dateFin} onChange={e => setAddForm({ ...addForm, dateFin: e.target.value })} className="w-full px-3 py-2 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select value={addForm.statut} onChange={e => setAddForm({ ...addForm, statut: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg">
                <option value="planifie">Planifiée</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminée</option>
                <option value="annule">Annulée</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
              <select value={addForm.priorite} onChange={e => setAddForm({ ...addForm, priorite: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg">
                <option value="basse">Basse</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Véhicule</label>
              <input value={addForm.vehicule} onChange={e => setAddForm({ ...addForm, vehicule: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Type - Immatriculation"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Budget (Ar)</label>
              <input type="number" value={addForm.budget} onChange={e => setAddForm({ ...addForm, budget: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="0"/>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Annuler</button>
            <button onClick={handleCreate} className="px-4 py-2 bg-teal-600 text-white rounded-lg">Enregistrer</button>
          </div>
        </div>
      </Modal>

      {/* Modals */}
      {showPlanning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Planification des Missions</h2>
              <p className="text-gray-600 mt-1">Calendrier et planification des missions</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Calendrier</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Calendar size={48} className="mx-auto mb-4" />
                    <p>Calendrier interactif des missions</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Optimisation des Itinéraires</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Route size={48} className="mx-auto mb-4" />
                    <p>Optimisation automatique des parcours</p>
                  </div>
                </div>
              </div>
              </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowPlanning(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Fermer
              </button>
                </div>
                </div>
              </div>
      )}

      {showTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Suivi en Temps Réel</h2>
              <p className="text-gray-600 mt-1">Localisation et suivi des agents en mission</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Carte Interactive</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Navigation size={48} className="mx-auto mb-4" />
                    <p>Suivi GPS en temps réel</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Communications</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Phone size={48} className="mx-auto mb-4" />
                    <p>Contact et messagerie</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowTracking(false)}
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