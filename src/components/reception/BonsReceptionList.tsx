import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, FileText, Eye, Package, Calendar, User, X, Download } from 'lucide-react';
import { BonReception, LigneReception, Article } from '../../types';
import { users } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';
import { articlesApi, bonsReceptionApi } from '../../utils/api';

export default function BonsReceptionList() {
  const { user } = useAuth();
  const [bonsReception, setBonsReception] = useState<BonReception[]>([]);
  const [lignesReception, setLignesReception] = useState<LigneReception[]>([]);
  const [loading, setLoading] = useState(false);
  const [articlesList, setArticlesList] = useState<Article[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await bonsReceptionApi.list();
        const items = (res.data?.items || []) as any[];
        const mapped: BonReception[] = items.map((b) => ({
          id_bon_reception: b.id,
          numero_bon: b.numero_bon,
          date_reception: b.date_reception,
          district: b.district,
          commune: b.commune,
          fournisseur: b.fournisseur,
          utilisateur_id: b.utilisateur_id || 0,
        }));
        setBonsReception(mapped);
        
        // Load lignes for all bons de réception
        const allLignes: LigneReception[] = [];
        for (const bon of mapped) {
          try {
            const resLignes = await bonsReceptionApi.get(bon.id_bon_reception);
            const lignes = (resLignes.data?.lignes || []) as any[];
            const mappedLignes: LigneReception[] = lignes.map((l) => ({
              id_ligne_reception: l.id,
              id_bon_reception: l.bon_reception_id,
              id_article: l.article_id,
              quantite: Number(l.quantite),
              prix_unitaire: Number(l.prix_unitaire),
              montant: Number(l.montant ?? Number(l.quantite) * Number(l.prix_unitaire)),
            }));
            allLignes.push(...mappedLignes);
          } catch (error) {
            console.error(`Error loading lignes for bon ${bon.id_bon_reception}:`, error);
          }
        }
        setLignesReception(allLignes);
        
        // Load articles for selection
        const resArt = await articlesApi.list();
        const itemsArt = (resArt.data?.items || []) as any[];
        const mappedArt: Article[] = itemsArt.map((a: any) => ({
          id_article: a.id,
          code_article: a.code_article,
          designation: a.designation,
          unite: a.unite_mesure,
          prix_unitaire: Number(a.prix_unitaire || 0),
          stock_minimum: Number(a.stock_minimum || 0),
          stock_actuel: Number(a.stock_actuel || 0),
        } as any));
        setArticlesList(mappedArt);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showArticlesModal, setShowArticlesModal] = useState(false);
  const [editingBon, setEditingBon] = useState<BonReception | null>(null);
  const [selectedBon, setSelectedBon] = useState<BonReception | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BonReception | null>(null);

  const bonsReceptionWithUsers = bonsReception.map(bon => ({
    ...bon,
    utilisateur: users.find(u => u.id_utilisateur === bon.utilisateur_id),
    lignes: lignesReception.filter(l => l.id_bon_reception === bon.id_bon_reception)
  }));

  const visibleBons = (user?.role === 'admin')
    ? bonsReceptionWithUsers
    : bonsReceptionWithUsers.filter(b => b.utilisateur_id === Number(user?.id));

  const filteredBons = visibleBons.filter(bon =>
    bon.numero_bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (bon: BonReception) => {
    setEditingBon(bon);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingBon(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const target = bonsReception.find(b => b.id_bon_reception === id) || null;
    setDeleteTarget(target);
    setConfirmDeleteOpen(true);
  };

  const handleViewDetails = async (bon: BonReception) => {
    setSelectedBon(bon);
    // Load lignes from backend for this bon
    try {
      const res = await bonsReceptionApi.get(bon.id_bon_reception);
      const lignes = (res.data?.lignes || []) as any[];
      const mapped: LigneReception[] = lignes.map((l) => ({
        id_ligne_reception: l.id,
        id_bon_reception: l.bon_reception_id,
        id_article: l.article_id,
        quantite: Number(l.quantite),
        prix_unitaire: Number(l.prix_unitaire),
        montant: Number(l.montant ?? Number(l.quantite) * Number(l.prix_unitaire)),
      }));
      // merge into state cache
      const others = lignesReception.filter(l => l.id_bon_reception !== bon.id_bon_reception);
      setLignesReception([...others, ...mapped]);
    } catch {}
    setShowDetailModal(true);
  };

  const handleAddArticles = async (bon: BonReception) => {
    setSelectedBon(bon);
    // Load existing lignes for editing - always fetch fresh data
    try {
      const res = await bonsReceptionApi.get(bon.id_bon_reception);
      const lignes = (res.data?.lignes || []) as any[];
      const mapped: LigneReception[] = lignes.map((l) => ({
        id_ligne_reception: l.id,
        id_bon_reception: l.bon_reception_id,
        id_article: l.article_id,
        quantite: Number(l.quantite),
        prix_unitaire: Number(l.prix_unitaire),
        montant: Number(l.montant ?? Number(l.quantite) * Number(l.prix_unitaire)),
      }));
      // Update the lignes state with fresh data
      const others = lignesReception.filter(l => l.id_bon_reception !== bon.id_bon_reception);
      setLignesReception([...others, ...mapped]);
    } catch (error) {
      console.error('Error loading lignes:', error);
    }
    setShowArticlesModal(true);
  };

  const handleSaveBon = async (formData: any) => {
    if (editingBon) {
      const payload = {
        numero_bon: editingBon.numero_bon,
        date_reception: formData.date_reception,
        district: formData.district,
        commune: formData.commune,
        fournisseur: formData.fournisseur,
      };
      const res = await bonsReceptionApi.update(editingBon.id_bon_reception, payload);
      const item = res.data?.item;
      setBonsReception(bonsReception.map(b => b.id_bon_reception === editingBon.id_bon_reception ? {
        ...b,
        date_reception: item.date_reception,
        district: item.district,
        commune: item.commune,
        fournisseur: item.fournisseur,
      } : b));
    } else {
      const payload = {
        date_reception: formData.date_reception,
        district: formData.district,
        commune: formData.commune,
        fournisseur: formData.fournisseur,
      };
      const res = await bonsReceptionApi.create(payload);
      const item = res.data?.item;
      if (item) {
        setBonsReception([...bonsReception, {
          id_bon_reception: item.id,
          numero_bon: item.numero_bon,
          date_reception: item.date_reception,
          district: item.district,
          commune: item.commune,
          fournisseur: item.fournisseur,
          utilisateur_id: item.utilisateur_id || 0,
        }]);
      }
    }
    setShowModal(false);
    setEditingBon(null);
  };

  const totalMontant = lignesReception.reduce((sum, ligne) => sum + ligne.montant, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bons de Réception</h2>
          <p className="text-slate-600">Gérez vos réceptions de marchandises</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nouveau Bon</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un bon de réception..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Réceptions</p>
              <p className="text-2xl font-bold text-slate-900">{visibleBons.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Ce Mois</p>
              <p className="text-2xl font-bold text-slate-900">
                {visibleBons.filter(b => new Date(b.date_reception).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <User className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Fournisseurs</p>
              <p className="text-2xl font-bold text-slate-900">
                {new Set(visibleBons.map(b => b.fournisseur)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Valeur Totale</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalMontant >= 1_000_000
                  ? `${Math.round(totalMontant / 1_000_000)} M Ar`
                  : `${totalMontant.toLocaleString()} Ar`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bons Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && (
          <div className="p-3 text-sm text-slate-600">Chargement des bons de réception...</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  N° Bon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Localisation
                </th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Créé par
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Articles
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
              {filteredBons.map((bon) => {
                const nbArticles = bon.lignes?.length || 0;
                return (
                  <tr key={bon.id_bon_reception} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {bon.numero_bon}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {new Date(bon.date_reception).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {bon.fournisseur}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {bon.district}
                      </div>
                      <div className="text-sm text-slate-500">
                        {bon.commune}
                      </div>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {bon.utilisateur ? `${bon.utilisateur.prenom} ${bon.utilisateur.nom}` : 'N/A'}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          nbArticles > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {nbArticles} article{nbArticles > 1 ? 's' : ''}
                        </span>
                        {nbArticles === 0 && (
                          <button
                            onClick={() => handleAddArticles(bon)}
                            className="text-blue-600 hover:text-blue-900 text-xs underline"
                          >
                            + Ajouter
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        nbArticles > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {nbArticles > 0 ? 'Validé' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(bon)}
                          className="text-green-600 hover:text-green-900"
                          title="Voir détails"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleAddArticles(bon)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Gérer articles"
                        >
                          <Package size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(bon)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(bon.id_bon_reception)}
                          className="text-red-600 hover:text-red-900"
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
      </div>

      {/* Modal Création/Modification */}
      {showModal && (
        <BonReceptionModal
          bon={editingBon}
          onSave={handleSaveBon}
          onClose={() => {
            setShowModal(false);
            setEditingBon(null);
          }}
        />
      )}

      {/* Modal Articles */}
      {showArticlesModal && selectedBon && (
        <ArticlesModal
          bon={selectedBon}
          lignes={lignesReception.filter(l => l.id_bon_reception === selectedBon.id_bon_reception)}
          articlesOptions={articlesList}
          onSave={async (newLignes) => {
            try {
              // Persist lignes to backend
              const payload = newLignes.map(l => ({ article_id: l.id_article, quantite: l.quantite, prix_unitaire: l.prix_unitaire }));
              await bonsReceptionApi.saveLignes(selectedBon.id_bon_reception, payload as any);
              // Reload lignes from backend to ensure ids
              const res = await bonsReceptionApi.get(selectedBon.id_bon_reception);
              const lignes = (res.data?.lignes || []) as any[];
              const mapped: LigneReception[] = lignes.map((l) => ({
                id_ligne_reception: l.id,
                id_bon_reception: l.bon_reception_id,
                id_article: l.article_id,
                quantite: Number(l.quantite),
                prix_unitaire: Number(l.prix_unitaire),
                montant: Number(l.montant ?? Number(l.quantite) * Number(l.prix_unitaire)),
              }));
              const otherLignes = lignesReception.filter(l => l.id_bon_reception !== selectedBon.id_bon_reception);
              setLignesReception([...otherLignes, ...mapped]);
              
              // Force refresh the bons reception data to show updated article count
              const resBons = await bonsReceptionApi.list();
              const items = (resBons.data?.items || []) as any[];
              const mappedBons: BonReception[] = items.map((b) => ({
                id_bon_reception: b.id,
                numero_bon: b.numero_bon,
                date_reception: b.date_reception,
                district: b.district,
                commune: b.commune,
                fournisseur: b.fournisseur,
                utilisateur_id: b.utilisateur_id || 0,
              }));
              setBonsReception(mappedBons);
            } finally {
              setShowArticlesModal(false);
            }
          }}
          onClose={() => {
            setShowArticlesModal(false);
            setSelectedBon(null);
          }}
        />
      )}

      {/* Modal Détails */}
      {showDetailModal && selectedBon && (
        <BonReceptionDetailModal
          bon={selectedBon}
          lignes={lignesReception.filter(l => l.id_bon_reception === selectedBon.id_bon_reception)}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBon(null);
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await bonsReceptionApi.remove(deleteTarget.id_bon_reception);
          setBonsReception(bonsReception.filter(b => b.id_bon_reception !== deleteTarget.id_bon_reception));
          setLignesReception(lignesReception.filter(l => l.id_bon_reception !== deleteTarget.id_bon_reception));
        }}
        title="Confirmer la suppression"
        itemType="bon de réception"
        itemName={deleteTarget?.numero_bon}
        isDangerous
      />
    </div>
  );
}

// Composant Modal pour Création/Modification
function BonReceptionModal({ 
  bon, 
  onSave, 
  onClose 
}: { 
  bon: BonReception | null; 
  onSave: (data: any) => void; 
  onClose: () => void; 
}) {
  const normalizeDate = (value: string | undefined) => {
    if (!value) return new Date().toISOString().split('T')[0];
    try {
      // Handle values like '2024-09-05' or ISO strings
      const onlyDate = value.includes('T') ? new Date(value).toISOString().split('T')[0] : value;
      return onlyDate;
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const [formData, setFormData] = useState({
    date_reception: normalizeDate(bon?.date_reception),
    district: bon?.district || '',
    commune: bon?.commune || '',
    fournisseur: bon?.fournisseur || ''
  });

  useEffect(() => {
    setFormData({
      date_reception: normalizeDate(bon?.date_reception),
      district: bon?.district || '',
      commune: bon?.commune || '',
      fournisseur: bon?.fournisseur || ''
    });
  }, [bon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {bon ? 'Modifier le bon de réception' : 'Nouveau bon de réception'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date de réception *
              </label>
              <input
                type="date"
                required
                value={formData.date_reception}
                onChange={(e) => setFormData({...formData, date_reception: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fournisseur *
              </label>
              <input
                type="text"
                required
                value={formData.fournisseur}
                onChange={(e) => setFormData({...formData, fournisseur: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom du fournisseur"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                District *
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="District"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Commune *
              </label>
              <input
                type="text"
                required
                value={formData.commune}
                onChange={(e) => setFormData({...formData, commune: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Commune"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📋 Étapes suivantes</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. ✅ Créer le bon de réception</li>
              <li>2. 📦 Ajouter les articles reçus (bouton "Gérer articles")</li>
              <li>3. ✅ Valider pour mettre à jour le stock</li>
              <li>4. 📄 Générer le PV de réception</li>
            </ol>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {bon ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Composant Modal pour Ajouter/Modifier Articles
function ArticlesModal({ 
  bon, 
  lignes,
  articlesOptions,
  onSave, 
  onClose 
}: { 
  bon: BonReception; 
  lignes: LigneReception[];
  articlesOptions: any[];
  onSave: (lignes: LigneReception[]) => void; 
  onClose: () => void; 
}) {
  const [articleLignes, setArticleLignes] = useState<LigneReception[]>(lignes);
  const [newLigne, setNewLigne] = useState({
    id_article: '',
    quantite: '',
    prix_unitaire: ''
  });

  const handleAddLigne = () => {
    if (!newLigne.id_article || !newLigne.quantite || !newLigne.prix_unitaire) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const article = articlesOptions.find((a: Article) => a.id_article === parseInt(newLigne.id_article));
    if (!article) return;

    const quantite = parseInt(newLigne.quantite);
    const prixUnitaire = parseFloat(newLigne.prix_unitaire);
    const montant = quantite * prixUnitaire;

    const nouvelleLigne: LigneReception = {
      id_ligne_reception: Math.max(...articleLignes.map(l => l.id_ligne_reception), 0) + 1,
      id_bon_reception: bon.id_bon_reception,
      id_article: parseInt(newLigne.id_article),
      quantite,
      prix_unitaire: prixUnitaire,
      montant
    };

    setArticleLignes([...articleLignes, nouvelleLigne]);
    setNewLigne({ id_article: '', quantite: '', prix_unitaire: '' });
  };

  const handleRemoveLigne = (id: number) => {
    setArticleLignes(articleLignes.filter(l => l.id_ligne_reception !== id));
  };

  const handleSave = () => {
    onSave(articleLignes);
  };

  const totalMontant = articleLignes.reduce((sum, ligne) => sum + ligne.montant, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900">
            📦 Gérer les Articles - {bon.numero_bon}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Ajouter un nouvel article */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-blue-900 mb-3">➕ Ajouter un article</h4>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Article</label>
              <select
                value={newLigne.id_article}
                onChange={(e) => setNewLigne({...newLigne, id_article: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner...</option>
                {articlesOptions.map(article => (
                  <option key={article.id_article} value={article.id_article}>
                    {article.designation}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantité</label>
              <input
                type="number"
                value={newLigne.quantite}
                onChange={(e) => setNewLigne({...newLigne, quantite: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix unitaire</label>
              <input
                type="number"
                value={newLigne.prix_unitaire}
                onChange={(e) => setNewLigne({...newLigne, prix_unitaire: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddLigne}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Liste des articles */}
        <div className="mb-6">
          <h4 className="font-medium text-slate-900 mb-3">📋 Articles du bon de réception</h4>
          {articleLignes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Aucun article ajouté</p>
              <p className="text-sm">Utilisez le formulaire ci-dessus pour ajouter des articles</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-slate-200 rounded-lg">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Article</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Quantité</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Prix Unit.</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Montant</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {articleLignes.map((ligne: any) => {
                    const articleAny: any = (articlesOptions as any[]).find((a: any) => a.id_article === ligne.id_article);
                    return (
                      <tr key={ligne.id_ligne_reception}>
                        <td className="px-4 py-2">
                          <div>
                            <div className="font-medium text-slate-900">{articleAny?.designation}</div>
                            <div className="text-sm text-slate-500">{articleAny?.code_article}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-slate-900">
                          {ligne.quantite} {articleAny?.unite}
                        </td>
                        <td className="px-4 py-2 text-slate-900">
                          {ligne.prix_unitaire.toLocaleString()} Ar
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-900">
                          {ligne.montant.toLocaleString()} Ar
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleRemoveLigne(ligne.id_ligne_reception)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 font-medium text-slate-900">Total</td>
                    <td className="px-4 py-2 font-bold text-slate-900">
                      {totalMontant.toLocaleString()} Ar
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            💾 Enregistrer les Articles
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant Modal pour les Détails
function BonReceptionDetailModal({ 
  bon, 
  lignes,
  onClose 
}: { 
  bon: BonReception; 
  lignes: LigneReception[];
  onClose: () => void; 
}) {
  const lignesWithArticles = lignes as any[];

  const totalMontant = lignes.reduce((sum, ligne) => sum + ligne.montant, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Détails du Bon de Réception - {bon.numero_bon}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Informations générales */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-600">Date de réception</label>
              <p className="text-slate-900">{new Date(bon.date_reception).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Fournisseur</label>
              <p className="text-slate-900">{bon.fournisseur}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-600">Localisation</label>
              <p className="text-slate-900">{bon.district}, {bon.commune}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Exporter</label>
              <div>
                <button
                  onClick={() => printBonReception(bon, lignesWithArticles)}
                  className="inline-flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  <Download size={16} className="mr-2" />
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Articles reçus */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-slate-900 mb-3">Articles Reçus</h4>
          {lignesWithArticles.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Aucun article dans ce bon</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-slate-200 rounded-lg">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Article</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Quantité</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Prix Unit.</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {lignesWithArticles.map((ligne) => (
                    <tr key={ligne.id_ligne_reception}>
                      <td className="px-4 py-2">
                        <div>
                          <div className="font-medium text-slate-900">{ligne.article?.designation}</div>
                          <div className="text-sm text-slate-500">{ligne.article?.code_article}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-slate-900">
                        {ligne.quantite} {ligne.article?.unite}
                      </td>
                      <td className="px-4 py-2 text-slate-900">
                        {ligne.prix_unitaire.toLocaleString()} Ar
                      </td>
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {ligne.montant.toLocaleString()} Ar
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 font-medium text-slate-900">Total</td>
                    <td className="px-4 py-2 font-bold text-slate-900">
                      {totalMontant.toLocaleString()} Ar
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function printBonReception(bon: any, lignes: any[]) {
  const total = lignes.reduce((s, l) => s + Number(l.montant || 0), 0);
  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Bon de Réception ${bon.numero_bon}</title>
      <style>
        body{font-family:Arial, sans-serif; padding:24px;}
        .header{display:flex; align-items:center; justify-content:space-between;}
        .brand{display:flex; align-items:center; gap:12px}
        .brand img{width:56px; height:56px; object-fit:contain}
        h1{margin:0 0 4px 0}
        table{width:100%; border-collapse:collapse; margin-top:16px}
        th,td{border:1px solid #e5e7eb; padding:8px; font-size:12px}
        th{background:#f8fafc; text-align:left}
        .muted{color:#475569}
        .total{font-weight:bold}
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">
          <img src="${location.origin}/logo.jpg" />
          <div>
            <h1>Bon de Réception</h1>
            <div class="muted">${bon.numero_bon}</div>
          </div>
        </div>
        <div>
          <div>Date: ${new Date(bon.date_reception).toLocaleDateString('fr-FR')}</div>
          <div>Fournisseur: ${bon.fournisseur}</div>
          <div>Lieu: ${bon.district}, ${bon.commune}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Article</th><th>Code</th><th>Quantité</th><th>PU</th><th>Montant</th>
          </tr>
        </thead>
        <tbody>
          ${lignes.map(l=>`<tr>
            <td>${l.article?.designation||''}</td>
            <td>${l.article?.code_article||''}</td>
            <td>${l.quantite||''} ${l.article?.unite||''}</td>
            <td>${Number(l.prix_unitaire||0).toLocaleString()} Ar</td>
            <td>${Number(l.montant||0).toLocaleString()} Ar</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" class="total">Total</td>
            <td class="total">${total.toLocaleString()} Ar</td>
          </tr>
        </tfoot>
      </table>
      <script>window.onload = () => window.print();</script>
    </body>
  </html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}