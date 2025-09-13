import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Truck, Eye, FileText, Users, MapPin, Package, X, Download } from 'lucide-react';
import { BonSortie, LigneSortie } from '../../types';
import { users } from '../../data/mockData';
import { articlesApi, bonsSortieApi } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

export default function BonsSortieList() {
  const { user } = useAuth();
  const [bonsSortie, setBonsSortie] = useState<BonSortie[]>([]);
  const [lignesSortie, setLignesSortie] = useState<LigneSortie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showArticlesModal, setShowArticlesModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingBon, setEditingBon] = useState<BonSortie | null>(null);
  const [selectedBon, setSelectedBon] = useState<BonSortie | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BonSortie | null>(null);
  const [articlesList, setArticlesList] = useState<any[]>([]);

  const bonsSortieWithUsers = bonsSortie.map(bon => ({
    ...bon,
    utilisateur: users.find(u => u.id_utilisateur === bon.utilisateur_id),
    lignes: lignesSortie.filter(l => l.id_bon_sortie === bon.id_bon_sortie)
  }));

  const visibleBons = (user?.role === 'admin')
    ? bonsSortieWithUsers
    : bonsSortieWithUsers.filter(b => b.utilisateur_id === Number(user?.id));

  const filteredBons = visibleBons.filter(bon =>
    bon.numero_bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.destinataire.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await bonsSortieApi.list();
        const items = (res.data?.items || []) as any[];
        const mapped: BonSortie[] = items.map((b) => ({
          id_bon_sortie: b.id,
          numero_bon: b.numero_bon,
          date_sortie: b.date_sortie,
          district: b.district,
          commune: b.commune,
          destinataire: b.destinataire,
          utilisateur_id: b.utilisateur_id || 0,
        }));
        setBonsSortie(mapped);

        // Load lignes for each bon
        const allLignes: LigneSortie[] = [];
        for (const bon of mapped) {
          try {
            const resLignes = await bonsSortieApi.get(bon.id_bon_sortie);
            const lignes = (resLignes.data?.lignes || []) as any[];
            const mappedLignes: LigneSortie[] = lignes.map((l) => ({
              id_ligne_sortie: l.id,
              id_bon_sortie: l.bon_sortie_id,
              id_article: l.article_id,
              quantite: Number(l.quantite),
              prix_unitaire: Number(l.prix_unitaire),
              montant: Number(l.montant ?? Number(l.quantite) * Number(l.prix_unitaire)),
            }));
            allLignes.push(...mappedLignes);
          } catch (e) {
            // ignore per-bon error
          }
        }
        setLignesSortie(allLignes);

        // Load articles for selection
        const resArt = await articlesApi.list();
        const itemsArt = (resArt.data?.items || []) as any[];
        const mappedArt = itemsArt.map((a: any) => ({
          id_article: a.id,
          code_article: a.code_article,
          designation: a.designation,
          unite: a.unite_mesure,
          prix_unitaire: Number(a.prix_unitaire || 0),
          stock_minimum: Number(a.stock_minimum || 0),
          stock_actuel: Number(a.stock_actuel || 0),
        }));
        setArticlesList(mappedArt);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEdit = (bon: BonSortie) => {
    setEditingBon(bon);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingBon(null);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    const target = bonsSortie.find(b => b.id_bon_sortie === id) || null;
    setDeleteTarget(target);
    setConfirmDeleteOpen(true);
  };

  const handleAddArticles = async (bon: BonSortie) => {
    setSelectedBon(bon);
    try {
      const res = await bonsSortieApi.get(bon.id_bon_sortie);
      const lignes = (res.data?.lignes || []) as any[];
      const mapped: LigneSortie[] = lignes.map((l) => ({
        id_ligne_sortie: l.id,
        id_bon_sortie: l.bon_sortie_id,
        id_article: l.article_id,
        quantite: Number(l.quantite),
        prix_unitaire: Number(l.prix_unitaire),
        montant: Number(l.montant ?? Number(l.quantite) * Number(l.prix_unitaire)),
      }));
      const others = lignesSortie.filter(l => l.id_bon_sortie !== bon.id_bon_sortie);
      setLignesSortie([...others, ...mapped]);
    } catch {}
    setShowArticlesModal(true);
  };

  const handleViewDetails = async (bon: BonSortie) => {
    setSelectedBon(bon);
    try {
      const res = await bonsSortieApi.get(bon.id_bon_sortie);
      const lignes = (res.data?.lignes || []) as any[];
      const mapped: LigneSortie[] = lignes.map((l) => ({
        id_ligne_sortie: l.id,
        id_bon_sortie: l.bon_sortie_id,
        id_article: l.article_id,
        quantite: Number(l.quantite),
        prix_unitaire: Number(l.prix_unitaire),
        montant: Number(l.montant ?? Number(l.quantite) * Number(l.prix_unitaire)),
      }));
      const others = lignesSortie.filter(l => l.id_bon_sortie !== bon.id_bon_sortie);
      setLignesSortie([...others, ...mapped]);
    } catch {}
    setShowDetailModal(true);
  };

  const handleSaveBon = async (formData: any) => {
    if (editingBon) {
      const payload = {
        numero_bon: editingBon.numero_bon,
        date_sortie: formData.date_sortie,
        district: formData.district,
        commune: formData.commune,
        destinataire: formData.destinataire,
      };
      const res = await bonsSortieApi.update(editingBon.id_bon_sortie, payload);
      const item = res.data?.item;
      setBonsSortie(bonsSortie.map(b => b.id_bon_sortie === editingBon.id_bon_sortie ? {
        ...b,
        date_sortie: item.date_sortie,
        district: item.district,
        commune: item.commune,
        destinataire: item.destinataire,
      } : b));
    } else {
      const payload = {
        date_sortie: formData.date_sortie,
        district: formData.district,
        commune: formData.commune,
        destinataire: formData.destinataire,
      };
      const res = await bonsSortieApi.create(payload);
      const item = res.data?.item;
      if (item) {
        setBonsSortie([...bonsSortie, {
          id_bon_sortie: item.id,
          numero_bon: item.numero_bon,
          date_sortie: item.date_sortie,
          district: item.district,
          commune: item.commune,
          destinataire: item.destinataire,
          utilisateur_id: item.utilisateur_id || 0,
        }]);
      }
    }
    setShowModal(false);
    setEditingBon(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bons de Sortie</h2>
          <p className="text-slate-600">Gérez vos sorties de marchandises</p>
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
          placeholder="Rechercher un bon de sortie..."
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
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Sorties</p>
              <p className="text-2xl font-bold text-slate-900">{visibleBons.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Ce Mois</p>
              <p className="text-2xl font-bold text-slate-900">
                {visibleBons.filter(b => new Date(b.date_sortie).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Destinataires</p>
              <p className="text-2xl font-bold text-slate-900">
                {new Set(visibleBons.map(b => b.destinataire)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Districts</p>
              <p className="text-2xl font-bold text-slate-900">
                {new Set(visibleBons.map(b => b.district)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bons Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && (
          <div className="p-3 text-sm text-slate-600">Chargement des bons de sortie...</div>
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
                  Destinataire
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
                  <tr key={bon.id_bon_sortie} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Truck className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {bon.numero_bon}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {new Date(bon.date_sortie).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {bon.destinataire}
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
                        {nbArticles > 0 ? 'Livré' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(bon)}
                          className="text-green-600 hover:text-green-900"
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
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(bon.id_bon_sortie)}
                          className="text-red-600 hover:text-red-900"
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
        <BonSortieModal
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
        <ArticlesSortieModal
          bon={selectedBon}
          lignes={lignesSortie.filter(l => l.id_bon_sortie === selectedBon.id_bon_sortie)}
          articlesOptions={articlesList}
          onSave={async (newLignes) => {
            try {
              const payload = newLignes.map(l => ({ article_id: l.id_article, quantite: l.quantite, prix_unitaire: l.prix_unitaire }));
              await bonsSortieApi.saveLignes(selectedBon.id_bon_sortie, payload as any);
              const res = await bonsSortieApi.get(selectedBon.id_bon_sortie);
              const lignes = (res.data?.lignes || []) as any[];
              const mapped: LigneSortie[] = lignes.map((l) => ({
                id_ligne_sortie: l.id,
                id_bon_sortie: l.bon_sortie_id,
                id_article: l.article_id,
                quantite: Number(l.quantite),
                prix_unitaire: Number(l.prix_unitaire),
                montant: Number(l.montant ?? Number(l.quantite) * Number(l.prix_unitaire)),
              }));
              const otherLignes = lignesSortie.filter(l => l.id_bon_sortie !== selectedBon.id_bon_sortie);
              setLignesSortie([...otherLignes, ...mapped]);
              // refresh list basics
              const resList = await bonsSortieApi.list();
              const items = (resList.data?.items || []) as any[];
              const mappedBons: BonSortie[] = items.map((b) => ({
                id_bon_sortie: b.id,
                numero_bon: b.numero_bon,
                date_sortie: b.date_sortie,
                district: b.district,
                commune: b.commune,
                destinataire: b.destinataire,
                utilisateur_id: b.utilisateur_id || 0,
              }));
              setBonsSortie(mappedBons);
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
        <BonSortieDetailModal
          bon={selectedBon}
          lignes={lignesSortie.filter(l => l.id_bon_sortie === selectedBon.id_bon_sortie)}
          articlesOptions={articlesList}
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
          setBonsSortie(bonsSortie.filter(b => b.id_bon_sortie !== deleteTarget.id_bon_sortie));
          setLignesSortie(lignesSortie.filter(l => l.id_bon_sortie !== deleteTarget.id_bon_sortie));
        }}
        title="Confirmer la suppression"
        itemType="bon de sortie"
        itemName={deleteTarget?.numero_bon}
        isDangerous
      />
    </div>
  );
}

// Modal pour créer/modifier un bon de sortie
function BonSortieModal({ 
  bon, 
  onSave, 
  onClose 
}: { 
  bon: BonSortie | null; 
  onSave: (data: any) => void; 
  onClose: () => void; 
}) {
  const normalizeDate = (value: string | undefined) => {
    if (!value) return new Date().toISOString().split('T')[0];
    try {
      const onlyDate = value.includes('T') ? new Date(value).toISOString().split('T')[0] : value;
      return onlyDate;
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const [formData, setFormData] = useState({
    date_sortie: normalizeDate(bon?.date_sortie),
    district: bon?.district || '',
    commune: bon?.commune || '',
    destinataire: bon?.destinataire || ''
  });

  useEffect(() => {
    setFormData({
      date_sortie: normalizeDate(bon?.date_sortie),
      district: bon?.district || '',
      commune: bon?.commune || '',
      destinataire: bon?.destinataire || ''
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
          {bon ? 'Modifier le bon de sortie' : 'Nouveau bon de sortie'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date de sortie *
              </label>
              <input
                type="date"
                required
                value={formData.date_sortie}
                onChange={(e) => setFormData({...formData, date_sortie: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Destinataire *
              </label>
              <input
                type="text"
                required
                value={formData.destinataire}
                onChange={(e) => setFormData({...formData, destinataire: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom du destinataire"
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

          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">🚚 Étapes suivantes</h4>
            <ol className="text-sm text-orange-800 space-y-1">
              <li>1. ✅ Créer le bon de sortie</li>
              <li>2. 📦 Ajouter les articles à sortir (bouton "Gérer articles")</li>
              <li>3. ✅ Valider pour mettre à jour le stock</li>
              <li>4. 👥 Créer les fiches de distribution</li>
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

// Modal pour gérer les articles de sortie
function ArticlesSortieModal({ 
  bon, 
  lignes,
  articlesOptions,
  onSave, 
  onClose 
}: { 
  bon: BonSortie; 
  lignes: LigneSortie[];
  articlesOptions: any[];
  onSave: (lignes: LigneSortie[]) => void; 
  onClose: () => void; 
}) {
  const [articleLignes, setArticleLignes] = useState<LigneSortie[]>(lignes);
  const [newLigne, setNewLigne] = useState({
    id_article: '',
    quantite: '',
    prix_unitaire: ''
  });
  const [stockError, setStockError] = useState<string>('');

  const recomputeStockError = (candidateId: string, candidateQty: string) => {
    const selected = (articlesOptions as any[]).find((a: any) => a.id_article === parseInt(candidateId || '0'));
    const qty = parseInt(candidateQty || '0');
    if (!selected || !candidateId || !candidateQty) {
      setStockError('');
      return;
    }
    if (qty > (selected?.stock_actuel || 0)) {
      setStockError(`Stock insuffisant. Disponible: ${selected?.stock_actuel || 0} ${selected?.unite || ''}`);
    } else {
      setStockError('');
    }
  };

  const handleAddLigne = () => {
    if (!newLigne.id_article || !newLigne.quantite || !newLigne.prix_unitaire) {
      setStockError("Veuillez remplir tous les champs");
      return;
    }

    const article = (articlesOptions as any[]).find((a: any) => a.id_article === parseInt(newLigne.id_article));
    if (!article) return;

    const quantite = parseInt(newLigne.quantite);
    const prixUnitaire = parseFloat(newLigne.prix_unitaire);
    const montant = quantite * prixUnitaire;

    // Vérifier le stock disponible
    if (quantite > (article.stock_actuel || 0)) {
      setStockError(`Stock insuffisant. Disponible: ${article.stock_actuel || 0} ${article.unite}`);
      return;
    }

    const nouvelleLigne: LigneSortie = {
      id_ligne_sortie: Math.max(...articleLignes.map(l => l.id_ligne_sortie), 0) + 1,
      id_bon_sortie: bon.id_bon_sortie,
      id_article: parseInt(newLigne.id_article),
      quantite,
      prix_unitaire: prixUnitaire,
      montant
    };

    setArticleLignes([...articleLignes, nouvelleLigne]);
    setNewLigne({ id_article: '', quantite: '', prix_unitaire: '' });
    setStockError('');
  };

  const handleRemoveLigne = (id: number) => {
    setArticleLignes(articleLignes.filter(l => l.id_ligne_sortie !== id));
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
            🚚 Gérer les Articles - {bon.numero_bon}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Ajouter un nouvel article */}
        <div className="bg-orange-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-orange-900 mb-3">➖ Ajouter un article à sortir</h4>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Article</label>
              <select
                value={newLigne.id_article}
                onChange={(e) => {
                  const articleId = e.target.value;
                  const article = (articlesOptions as any[]).find((a: any) => a.id_article === parseInt(articleId));
                  setNewLigne({
                    ...newLigne, 
                    id_article: articleId,
                    prix_unitaire: article ? article.prix_unitaire.toString() : ''
                  });
                  recomputeStockError(articleId, newLigne.quantite);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner...</option>
                {(articlesOptions as any[]).filter((a: any) => (a.stock_actuel || 0) > 0).map((article: any) => (
                  <option key={article.id_article} value={article.id_article}>
                    {article.designation} (Stock: {article.stock_actuel})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantité</label>
              <input
                type="number"
                value={newLigne.quantite}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewLigne({...newLigne, quantite: value});
                  recomputeStockError(newLigne.id_article, value);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                max={newLigne.id_article ? (articlesOptions as any[]).find((a: any) => a.id_article === parseInt(newLigne.id_article))?.stock_actuel : undefined}
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
                disabled={!!stockError}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg"
              >
                Ajouter
              </button>
            </div>
          </div>
          {stockError && (
            <div className="mt-3 p-3 rounded-lg border bg-red-50 border-red-200 text-red-700 text-sm">
              {stockError}
            </div>
          )}
        </div>

        {/* Liste des articles */}
        <div className="mb-6">
          <h4 className="font-medium text-slate-900 mb-3">📋 Articles du bon de sortie</h4>
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
                  {articleLignes.map((ligne) => {
                    const article: any = (articlesOptions as any[]).find((a: any) => a.id_article === ligne.id_article);
                    return (
                      <tr key={ligne.id_ligne_sortie}>
                        <td className="px-4 py-2">
                          <div>
                            <div className="font-medium text-slate-900">{article?.designation}</div>
                            <div className="text-sm text-slate-500">{article?.code_article}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-slate-900">
                          {ligne.quantite} {article?.unite}
                        </td>
                        <td className="px-4 py-2 text-slate-900">
                          {ligne.prix_unitaire.toLocaleString()} Ar
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-900">
                          {ligne.montant.toLocaleString()} Ar
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleRemoveLigne(ligne.id_ligne_sortie)}
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
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
          >
            💾 Enregistrer les Articles
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal pour les détails du bon de sortie
function BonSortieDetailModal({ 
  bon, 
  lignes,
  articlesOptions,
  onClose 
}: { 
  bon: BonSortie; 
  lignes: LigneSortie[];
  articlesOptions: any[];
  onClose: () => void; 
}) {
  const lignesWithArticles = lignes.map((l) => ({
    ...l,
    article: (articlesOptions as any[]).find((a: any) => a.id_article === l.id_article)
  }));
  const totalMontant = lignes.reduce((sum, ligne) => sum + ligne.montant, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Détails du Bon de Sortie - {bon.numero_bon}
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
              <label className="text-sm font-medium text-slate-600">Date de sortie</label>
              <p className="text-slate-900">{new Date(bon.date_sortie).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Destinataire</label>
              <p className="text-slate-900">{bon.destinataire}</p>
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
                  onClick={() => printBonSortie(bon, lignesWithArticles)}
                  className="inline-flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  <Download size={16} className="mr-2" />
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-slate-900 mb-3">Articles Sortis</h4>
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
                    <tr key={ligne.id_ligne_sortie}>
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

function printBonSortie(bon: any, lignes: any[]) {
  const total = lignes.reduce((s, l) => s + Number(l.montant || 0), 0);
  const rows = lignes.map(l=>`<tr>
    <td>${l.article?.designation||''}</td>
    <td>${l.article?.code_article||''}</td>
    <td>${l.quantite||''} ${l.article?.unite||''}</td>
    <td>${Number(l.prix_unitaire||0).toLocaleString()} Ar</td>
    <td>${Number(l.montant||0).toLocaleString()} Ar</td>
  </tr>`).join('');
  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Bon de Sortie ${bon.numero_bon}</title>
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
            <h1>Bon de Sortie</h1>
            <div class="muted">${bon.numero_bon}</div>
          </div>
        </div>
        <div>
          <div>Date: ${new Date(bon.date_sortie).toLocaleDateString('fr-FR')}</div>
          <div>Destinataire: ${bon.destinataire}</div>
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
          ${rows}
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