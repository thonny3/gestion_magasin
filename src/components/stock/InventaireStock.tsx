import React, { useState, useMemo } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  BarChart3,
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-react';

interface Article {
  id: string;
  code: string;
  nom: string;
  categorie: string;
  stockActuel: number;
  stockMinimum: number;
  stockMaximum: number;
  unite: string;
  prixUnitaire: number;
  valeurStock: number;
  statut: 'normal' | 'faible' | 'rupture' | 'excedent';
  derniereMouvement: string;
  fournisseur: string;
}

const mockArticles: Article[] = [
  {
    id: '1',
    code: 'ART-001',
    nom: 'Riz Premium',
    categorie: 'Alimentation',
    stockActuel: 150,
    stockMinimum: 50,
    stockMaximum: 500,
    unite: 'kg',
    prixUnitaire: 2500,
    valeurStock: 375000,
    statut: 'normal',
    derniereMouvement: '2024-12-19T10:30:00',
    fournisseur: 'Fournisseur A'
  },
  {
    id: '2',
    code: 'ART-002',
    nom: 'Huile de cuisine',
    categorie: 'Alimentation',
    stockActuel: 25,
    stockMinimum: 30,
    stockMaximum: 100,
    unite: 'L',
    prixUnitaire: 3500,
    valeurStock: 87500,
    statut: 'faible',
    derniereMouvement: '2024-12-18T15:45:00',
    fournisseur: 'Fournisseur B'
  },
  {
    id: '3',
    code: 'ART-003',
    nom: 'Ciment',
    categorie: 'Construction',
    stockActuel: 0,
    stockMinimum: 20,
    stockMaximum: 200,
    unite: 'sacs',
    prixUnitaire: 15000,
    valeurStock: 0,
    statut: 'rupture',
    derniereMouvement: '2024-12-17T09:15:00',
    fournisseur: 'Fournisseur C'
  },
  {
    id: '4',
    code: 'ART-004',
    nom: 'Sucre',
    categorie: 'Alimentation',
    stockActuel: 600,
    stockMinimum: 100,
    stockMaximum: 500,
    unite: 'kg',
    prixUnitaire: 1800,
    valeurStock: 1080000,
    statut: 'excedent',
    derniereMouvement: '2024-12-19T14:20:00',
    fournisseur: 'Fournisseur A'
  }
];

export default function InventaireStock() {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('all');
  const [filterStatut, setFilterStatut] = useState<'all' | 'normal' | 'faible' | 'rupture' | 'excedent'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = 
        article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.fournisseur.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategorie = filterCategorie === 'all' || article.categorie === filterCategorie;
      const matchesStatut = filterStatut === 'all' || article.statut === filterStatut;
      
      return matchesSearch && matchesCategorie && matchesStatut;
    });
  }, [articles, searchTerm, filterCategorie, filterStatut]);

  const stats = useMemo(() => {
    const total = articles.length;
    const normal = articles.filter(a => a.statut === 'normal').length;
    const faible = articles.filter(a => a.statut === 'faible').length;
    const rupture = articles.filter(a => a.statut === 'rupture').length;
    const excedent = articles.filter(a => a.statut === 'excedent').length;
    const valeurTotale = articles.reduce((sum, a) => sum + a.valeurStock, 0);
    const alertes = faible + rupture;

    return {
      total,
      normal,
      faible,
      rupture,
      excedent,
      valeurTotale,
      alertes
    };
  }, [articles]);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'faible': return 'text-yellow-600 bg-yellow-100';
      case 'rupture': return 'text-red-600 bg-red-100';
      case 'excedent': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'normal': return <CheckCircle size={16} />;
      case 'faible': return <AlertTriangle size={16} />;
      case 'rupture': return <XCircle size={16} />;
      case 'excedent': return <TrendingUp size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getStockPercentage = (actuel: number, maximum: number) => {
    return Math.min((actuel / maximum) * 100, 100);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    console.log('Export de l\'inventaire...');
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-red-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Inventaire de Stock</h1>
              <p className="text-orange-100 text-lg">Gestion et surveillance des articles</p>
              <div className="flex items-center mt-4 space-x-4 text-orange-100">
                <div className="flex items-center space-x-2">
                  <Package size={20} />
                  <span>{stats.total} articles au total</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle size={20} />
                  <span>{stats.alertes} alertes</span>
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
        
        <div className="absolute top-4 right-4 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Articles</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs text-gray-500">Tous les articles</p>
            </div>
            <div className="p-4 bg-orange-500 rounded-xl">
              <Package size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Valeur Totale</p>
              <p className="text-3xl font-bold text-green-600 mb-1">{stats.valeurTotale.toLocaleString()} Ar</p>
              <p className="text-xs text-gray-500">Valeur du stock</p>
            </div>
            <div className="p-4 bg-green-500 rounded-xl">
              <DollarSign size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Alertes</p>
              <p className="text-3xl font-bold text-red-600 mb-1">{stats.alertes}</p>
              <p className="text-xs text-gray-500">Faible + Rupture</p>
            </div>
            <div className="p-4 bg-red-500 rounded-xl">
              <AlertTriangle size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Stock Normal</p>
              <p className="text-3xl font-bold text-blue-600 mb-1">{stats.normal}</p>
              <p className="text-xs text-gray-500">Articles en bon état</p>
            </div>
            <div className="p-4 bg-blue-500 rounded-xl">
              <CheckCircle size={24} className="text-white" />
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
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterCategorie}
                onChange={(e) => setFilterCategorie(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Toutes catégories</option>
                <option value="Alimentation">Alimentation</option>
                <option value="Construction">Construction</option>
                <option value="Électronique">Électronique</option>
              </select>

              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Tous les statuts</option>
                <option value="normal">Normal</option>
                <option value="faible">Faible</option>
                <option value="rupture">Rupture</option>
                <option value="excedent">Excédent</option>
              </select>
            </div>
          </div>

          <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center space-x-2">
            <Plus size={20} />
            <span>Nouvel Article</span>
          </button>
        </div>
      </div>

      {/* Tableau des articles */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Inventaire des Articles</h3>
          <p className="text-sm text-gray-600 mt-1">{filteredArticles.length} articles trouvés</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernier Mouvement
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{article.nom}</div>
                      <div className="text-xs text-gray-500">{article.code} - {article.categorie}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {article.stockActuel} {article.unite}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            article.statut === 'normal' ? 'bg-green-500' :
                            article.statut === 'faible' ? 'bg-yellow-500' :
                            article.statut === 'rupture' ? 'bg-red-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${getStockPercentage(article.stockActuel, article.stockMaximum)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Min: {article.stockMinimum} | Max: {article.stockMaximum}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(article.statut)}`}>
                      {getStatutIcon(article.statut)}
                      <span className="ml-1">
                        {article.statut === 'normal' ? 'Normal' : 
                         article.statut === 'faible' ? 'Faible' : 
                         article.statut === 'rupture' ? 'Rupture' : 'Excédent'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-semibold">{article.valeurStock.toLocaleString()} Ar</div>
                    <div className="text-xs text-gray-500">{article.prixUnitaire.toLocaleString()} Ar/{article.unite}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {article.fournisseur}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{new Date(article.derniereMouvement).toLocaleDateString('fr-FR')}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(article.derniereMouvement).toLocaleTimeString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="Voir détails">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200" title="Modifier">
                        <Edit size={16} />
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
      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-gray-400 mb-4">
              <Package size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📦 Aucun article trouvé</h3>
            <p className="text-gray-600 mb-4">Modifiez vos critères de recherche ou ajoutez un nouvel article</p>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200">
              Nouvel Article
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


