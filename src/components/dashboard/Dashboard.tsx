import React, { useState, useEffect } from 'react';
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
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { articles, bonsReception, bonsSortie, distributions, fichesStock } from '../../data/mockData';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

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

  const totalArticles = articles.length;
  const stockFaible = articles.filter(a => (a.stock_actuel || 0) <= a.stock_minimum).length;
  const totalReceptions = bonsReception.length;
  const totalSorties = bonsSortie.length;
  const totalDistributions = distributions.length;
  const valeurStock = articles.reduce((sum, a) => sum + ((a.stock_actuel || 0) * a.prix_unitaire), 0);

  // Calculer les tendances
  const mouvementsRecents = fichesStock.slice(-10);
  const entrees = mouvementsRecents.filter(m => m.type_mouvement === 'entrée').length;
  const sorties = mouvementsRecents.filter(m => m.type_mouvement === 'sortie').length;
  const tendanceStock = entrees > sorties ? 'positive' : 'negative';

  const sameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  };

  const last7Days = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    return d;
  });

  const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const barData = last7Days.map(day => {
    const mouvementsDuJour = fichesStock.filter(m => sameDay(new Date(m.date_mouvement), day));
    const nbEntrees = mouvementsDuJour.filter(m => m.type_mouvement === 'entrée').length;
    const nbSorties = mouvementsDuJour.filter(m => m.type_mouvement === 'sortie').length;
    const total = nbEntrees + nbSorties;
    const color = nbEntrees >= nbSorties ? '#22c55e' : '#ef4444';
    return {
      label: dayLabels[day.getDay()],
      value: total,
      color,
    };
  });

  // Articles les plus populaires (simulation)
  const articlesPopulaires = articles.slice(0, 5).map(article => ({
    ...article,
    mouvements: Math.floor(Math.random() * 50) + 10
  }));

  return (
    <div className="space-y-8 p-6">
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
              </div>
            </div>
            <div className="mt-6 lg:mt-0">
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
          value={totalArticles}
          icon={Package}
          color="blue"
          trend={{ value: 5, isPositive: true }}
            description="Articles en stock"
        />
        <StatsCard
          title="Stock Faible"
          value={stockFaible}
          icon={AlertTriangle}
          color="red"
            description="Nécessite attention"
        />
        <StatsCard
          title="Bons Réception"
          value={totalReceptions}
          icon={FileText}
          color="green"
          trend={{ value: 12, isPositive: true }}
            description="Ce mois"
        />
        <StatsCard
          title="Bons Sortie"
          value={totalSorties}
          icon={Truck}
          color="yellow"
            description="Ce mois"
        />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <StatsCard
          title="Distributions"
          value={totalDistributions}
          icon={Users}
          color="green"
          description="Ce mois"
        />
        <StatsCard
          title="Mouvements Stock"
          value={fichesStock.length}
          icon={TrendingUp}
          color="blue"
          description="Total"
        />
        <StatsCard
          title="Valeur Stock"
          value={`${Math.round(valeurStock / 1000000)} M Ar`}
          icon={DollarSign}
          color="green"
          trend={{ value: 8, isPositive: true }}
          description="Valeur totale"
        />
      </div>

      {/* Graphiques et Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        {/* Tendances des mouvements */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tendances des Mouvements</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Entrées</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Sorties</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <ArrowUpRight size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Entrées</p>
                  <p className="text-sm text-gray-600">{entrees} mouvements</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">+{entrees}</p>
                <p className="text-sm text-green-600">Ce mois</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <ArrowDownRight size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sorties</p>
                  <p className="text-sm text-gray-600">{sorties} mouvements</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">-{sorties}</p>
                <p className="text-sm text-red-600">Ce mois</p>
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

        {/* Articles les plus populaires */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles Populaires</h3>
          <div className="space-y-3">
            {articlesPopulaires.map((article, index) => (
              <div key={article.id_article} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{article.designation}</p>
                    <p className="text-xs text-gray-600">{article.mouvements} mouvements</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{article.stock_actuel}</p>
                  <p className="text-xs text-gray-600">en stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activité Récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        {/* Articles en Stock Faible */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Articles en Stock Faible</h3>
            <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {stockFaible} articles
            </div>
          </div>
          <div className="space-y-3">
            {articles
              .filter(a => (a.stock_actuel || 0) <= a.stock_minimum)
              .slice(0, 5)
              .map(article => (
                <div key={article.id_article} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle size={20} className="text-white" />
                    </div>
                  <div>
                      <p className="font-semibold text-gray-900">{article.designation}</p>
                      <p className="text-sm text-gray-600">{article.code_article}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-600">{article.stock_actuel}</p>
                    <p className="text-sm text-red-600">Min: {article.stock_minimum}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Mouvements Récents */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Mouvements Récents</h3>
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {fichesStock.length} total
            </div>
          </div>
          <div className="space-y-3">
            {fichesStock.slice(-5).map(mouvement => (
              <div key={mouvement.id_fiche_stock} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    mouvement.type_mouvement === 'entrée' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {mouvement.type_mouvement === 'entrée' ? (
                      <ArrowUpRight size={20} className="text-white" />
                    ) : (
                      <ArrowDownRight size={20} className="text-white" />
                    )}
                  </div>
                <div>
                    <p className="font-semibold text-gray-900">{mouvement.demandeur}</p>
                    <p className="text-sm text-gray-600">
                      {mouvement.quantite} unités
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${
                    mouvement.type_mouvement === 'entrée' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {mouvement.type_mouvement === 'entrée' ? '+' : '-'}{mouvement.quantite}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(mouvement.date_mouvement).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}