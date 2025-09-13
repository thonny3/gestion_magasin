import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle, Download, Filter, Tag } from 'lucide-react';
import { Article } from '../../types';
import { articlesApi } from '../../utils/api';
import AddArticleModal from './AddArticleModal';
import CategoriesModal from './CategoriesModal';
import ImportModal from './ImportModal';
import FilterModal from './FilterModal';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

interface FilterCriteria {
  categorie: string;
  priceMin: string;
  priceMax: string;
  stockMin: string;
  stockMax: string;
  statut: string;
  fournisseur: string;
  marque: string;
  stockFaible: boolean;
  dateCreationFrom: string;
  dateCreationTo: string;
  emplacement: string;
}

const defaultFilters: FilterCriteria = {
  categorie: '',
  priceMin: '',
  priceMax: '',
  stockMin: '',
  stockMax: '',
  statut: '',
  fournisseur: '',
  marque: '',
  stockFaible: false,
  dateCreationFrom: '',
  dateCreationTo: '',
  emplacement: ''
};

export default function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await articlesApi.list();
        const items = (res.data?.items || []) as any[];
        // Map backend shape to frontend Article type
        const mapped: Article[] = items.map((a: any) => ({
          id_article: a.id,
          code_article: a.code_article,
          designation: a.designation,
          unite: a.unite_mesure,
          prix_unitaire: Number(a.prix_unitaire || 0),
          stock_minimum: Number(a.stock_minimum || 0),
          stock_actuel: Number(a.stock_actuel || 0),
          // Pass-through fields used by filters/table if present
          description: a.description,
          categorie: a.categorie,
          fournisseur: a.fournisseur,
          marque: a.marque,
          emplacement: a.emplacement,
          statut: a.statut,
        } as any));
        setArticles(mapped);
      } catch (e) {
        // ignore for now or add notification
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterCriteria>(defaultFilters);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  // Apply filters to articles
  const filteredArticles = articles.filter(article => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      article.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.code_article.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.description && article.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category filter
    const matchesCategory = !filters.categorie || article.categorie === filters.categorie;

    // Price range filter
    const matchesPriceMin = !filters.priceMin || article.prix_unitaire >= parseFloat(filters.priceMin);
    const matchesPriceMax = !filters.priceMax || article.prix_unitaire <= parseFloat(filters.priceMax);

    // Stock range filter
    const matchesStockMin = !filters.stockMin || (article.stock_actuel || 0) >= parseInt(filters.stockMin);
    const matchesStockMax = !filters.stockMax || (article.stock_actuel || 0) <= parseInt(filters.stockMax);

    // Stock faible filter
    const isStockFaible = (article.stock_actuel || 0) <= article.stock_minimum;
    const matchesStockFaible = !filters.stockFaible || isStockFaible;

    // Status filter
    const matchesStatus = !filters.statut || article.statut === filters.statut;

    // Supplier filter
    const matchesSupplier = !filters.fournisseur || article.fournisseur === filters.fournisseur;

    // Brand filter
    const matchesBrand = !filters.marque || 
      (article.marque && article.marque.toLowerCase().includes(filters.marque.toLowerCase()));

    // Location filter
    const matchesLocation = !filters.emplacement || article.emplacement === filters.emplacement;

    return matchesSearch && matchesCategory && matchesPriceMin && matchesPriceMax && 
           matchesStockMin && matchesStockMax && matchesStockFaible && matchesStatus && 
           matchesSupplier && matchesBrand && matchesLocation;
  });

  const handleAddArticle = async (newArticle: any) => {
    try {
      const payload = {
        code_article: newArticle.code_article,
        designation: newArticle.designation,
        description: newArticle.description,
        unite_mesure: newArticle.unite || newArticle.unite_mesure || 'pièce',
        categorie: newArticle.categorie,
        prix_unitaire: newArticle.prix_unitaire,
        stock_minimum: newArticle.stock_minimum,
        stock_actuel: newArticle.stock_actuel,
        fournisseur: newArticle.fournisseur,
        marque: newArticle.marque,
        reference_fournisseur: newArticle.reference_fournisseur,
        emplacement: newArticle.emplacement,
        date_peremption: newArticle.date_peremption || null,
        numero_lot: newArticle.numero_lot,
        statut: newArticle.statut || 'actif',
      };
      const res = await articlesApi.create(payload);
      const a = res.data?.item;
      if (a) {
        const mapped: Article = {
          id_article: a.id,
          code_article: a.code_article,
          designation: a.designation,
          unite: a.unite_mesure,
          prix_unitaire: Number(a.prix_unitaire || 0),
          stock_minimum: Number(a.stock_minimum || 0),
          stock_actuel: Number(a.stock_actuel || 0),
        } as any;
        setArticles([...articles, { ...mapped, ...a } as any]);
      }
    } catch (e) {
      // handle error
    }
  };

  const handleDeleteArticle = (article: Article) => {
    setArticleToDelete(article);
    setShowDeleteModal(true);
  };

  const confirmDeleteArticle = async () => {
    if (articleToDelete) {
      try {
        await articlesApi.remove(articleToDelete.id_article as any);
      setArticles(articles.filter(a => a.id_article !== articleToDelete.id_article));
      } catch (e) {
        // handle error
      } finally {
      setArticleToDelete(null);
        setShowDeleteModal(false);
      }
    }
  };

  const handleImportArticles = (importedArticles: any[]) => {
    setArticles([...articles, ...importedArticles]);
  };

  const handleApplyFilters = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
    
    // Count active filters
    const count = Object.entries(newFilters).filter(([key, value]) => {
      if (typeof value === 'boolean') return value;
      return value !== '';
    }).length;
    setActiveFiltersCount(count);
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    setActiveFiltersCount(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Articles</h2>
          <p className="text-slate-600">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} 
            {activeFiltersCount > 0 && ` (${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} appliqué${activeFiltersCount > 1 ? 's' : ''})`}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={16} />
          <span>Ajouter Articl</span>
        </button>
        
        <button
          onClick={() => setShowImportModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Download size={16} />
          <span>Importer</span>
        </button>
        
        <button
          onClick={() => setShowCategoriesModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Tag size={16} />
          <span>Catégories</span>
        </button>
        
        <button
          onClick={() => setShowFilterModal(true)}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeFiltersCount > 0
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Filter size={16} />
          <span>Filtrer</span>
          {activeFiltersCount > 0 && (
            <span className="bg-white text-orange-600 text-xs px-1.5 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 underline"
          >
            Effacer filtres
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un article..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && (
          <div className="p-4 text-sm text-slate-600">Chargement des articles...</div>
        )}
        {filteredArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Stock Actuel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Prix Unitaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredArticles.map((article) => {
                  const stockFaible = (article.stock_actuel || 0) <= article.stock_minimum;
                  return (
                    <tr key={article.id_article} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {article.designation}
                          </div>
                          <div className="text-sm text-slate-500">
                            {article.code_article} • {article.unite}
                          </div>
                          {article.description && (
                            <div className="text-xs text-slate-400 mt-1 truncate">
                              {article.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {article.categorie && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {article.categorie}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${stockFaible ? 'text-red-600' : 'text-slate-900'}`}>
                          {article.stock_actuel || 0} {article.unite}
                          {stockFaible && (
                            <div className="flex items-center mt-1 text-red-600">
                              <AlertTriangle size={14} className="mr-1" />
                              <span className="text-xs">Stock faible</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          Min: {article.stock_minimum}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {article.prix_unitaire.toLocaleString()} Ar
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stockFaible
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {stockFaible ? 'Stock faible' : 'En stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => console.log('Edit article:', article)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun article trouvé</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || activeFiltersCount > 0 
                ? 'Aucun article ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter votre premier article.'
              }
            </p>
            {(searchTerm || activeFiltersCount > 0) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearAllFilters();
                }}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Effacer la recherche et les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-600">Total articles</div>
            <div className="text-2xl font-bold text-slate-900">{filteredArticles.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-600">Stock faible</div>
            <div className="text-2xl font-bold text-red-600">
              {filteredArticles.filter(a => (a.stock_actuel || 0) <= a.stock_minimum).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-600">Valeur totale</div>
            <div className="text-2xl font-bold text-green-600">
              {filteredArticles.reduce((sum, a) => sum + ((a.stock_actuel || 0) * a.prix_unitaire), 0).toLocaleString()} Ar
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-600">Catégories</div>
            <div className="text-2xl font-bold text-blue-600">
              {new Set(filteredArticles.map(a => a.categorie).filter(Boolean)).size}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddArticleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddArticle}
      />

      <CategoriesModal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        onSave={(categories) => console.log('Categories saved:', categories)}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportArticles}
      />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setArticleToDelete(null);
        }}
        onConfirm={confirmDeleteArticle}
        title="Supprimer l'article"
        itemName={articleToDelete?.designation}
        itemType="article"
        warningMessage="Cette action supprimera définitivement l'article et toutes ses données associées."
        isDangerous={true}
      />
    </div>
  );
}