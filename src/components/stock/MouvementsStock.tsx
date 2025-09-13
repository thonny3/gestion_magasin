import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Calendar,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Download,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { FicheStock } from '../../types';
import { stockApi } from '../../utils/api';

export default function MouvementsStock() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'entrée' | 'sortie'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showStats, setShowStats] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [movements, setMovements] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await stockApi.listMovements();
        const items = (res.data?.items || []) as any[];
        setMovements(items);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const fichesStockWithArticles = useMemo(() => movements, [movements]);

  // Filtrage avancé
  const filteredFiches = useMemo(() => {
    let filtered = fichesStockWithArticles;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(fiche => 
        fiche.article?.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fiche.demandeur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fiche.article?.code_article.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type
    if (filterType !== 'all') {
      filtered = filtered.filter(fiche => fiche.type_mouvement === filterType);
    }

    // Filtre par date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (dateRange) {
      case 'today':
        filtered = filtered.filter(fiche => new Date(fiche.date_mouvement) >= today);
        break;
      case 'week':
        filtered = filtered.filter(fiche => new Date(fiche.date_mouvement) >= weekAgo);
        break;
      case 'month':
        filtered = filtered.filter(fiche => new Date(fiche.date_mouvement) >= monthAgo);
        break;
    }

    return filtered;
  }, [fichesStockWithArticles, searchTerm, filterType, dateRange]);

  // Statistiques
  const stats = useMemo(() => {
    const totalEntrees = filteredFiches.filter(f => f.type_mouvement === 'entrée').length;
    const totalSorties = filteredFiches.filter(f => f.type_mouvement === 'sortie').length;
    const totalQuantiteEntrees = filteredFiches
      .filter(f => f.type_mouvement === 'entrée')
      .reduce((sum, f) => sum + f.quantite, 0);
    const totalQuantiteSorties = filteredFiches
      .filter(f => f.type_mouvement === 'sortie')
      .reduce((sum, f) => sum + f.quantite, 0);
    const valeurEntrees = filteredFiches
      .filter(f => f.type_mouvement === 'entrée')
      .reduce((sum, f) => sum + (f.valeur || 0), 0);
    const valeurSorties = filteredFiches
      .filter(f => f.type_mouvement === 'sortie')
      .reduce((sum, f) => sum + (f.valeur || 0), 0);

    return {
      totalEntrees,
      totalSorties,
      totalQuantiteEntrees,
      totalQuantiteSorties,
      valeurEntrees,
      valeurSorties,
      solde: totalQuantiteEntrees - totalQuantiteSorties,
      valeurSolde: valeurEntrees - valeurSorties
    };
  }, [filteredFiches]);

  // Articles les plus mouvementés
  const articlesPopulaires = useMemo(() => {
    const articleStats = new Map();
    
    filteredFiches.forEach(fiche => {
      const articleId = fiche.id_article;
      if (!articleStats.has(articleId)) {
        articleStats.set(articleId, { entrées: 0, sorties: 0, total: 0 });
      }
      const stats = articleStats.get(articleId);
      if (fiche.type_mouvement === 'entrée') {
        stats.entrées += fiche.quantite;
      } else {
        stats.sorties += fiche.quantite;
      }
      stats.total += fiche.quantite;
    });

    return Array.from(articleStats.entries())
      .map(([articleId, stats]) => ({
        article: fichesStockWithArticles.find(f => f.id_article === articleId)?.article,
        ...stats
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredFiches, fichesStockWithArticles]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Mouvements de Stock</title>
        <style>
          body{font-family:Arial, sans-serif; padding:24px;}
          .brand{display:flex; align-items:center; gap:12px; margin-bottom:12px}
          .brand img{width:48px; height:48px; object-fit:contain}
          h1{margin:0}
          table{width:100%; border-collapse:collapse; margin-top:16px}
          th,td{border:1px solid #e5e7eb; padding:8px; font-size:12px}
          th{background:#f8fafc; text-align:left}
        </style>
      </head>
      <body>
        <div class="brand">
          <img src="${location.origin}/logo.jpg" />
          <div>
            <h1>Mouvements de Stock</h1>
            <div>${new Date().toLocaleString('fr-FR')}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Type</th><th>Article</th><th>Code</th><th>Qté</th><th>Reste</th><th>Demandeur</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${filteredFiches.map(f=>`<tr>
              <td>${f.type_mouvement}</td>
              <td>${f.article?.designation||''}</td>
              <td>${f.article?.code_article||''}</td>
              <td>${f.quantite}</td>
              <td>${f.reste}</td>
              <td>${f.demandeur}</td>
              <td>${new Date(f.date_mouvement).toLocaleString('fr-FR')}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
              <h1 className="text-3xl font-bold mb-2">Mouvements de Stock</h1>
              <p className="text-blue-100 text-lg">Suivi détaillé des entrées et sorties</p>
              <div className="flex items-center mt-4 space-x-4 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Activity size={20} />
                  <span>{filteredFiches.length} mouvements trouvés {isLoading && '(chargement...)'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={20} />
                  <span>Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}</span>
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
      {showStats && (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 size={24} className="mr-2 text-blue-600" />
              Statistiques des Mouvements
            </h2>
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showStats ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Entrées */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Entrées</p>
                  <p className="text-3xl font-bold text-green-600 mb-1">{stats.totalEntrees}</p>
                  <p className="text-xs text-gray-500">+{stats.totalQuantiteEntrees} unités</p>
                </div>
                <div className="p-4 bg-green-500 rounded-xl">
                  <ArrowUpRight size={24} className="text-white" />
                </div>
              </div>
            </div>

            {/* Sorties */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Sorties</p>
                  <p className="text-3xl font-bold text-red-600 mb-1">{stats.totalSorties}</p>
                  <p className="text-xs text-gray-500">-{stats.totalQuantiteSorties} unités</p>
                </div>
                <div className="p-4 bg-red-500 rounded-xl">
                  <ArrowDownRight size={24} className="text-white" />
                </div>
              </div>
            </div>

            {/* Solde */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Solde</p>
                  <p className={`text-3xl font-bold mb-1 ${stats.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.solde >= 0 ? '+' : ''}{stats.solde}
                  </p>
                  <p className="text-xs text-gray-500">Net</p>
                </div>
                <div className={`p-4 rounded-xl ${stats.solde >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                  <Package size={24} className="text-white" />
                </div>
              </div>
            </div>

            {/* Valeur */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Valeur</p>
                  <p className={`text-3xl font-bold mb-1 ${stats.valeurSolde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.round(stats.valeurSolde / 1000)}k Ar
                  </p>
                  <p className="text-xs text-gray-500">Net</p>
                </div>
                <div className={`p-4 rounded-xl ${stats.valeurSolde >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                  <BarChart3 size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles populaires */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart size={20} className="mr-2 text-blue-600" />
            Articles les Plus Mouvementés
          </h3>
          <div className="space-y-4">
            {articlesPopulaires.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.article?.designation}</p>
                    <p className="text-sm text-gray-600">{item.article?.code_article}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{item.total} unités</p>
                  <div className="flex space-x-2 text-xs">
                    <span className="text-green-600">+{item.entrées}</span>
                    <span className="text-red-600">-{item.sorties}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter size={20} className="mr-2 text-blue-600" />
            Filtres
          </h3>
          
          {/* Recherche */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
                placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

            {/* Type de mouvement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de mouvement</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'entrée' | 'sortie')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">Tous les mouvements</option>
            <option value="entrée">Entrées uniquement</option>
            <option value="sortie">Sorties uniquement</option>
          </select>
            </div>

            {/* Période */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'all' | 'today' | 'week' | 'month')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Toutes les périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des mouvements */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Liste des Mouvements</h3>
            <p className="text-sm text-gray-600 mt-1">{filteredFiches.length} mouvements affichés {isLoading && '(chargement...)'}</p>
          </div>
          
        <div className="overflow-x-auto">
          <table className="w-full">
              <thead className="bg-gray-50">
              <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Restant
                </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demandeur
                </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFiches.map((fiche, index) => (
                  <tr key={fiche.id_fiche_stock} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                          fiche.type_mouvement === 'entrée' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                      {fiche.type_mouvement === 'entrée' ? (
                            <ArrowUpRight size={20} className="text-green-600" />
                      ) : (
                            <ArrowDownRight size={20} className="text-red-600" />
                      )}
                        </div>
                        <span className={`text-sm font-semibold ${
                        fiche.type_mouvement === 'entrée' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {fiche.type_mouvement === 'entrée' ? 'Entrée' : 'Sortie'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                      {fiche.article?.designation || 'Article introuvable'}
                    </div>
                        <div className="text-sm text-gray-500">
                      {fiche.article?.code_article}
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${
                      fiche.type_mouvement === 'entrée' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {fiche.type_mouvement === 'entrée' ? '+' : '-'}{fiche.quantite} {fiche.article?.unite}
                    </span>
                  </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                    {fiche.reste} {fiche.article?.unite}
                      </div>
                  </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                    {fiche.demandeur}
                      </div>
                      <div className="text-xs text-gray-500">
                        {fiche.observation}
                      </div>
                  </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                    {new Date(fiche.date_mouvement).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(fiche.date_mouvement).toLocaleTimeString('fr-FR')}
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* État vide */}
      {filteredFiches.length === 0 && (
        <div className="text-center py-12 animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-gray-400 mb-4">
              <Search size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Aucun mouvement trouvé</h3>
            <p className="text-gray-600 mb-4">Modifiez vos critères de recherche pour afficher les résultats</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setDateRange('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}
    </div>
  );
}