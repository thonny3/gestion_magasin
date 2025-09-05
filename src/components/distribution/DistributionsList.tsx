import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Calendar,
  Users,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Search,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  BarChart3,
  Route,
  Target,
  FileText,
  Activity,
  Navigation
} from 'lucide-react';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';
import { distributionsApi } from '../../utils/api';

interface Distribution {
  id: string;
  reference: string;
  titre: string;
  description: string;
  destination: string;
  datePlanification: string;
  dateExecution?: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  responsable: string;
  vehicule?: string;
  articles: {
    nom: string;
    quantite: number;
    unite: string;
  }[];
  beneficiaires: number;
  observations?: string;
  coordonnees?: {
    latitude: number;
    longitude: number;
  };
  derniereMiseAJour: string;
}

const mockDistributions: Distribution[] = [
  {
    id: '1',
    reference: 'DIST-2024-001',
    titre: 'Distribution alimentaire région Sud',
    description: 'Distribution de vivres aux populations vulnérables',
    destination: 'Toliara',
    datePlanification: '2024-12-25',
    dateExecution: '2024-12-25',
    statut: 'en_cours',
    priorite: 'urgente',
    responsable: 'Jean Rakoto',
    vehicule: 'Camion - AB-123-CD',
    articles: [
      { nom: 'Riz', quantite: 500, unite: 'kg' },
      { nom: 'Huile', quantite: 100, unite: 'L' },
      { nom: 'Sucre', quantite: 200, unite: 'kg' }
    ],
    beneficiaires: 250,
    observations: 'Distribution en cours, 60% des bénéficiaires servis',
    coordonnees: { latitude: -23.3516, longitude: 43.6855 },
    derniereMiseAJour: '2024-12-19T15:30:00'
  },
  {
    id: '2',
    reference: 'DIST-2024-002',
    titre: 'Distribution matériel scolaire',
    description: 'Fournitures scolaires pour écoles rurales',
    destination: 'Fianarantsoa',
    datePlanification: '2024-12-28',
    statut: 'planifie',
    priorite: 'normale',
    responsable: 'Marie Ranaivo',
    vehicule: '4x4 - CD-456-EF',
    articles: [
      { nom: 'Cahiers', quantite: 1000, unite: 'unités' },
      { nom: 'Stylos', quantite: 2000, unite: 'unités' },
      { nom: 'Livres', quantite: 500, unite: 'unités' }
    ],
    beneficiaires: 800,
    coordonnees: { latitude: -21.4536, longitude: 47.0855 },
    derniereMiseAJour: '2024-12-19T10:15:00'
  },
  {
    id: '3',
    reference: 'DIST-2024-003',
    titre: 'Distribution médicaments',
    description: 'Médicaments pour centres de santé',
    destination: 'Mahajanga',
    datePlanification: '2024-12-20',
    dateExecution: '2024-12-20',
    statut: 'termine',
    priorite: 'haute',
    responsable: 'Pierre Andriamahazo',
    vehicule: 'Ambulance - EF-789-GH',
    articles: [
      { nom: 'Paracétamol', quantite: 5000, unite: 'comprimés' },
      { nom: 'Antibiotiques', quantite: 1000, unite: 'boîtes' },
      { nom: 'Seringues', quantite: 2000, unite: 'unités' }
    ],
    beneficiaires: 1500,
    observations: 'Distribution terminée avec succès, tous les centres servis',
    coordonnees: { latitude: -15.7167, longitude: 46.3167 },
    derniereMiseAJour: '2024-12-19T18:45:00'
  },
  {
    id: '4',
    reference: 'DIST-2024-004',
    titre: 'Distribution vêtements',
    description: 'Vêtements pour personnes déplacées',
    destination: 'Antsirabe',
    datePlanification: '2024-12-22',
    statut: 'annule',
    priorite: 'basse',
    responsable: 'Sophie Rasoanaivo',
    articles: [
      { nom: 'T-shirts', quantite: 500, unite: 'unités' },
      { nom: 'Pantalons', quantite: 300, unite: 'unités' },
      { nom: 'Chaussures', quantite: 200, unite: 'paires' }
    ],
    beneficiaires: 300,
    observations: 'Distribution annulée - Intempéries',
    coordonnees: { latitude: -19.8667, longitude: 47.0333 },
    derniereMiseAJour: '2024-12-19T09:20:00'
  }
];

export default function DistributionsList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'planifie' | 'en_cours' | 'termine' | 'annule'>('all');
  const [filterPriorite, setFilterPriorite] = useState<'all' | 'basse' | 'normale' | 'haute' | 'urgente'>('all');
  const [showPlanning, setShowPlanning] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Distribution | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<Distribution | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Distribution | null>(null);

  // Ouvrir/fermer les modals selon l'URL
  useEffect(() => {
    const isPlanning = location.pathname.endsWith('/planification');
    const isReports = location.pathname.endsWith('/rapports');
    setShowPlanning(isPlanning);
    setShowReports(isReports);
  }, [location.pathname]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await distributionsApi.list();
        const items = (res.data?.items || []) as any[];
        const mapped: Distribution[] = items.map((d) => ({
          id: String(d.id),
          reference: d.reference,
          titre: d.titre,
          description: d.description || '',
          destination: d.destination,
          datePlanification: d.date_planification,
          dateExecution: d.date_execution || undefined,
          statut: d.statut,
          priorite: d.priorite,
          responsable: d.responsable,
          vehicule: d.vehicule || undefined,
          articles: [],
          beneficiaires: Number(d.beneficiaires || 0),
          observations: d.observations || undefined,
          coordonnees: d.coord_lat && d.coord_lng ? { latitude: Number(d.coord_lat), longitude: Number(d.coord_lng) } : undefined,
          derniereMiseAJour: d.derniere_mise_a_jour || new Date().toISOString(),
        }));
        setDistributions(mapped);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredDistributions = useMemo(() => {
    return distributions.filter(distribution => {
      const matchesSearch =
        distribution.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        distribution.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        distribution.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        distribution.responsable.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatut = filterStatut === 'all' || distribution.statut === filterStatut;
      const matchesPriorite = filterPriorite === 'all' || distribution.priorite === filterPriorite;

      return matchesSearch && matchesStatut && matchesPriorite;
    });
  }, [distributions, searchTerm, filterStatut, filterPriorite]);

  const stats = useMemo(() => {
    const total = distributions.length;
    const planifie = distributions.filter(d => d.statut === 'planifie').length;
    const enCours = distributions.filter(d => d.statut === 'en_cours').length;
    const termine = distributions.filter(d => d.statut === 'termine').length;
    const annule = distributions.filter(d => d.statut === 'annule').length;

    const totalBeneficiaires = distributions.reduce((sum, d) => sum + d.beneficiaires, 0);
    const beneficiairesServis = distributions.filter(d => d.statut === 'termine').reduce((sum, d) => sum + d.beneficiaires, 0);

    return {
      total,
      planifie,
      enCours,
      termine,
      annule,
      totalBeneficiaires,
      beneficiairesServis
    };
  }, [distributions]);

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

  const getProgressionDistribution = (distribution: Distribution) => {
    if (distribution.statut === 'termine') return 100;
    if (distribution.statut === 'annule') return 0;
    if (distribution.statut === 'planifie') return 0;
    if (distribution.statut === 'en_cours') return 60; // Simulation
    return 0;
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    console.log('Export des distributions...');
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleEdit = (item: Distribution) => {
    setEditingItem(item);
    setShowFormModal(true);
  };

  const handleDelete = (item: Distribution) => {
    setDeleteTarget(item);
    setConfirmDeleteOpen(true);
  };

  const handleSave = async (data: Partial<Distribution>) => {
    if (editingItem) {
      const payload = {
        reference: data.reference || editingItem.reference,
        titre: data.titre || editingItem.titre,
        description: data.description || null,
        destination: data.destination || editingItem.destination,
        date_planification: data.datePlanification || editingItem.datePlanification,
        date_execution: data.dateExecution || null,
        statut: (data.statut as any) || editingItem.statut,
        priorite: (data.priorite as any) || editingItem.priorite,
        responsable: data.responsable || editingItem.responsable,
        vehicule: data.vehicule || null,
        beneficiaires: Number(data.beneficiaires ?? editingItem.beneficiaires),
        observations: data.observations || null,
        coord_lat: data.coordonnees ? (data.coordonnees as any).latitude : null,
        coord_lng: data.coordonnees ? (data.coordonnees as any).longitude : null,
      };
      const res = await distributionsApi.update(Number(editingItem.id), payload);
      const item = res.data?.item;
      setDistributions(distributions.map(d => d.id === editingItem.id ? {
        ...d,
        reference: item.reference,
        titre: item.titre,
        description: item.description || '',
        destination: item.destination,
        datePlanification: item.date_planification,
        dateExecution: item.date_execution || undefined,
        statut: item.statut,
        priorite: item.priorite,
        responsable: item.responsable,
        vehicule: item.vehicule || undefined,
        beneficiaires: Number(item.beneficiaires || 0),
        observations: item.observations || undefined,
        coordonnees: item.coord_lat && item.coord_lng ? { latitude: Number(item.coord_lat), longitude: Number(item.coord_lng) } : undefined,
        derniereMiseAJour: item.derniere_mise_a_jour || new Date().toISOString(),
      } : d));
    } else {
      const payload = {
        reference: data.reference,
        titre: data.titre,
        description: data.description || null,
        destination: data.destination,
        date_planification: data.datePlanification || new Date().toISOString().split('T')[0],
        date_execution: data.dateExecution || null,
        statut: (data.statut as any) || 'planifie',
        priorite: (data.priorite as any) || 'normale',
        responsable: data.responsable,
        vehicule: data.vehicule || null,
        beneficiaires: Number(data.beneficiaires || 0),
        observations: data.observations || null,
        coord_lat: data.coordonnees ? (data.coordonnees as any).latitude : null,
        coord_lng: data.coordonnees ? (data.coordonnees as any).longitude : null,
      };
      const res = await distributionsApi.create(payload);
      const item = res.data?.item;
      if (item) {
        setDistributions([{
          id: String(item.id),
          reference: item.reference,
          titre: item.titre,
          description: item.description || '',
          destination: item.destination,
          datePlanification: item.date_planification,
          dateExecution: item.date_execution || undefined,
          statut: item.statut,
          priorite: item.priorite,
          responsable: item.responsable,
          vehicule: item.vehicule || undefined,
          articles: [],
          beneficiaires: Number(item.beneficiaires || 0),
          observations: item.observations || undefined,
          coordonnees: item.coord_lat && item.coord_lng ? { latitude: Number(item.coord_lat), longitude: Number(item.coord_lng) } : undefined,
          derniereMiseAJour: item.derniere_mise_a_jour || new Date().toISOString(),
        }, ...distributions]);
      }
    }
    setShowFormModal(false);
    setEditingItem(null);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-red-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
              <h1 className="text-3xl font-bold mb-2">Distributions</h1>
              <p className="text-orange-100 text-lg">Planification et suivi des distributions</p>
              <div className="flex items-center mt-4 space-x-4 text-orange-100">
                <div className="flex items-center space-x-2">
                  <Truck size={20} />
                  <span>{stats.total} distributions au total</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={20} />
                  <span>{stats.totalBeneficiaires} bénéficiaires</span>
                </div>
              </div>
        </div>
            <div className="mt-6 lg:mt-0 flex space-x-3">
              <button
                onClick={() => navigate('/distribution/planification')}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-3 hover:bg-opacity-30 transition-all duration-300"
              >
                <Calendar size={20} />
              </button>
              <button
                onClick={() => navigate('/distribution/rapports')}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-3 hover:bg-opacity-30 transition-all duration-300"
              >
                <FileText size={20} />
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
              <p className="text-sm font-medium text-gray-600 mb-1">Total Distributions</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs text-gray-500">Toutes les distributions</p>
            </div>
            <div className="p-4 bg-orange-500 rounded-xl">
              <Truck size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">En Cours</p>
              <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.enCours}</p>
              <p className="text-xs text-gray-500">Distributions actives</p>
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
              <p className="text-xs text-gray-500">Distributions accomplies</p>
            </div>
            <div className="p-4 bg-green-500 rounded-xl">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Bénéficiaires Servis</p>
              <p className="text-3xl font-bold text-blue-600 mb-1">{stats.beneficiairesServis.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Personnes aidées</p>
            </div>
            <div className="p-4 bg-blue-500 rounded-xl">
              <Users size={24} className="text-white" />
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
                placeholder="Rechercher une distribution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
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
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Toutes priorités</option>
                <option value="basse">Basse</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <button onClick={handleAdd} className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center space-x-2">
            <Plus size={20} />
            <span>Nouvelle Distribution</span>
          </button>
        </div>
      </div>

      {/* Tableau des distributions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Liste des Distributions</h3>
          <p className="text-sm text-gray-600 mt-1">{filteredDistributions.length} distributions trouvées</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distribution
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Articles
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bénéficiaires
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progression
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
              {filteredDistributions.map((distribution) => (
                <tr key={distribution.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{distribution.reference}</div>
                      <div className="text-sm text-gray-900">{distribution.titre}</div>
                      <div className="text-xs text-gray-500">{distribution.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPin size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{distribution.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{distribution.responsable}</span>
                    </div>
                    {distribution.vehicule && (
                      <div className="text-xs text-gray-500 mt-1">
                        <Truck size={12} className="inline mr-1" />
                        {distribution.vehicule}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>Planifiée: {new Date(distribution.datePlanification).toLocaleDateString('fr-FR')}</div>
                    {distribution.dateExecution && (
                      <div className="text-xs text-gray-500">
                        Exécutée: {new Date(distribution.dateExecution).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {distribution.articles.slice(0, 2).map((article, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          {article.nom}: {article.quantite} {article.unite}
                        </div>
                      ))}
                      {distribution.articles.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{distribution.articles.length - 2} autres...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-semibold">{distribution.beneficiaires.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">personnes</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          distribution.statut === 'termine' ? 'bg-green-500' :
                          distribution.statut === 'en_cours' ? 'bg-yellow-500' :
                          distribution.statut === 'annule' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${getProgressionDistribution(distribution)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getProgressionDistribution(distribution)}% complété
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(distribution.statut)}`}>
                        {getStatutIcon(distribution.statut)}
                        <span className="ml-1">
                          {distribution.statut === 'planifie' ? 'Planifiée' :
                           distribution.statut === 'en_cours' ? 'En cours' :
                           distribution.statut === 'termine' ? 'Terminée' : 'Annulée'}
                        </span>
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioriteColor(distribution.priorite)}`}>
                        {distribution.priorite === 'basse' ? 'Basse' :
                         distribution.priorite === 'normale' ? 'Normale' :
                         distribution.priorite === 'haute' ? 'Haute' : 'Urgente'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setShowDetailModal(distribution)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="Voir détails">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEdit(distribution)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200" title="Modifier">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(distribution)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Supprimer">
                        <XCircle size={16} />
                      </button>
                      {distribution.coordonnees && (
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
      {filteredDistributions.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-gray-400 mb-4">
              <Truck size={64} className="mx-auto" />
                </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🚚 Aucune distribution trouvée</h3>
            <p className="text-gray-600 mb-4">Modifiez vos critères de recherche ou créez une nouvelle distribution</p>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200">
              Nouvelle Distribution
            </button>
                </div>
              </div>
      )}

      {/* Modal formulaire ajout/modification */}
      {showFormModal && (
        <DistributionFormModal
          distribution={editingItem}
          onSave={handleSave}
          onClose={() => { setShowFormModal(false); setEditingItem(null); }}
        />
      )}

      {/* Modal détails */}
      {showDetailModal && (
        <DistributionDetailModal
          distribution={showDetailModal}
          onClose={() => setShowDetailModal(null)}
        />
      )}

      {/* Confirmation suppression */}
      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        onClose={() => { setConfirmDeleteOpen(false); setDeleteTarget(null); }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await distributionsApi.remove(Number(deleteTarget.id));
          setDistributions(distributions.filter(d => d.id !== deleteTarget.id));
        }}
        title="Supprimer la distribution"
        itemType="distribution"
        itemName={deleteTarget?.reference}
        isDangerous
      />

      {/* Modals */}
      {showPlanning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Planification des Distributions</h2>
              <p className="text-gray-600 mt-1">Calendrier et optimisation des distributions</p>
            </div>
            <div className="p-6">
              {/* Calendrier des Distributions */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="mr-2" size={20} />
                  Calendrier des Distributions
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    <div className="text-center text-sm font-medium text-gray-500 py-2">Lun</div>
                    <div className="text-center text-sm font-medium text-gray-500 py-2">Mar</div>
                    <div className="text-center text-sm font-medium text-gray-500 py-2">Mer</div>
                    <div className="text-center text-sm font-medium text-gray-500 py-2">Jeu</div>
                    <div className="text-center text-sm font-medium text-gray-500 py-2">Ven</div>
                    <div className="text-center text-sm font-medium text-gray-500 py-2">Sam</div>
                    <div className="text-center text-sm font-medium text-gray-500 py-2">Dim</div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 6;
                      const hasDistribution = [20, 22, 25, 28].includes(day);
                      const isToday = day === 19;
                      return (
                        <div
                          key={i}
                          className={`h-12 flex items-center justify-center text-sm rounded-lg border ${
                            hasDistribution
                              ? 'bg-orange-100 border-orange-300 text-orange-800 font-medium'
                              : isToday
                              ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {day > 0 && day <= 31 ? day : ''}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded mr-2"></div>
                      <span>Distribution planifiée</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                      <span>Aujourd'hui</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optimisation des Itinéraires */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Route className="mr-2" size={20} />
                  Optimisation des Itinéraires
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Itinéraires Optimisés</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-sm font-medium">Route Sud</p>
                            <p className="text-xs text-gray-500">Toliara → Fianarantsoa</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">2h 30min</p>
                          <p className="text-xs text-gray-500">Optimisé</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-sm font-medium">Route Nord</p>
                            <p className="text-xs text-gray-500">Mahajanga → Antsirabe</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-yellow-600">3h 15min</p>
                          <p className="text-xs text-gray-500">En cours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Économies Réalisées</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Carburant économisé</span>
                        <span className="text-sm font-medium text-green-600">-15%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Temps de trajet</span>
                        <span className="text-sm font-medium text-green-600">-22%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Coût total</span>
                        <span className="text-sm font-medium text-green-600">-18%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gestion des Ressources */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="mr-2" size={20} />
                  Gestion des Ressources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Véhicules Disponibles</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Camions</span>
                        <span className="text-sm font-medium">3/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">4x4</span>
                        <span className="text-sm font-medium">2/3</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ambulances</span>
                        <span className="text-sm font-medium">1/2</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Équipes Disponibles</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Chauffeurs</span>
                        <span className="text-sm font-medium">8/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Logisticiens</span>
                        <span className="text-sm font-medium">5/6</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '83%' }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Superviseurs</span>
                        <span className="text-sm font-medium">3/4</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Stock Disponible</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Articles alimentaires</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Médicaments</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Matériel scolaire</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suivi en Temps Réel */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="mr-2" size={20} />
                  Suivi en Temps Réel
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Distributions Actives</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                          <div>
                            <p className="text-sm font-medium">DIST-2024-001</p>
                            <p className="text-xs text-gray-500">Toliara - En cours</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-600">60%</p>
                          <p className="text-xs text-gray-500">Progression</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-sm font-medium">DIST-2024-003</p>
                            <p className="text-xs text-gray-500">Mahajanga - Terminée</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">100%</p>
                          <p className="text-xs text-gray-500">Complétée</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Alertes et Notifications</h4>
                    <div className="space-y-2">
                      <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
                        <AlertTriangle size={16} className="text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-800">Retard prévu sur DIST-2024-002</span>
                      </div>
                      <div className="flex items-center p-2 bg-red-50 rounded-lg">
                        <XCircle size={16} className="text-red-600 mr-2" />
                        <span className="text-sm text-red-800">DIST-2024-004 annulée</span>
                      </div>
                      <div className="flex items-center p-2 bg-green-50 rounded-lg">
                        <CheckCircle size={16} className="text-green-600 mr-2" />
                        <span className="text-sm text-green-800">DIST-2024-003 terminée avec succès</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => navigate('/distribution')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showReports && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Rapports de Distribution</h2>
              <p className="text-gray-600 mt-1">Analyses et statistiques des distributions</p>
            </div>
            <div className="p-6">
              {/* Rapports de Performance */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="mr-2" size={20} />
                  Rapports de Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-600">Taux de Réussite</h4>
                      <TrendingUp size={16} className="text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">94.2%</p>
                    <p className="text-xs text-gray-500">+2.1% vs mois dernier</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-600">Temps Moyen</h4>
                      <Clock size={16} className="text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">2.8h</p>
                    <p className="text-xs text-gray-500">-15min vs mois dernier</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-600">Efficacité</h4>
                      <Target size={16} className="text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600">87.5%</p>
                    <p className="text-xs text-gray-500">+3.2% vs mois dernier</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-600">Satisfaction</h4>
                      <Users size={16} className="text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">4.6/5</p>
                    <p className="text-xs text-gray-500">+0.2 vs mois dernier</p>
                  </div>
                </div>
                <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Évolution des Performances</h4>
                  <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 size={32} className="mx-auto mb-2" />
                      <p className="text-sm">Graphique d'évolution des KPI</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analyses Géographiques */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="mr-2" size={20} />
                  Analyses Géographiques
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Couverture par Région</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-sm text-gray-600">Sud (Toliara)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">15 distributions</span>
                          <p className="text-xs text-gray-500">2,500 bénéficiaires</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-sm text-gray-600">Centre (Fianarantsoa)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">12 distributions</span>
                          <p className="text-xs text-gray-500">1,800 bénéficiaires</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                          <span className="text-sm text-gray-600">Nord (Mahajanga)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">8 distributions</span>
                          <p className="text-xs text-gray-500">1,200 bénéficiaires</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                          <span className="text-sm text-gray-600">Est (Antsirabe)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">6 distributions</span>
                          <p className="text-xs text-gray-500">900 bénéficiaires</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Distance et Temps</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Distance totale parcourue</span>
                        <span className="text-sm font-medium">2,847 km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Temps total de trajet</span>
                        <span className="text-sm font-medium">89h 30min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Distance moyenne</span>
                        <span className="text-sm font-medium">69.4 km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Temps moyen</span>
                        <span className="text-sm font-medium">2h 11min</span>
                      </div>
                    </div>
                    <div className="mt-4 h-24 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <MapPin size={24} className="mx-auto mb-1" />
                        <p className="text-xs">Carte des distributions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rapports de Bénéficiaires */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="mr-2" size={20} />
                  Rapports de Bénéficiaires
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Répartition par Âge</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">0-5 ans</span>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">6-17 ans</span>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">18-59 ans</span>
                        <span className="text-sm font-medium">30%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">60+ ans</span>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Types d'Aide</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Alimentaire</span>
                        <span className="text-sm font-medium">2,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Médicale</span>
                        <span className="text-sm font-medium">1,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Scolaire</span>
                        <span className="text-sm font-medium">800</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Vêtements</span>
                        <span className="text-sm font-medium">300</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Impact Social</h4>
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">6,100</p>
                        <p className="text-sm text-gray-600">Bénéficiaires totaux</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">41</p>
                        <p className="text-sm text-gray-600">Communautés touchées</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">94%</p>
                        <p className="text-sm text-gray-600">Taux de satisfaction</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rapports Financiers */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="mr-2" size={20} />
                  Rapports Financiers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Coûts par Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Carburant</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Personnel</span>
                        <span className="text-sm font-medium">30%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Maintenance</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Autres</span>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Budget et Économies</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Budget alloué</span>
                        <span className="text-sm font-medium">15,000,000 Ar</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Coût réel</span>
                        <span className="text-sm font-medium">12,300,000 Ar</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Économies</span>
                        <span className="text-sm font-medium text-green-600">2,700,000 Ar</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Coût par bénéficiaire</span>
                        <span className="text-sm font-medium">2,016 Ar</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp size={16} className="text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">18% d'économies réalisées</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => navigate('/distribution')}
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

function DistributionFormModal({ distribution, onSave, onClose }: { distribution: Distribution | null; onSave: (data: Partial<Distribution>) => void; onClose: () => void; }) {
  const [form, setForm] = useState<Partial<Distribution>>({
    reference: distribution?.reference || '',
    titre: distribution?.titre || '',
    description: distribution?.description || '',
    destination: distribution?.destination || '',
    datePlanification: distribution?.datePlanification || new Date().toISOString().split('T')[0],
    dateExecution: distribution?.dateExecution || undefined,
    statut: distribution?.statut || 'planifie',
    priorite: distribution?.priorite || 'normale',
    responsable: distribution?.responsable || '',
    vehicule: distribution?.vehicule || '',
    beneficiaires: distribution?.beneficiaires || 0,
    observations: distribution?.observations || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">{distribution ? 'Modifier la Distribution' : 'Nouvelle Distribution'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
              <input value={form.reference as any} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input value={form.titre as any} onChange={(e) => setForm({ ...form, titre: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input value={form.destination as any} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
              <input value={form.responsable as any} onChange={(e) => setForm({ ...form, responsable: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date planification</label>
              <input type="date" value={form.datePlanification as any} onChange={(e) => setForm({ ...form, datePlanification: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date exécution</label>
              <input type="date" value={(form.dateExecution as any) || ''} onChange={(e) => setForm({ ...form, dateExecution: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={form.statut as any} onChange={(e) => setForm({ ...form, statut: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg">
                <option value="planifie">Planifiée</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminée</option>
                <option value="annule">Annulée</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select value={form.priorite as any} onChange={(e) => setForm({ ...form, priorite: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg">
                <option value="basse">Basse</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaires</label>
              <input type="number" value={form.beneficiaires as any} onChange={(e) => setForm({ ...form, beneficiaires: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule</label>
              <input value={form.vehicule as any} onChange={(e) => setForm({ ...form, vehicule: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description as any} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DistributionDetailModal({ distribution, onClose }: { distribution: Distribution; onClose: () => void; }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{distribution.reference} - {distribution.titre}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Fermer</button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div><strong>Destination:</strong> {distribution.destination}</div>
          <div><strong>Responsable:</strong> {distribution.responsable}</div>
          <div><strong>Planification:</strong> {new Date(distribution.datePlanification).toLocaleDateString('fr-FR')}</div>
          {distribution.dateExecution && (<div><strong>Exécution:</strong> {new Date(distribution.dateExecution).toLocaleDateString('fr-FR')}</div>)}
          <div><strong>Statut:</strong> {distribution.statut}</div>
          <div><strong>Priorité:</strong> {distribution.priorite}</div>
          <div><strong>Bénéficiaires:</strong> {distribution.beneficiaires.toLocaleString()}</div>
          {distribution.description && (<div><strong>Description:</strong> {distribution.description}</div>)}
        </div>
      </div>
    </div>
  );
}
