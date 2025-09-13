import { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import ChartCard from './ChartCard';
import QuickNavigation from '../layout/QuickNavigation';
import { 
  Package, 
  FileText, 
  Truck, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  DollarSign,
  BarChart3,
  Calendar,
  Clock,
  Activity,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ordresMissionApi, pvReceptionApi, userManagementApi } from '../../utils/api';

interface DashboardStats {
  totalArticles: number;
  stockFaible: number;
  totalReceptions: number;
  totalSorties: number;
 
  valeurStock: number;


  totalPV: number;
  pvFinalises: number;
  totalUsers: number;
  usersActifs: number;
}

interface RecentActivity {
  id: string;
  type:  'pv' | 'user';
  title: string;
  description: string;
  date: string;
  status: string;
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    stockFaible: 0,
    totalReceptions: 0,
    totalSorties: 0,
    
    valeurStock: 0,


    totalPV: 0,
    pvFinalises: 0,
    totalUsers: 0,
    usersActifs: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const hour = currentTime.getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');

    return () => clearInterval(timer);
  }, [currentTime]);

  // Charger les statistiques
  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Charger les statistiques en parallèle
      const [ pvResponse, usersResponse] = await Promise.allSettled([
       
        pvReceptionApi.stats(),
        userManagementApi.getUserStats()
      ]);

      const newStats: DashboardStats = {
        totalArticles: 0, // TODO: Implémenter l'API des articles
        stockFaible: 0,   // TODO: Implémenter l'API des articles
        totalReceptions: 0, // TODO: Implémenter l'API des bons de réception
        totalSorties: 0,    // TODO: Implémenter l'API des bons de sortie
       
        valeurStock: 0,    // TODO: Implémenter l'API des articles
       
       
        totalPV: 0,
        pvFinalises: 0,
        totalUsers: 0,
        usersActifs: 0
      };

     

      // Traiter les statistiques des PV
      if (pvResponse.status === 'fulfilled' && pvResponse.value.data.success) {
        const pvStats = pvResponse.value.data.data;
        newStats.totalPV = pvStats.total || 0;
        newStats.pvFinalises = pvStats.finalise || 0;
      }

      // Traiter les statistiques des utilisateurs
      if (usersResponse.status === 'fulfilled' && usersResponse.value.data.success) {
        const userStats = usersResponse.value.data.data;
        newStats.totalUsers = userStats.total || 0;
        newStats.usersActifs = userStats.actifs || 0;
      }

      setStats(newStats);
      setLastUpdate(new Date());

      // Charger l'activité récente
      await loadRecentActivity();

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger l'activité récente
  const loadRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Charger les missions récentes
    

      // Charger les PV récents
      try {
        const pvResponse = await pvReceptionApi.list({ limit: 3 });
        if (pvResponse.data.success) {
          const pvs = pvResponse.data.data;
          pvs.forEach((pv: any) => {
            activities.push({
              id: `pv-${pv.id_pv}`,
              type: 'pv',
              title: `PV ${pv.numero_pv}`,
              description: `${pv.fournisseur} - ${pv.adresse}`,
              date: pv.created_at,
              status: pv.statut
            });
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des PV récents:', error);
      }

      // Trier par date et prendre les 5 plus récents
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité récente:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Actualiser les données
  const handleRefresh = () => {
    loadStats();
  };

  // Calculer les tendances (simulation pour l'instant)
  // const entrees = Math.floor(stats.totalMissions * 0.6);
  // const sorties = Math.floor(stats.totalMissions * 0.4);

  const last7Days = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    return d;
  });

  const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Données simulées pour le graphique (à remplacer par des données réelles)
  const barData = last7Days.map(day => {
    const randomValue = Math.floor(Math.random() * 20) + 5;
    const color = randomValue > 12 ? '#22c55e' : '#ef4444';
    return {
      label: dayLabels[day.getDay()],
      value: randomValue,
      color,
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_cours': return 'text-blue-600 bg-blue-100';
      case 'termine': return 'text-green-600 bg-green-100';
      case 'annule': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'finalise': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      case 'draft': return 'Brouillon';
      case 'finalise': return 'Finalisé';
      default: return status;
    }
  };

  

  return (
    <div className="space-y-8 p-6">
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            onClick={handleRefresh}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      )}

      {/* Header avec salutation et heure */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{greeting} ! 👋</h1>
              <p className="text-blue-100 text-lg">Voici un aperçu de votre gestion de stock</p>
              <div className="flex items-center mt-4 space-x-4 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Calendar size={20} />
                  <span>{currentTime.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={20} />
                  <span>{currentTime.toLocaleTimeString('fr-FR')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RefreshCw size={16} />
                  <span className="text-sm">Dernière MAJ: {lastUpdate.toLocaleTimeString('fr-FR')}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4 hover:bg-opacity-30 transition-all duration-200 disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <RefreshCw size={24} className={isLoading ? 'animate-spin' : ''} />
                  <div>
                    <p className="text-sm opacity-90">Actualiser</p>
                    <p className="font-semibold">Données</p>
                  </div>
                </div>
              </button>
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Activity size={24} />
                  <div>
                    <p className="text-sm opacity-90">Statut Système</p>
                    <p className="font-semibold">Opérationnel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Formes décoratives */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
      </div>

      {/* Navigation Rapide Améliorée */}
      <div className="animate-fade-in-up">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 size={24} className="mr-2 text-blue-600" />
          Navigation Rapide
        </h2>
        <QuickNavigation />
      </div>

      {/* Stats Cards avec animations */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp size={24} className="mr-2 text-blue-600" />
          Statistiques Clés
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Articles"
            value={stats.totalArticles}
            icon={Package}
            color="blue"
            trend={{ value: 5, isPositive: true }}
            description="Articles en stock"
            isLoading={isLoading}
          />
          <StatsCard
            title="Stock Faible"
            value={stats.stockFaible}
            icon={AlertTriangle}
            color="red"
            description="Nécessite attention"
            isLoading={isLoading}
          />
          
          <StatsCard
            title="PV Réception"
            value={stats.totalPV}
            icon={FileText}
            color="yellow"
            trend={{ value: stats.pvFinalises, isPositive: true }}
            description={`${stats.pvFinalises} finalisés`}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <StatsCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={Users}
          color="green"
          description={`${stats.usersActifs} actifs`}
          isLoading={isLoading}
        />
        <StatsCard
          title="Bons Réception"
          value={stats.totalReceptions}
          icon={Truck}
          color="blue"
          description="Ce mois"
          isLoading={isLoading}
        />
        <StatsCard
          title="Valeur Stock"
          value={`${Math.round(stats.valeurStock / 1000000)} M Ar`}
          icon={DollarSign}
          color="green"
          trend={{ value: 8, isPositive: true }}
          description="Valeur totale"
          isLoading={isLoading}
        />
      </div>

      {/* Graphiques et Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        {/* Tendances des mouvements */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tendances des Activités</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Missions</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">PV</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">PV Réception</p>
                  <p className="text-sm text-gray-600">{stats.totalPV} total</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{stats.pvFinalises}</p>
                <p className="text-sm text-blue-600">Finalisés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphique barres simple */}
        <ChartCard
          title="Activité hebdomadaire"
          data={barData}
          total={barData.reduce((s, d) => s + d.value, 0)}
          trend={{ value: 6, isPositive: true }}
        />
      </div>

      {/* Activité Récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        {/* Activité Récente */}
       

        {/* Résumé des performances */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Résumé des Performances</h3>
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <CheckCircle size={16} className="inline mr-1" />
              Bon
            </div>
          </div>
          <div className="space-y-4">
            
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">PV Finalisés</p>
                  <p className="text-sm text-gray-600">Ce mois</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalPV > 0 ? Math.round((stats.pvFinalises / stats.totalPV) * 100) : 0}%
                </p>
                <p className="text-sm text-blue-600">Très bien</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}