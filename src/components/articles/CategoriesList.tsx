import React, { useMemo, useState } from 'react';
import { Tags, Search, Filter, Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

interface CategorieItem {
  id: string;
  nom: string;
  code: string;
  description?: string;
  nbArticles: number;
}

const initialCategories: CategorieItem[] = [
  { id: 'c1', nom: 'Matériaux', code: 'MAT', description: 'Consommables et matériaux', nbArticles: 24 },
  { id: 'c2', nom: 'Équipements', code: 'EQU', description: 'Équipements et outillages', nbArticles: 12 },
  { id: 'c3', nom: 'Services', code: 'SRV', description: 'Prestations externes', nbArticles: 8 },
];

export default function CategoriesList() {
  const [categories, setCategories] = useState<CategorieItem[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategorieItem | null>(null);
  const [formData, setFormData] = useState<{ nom: string; code: string; description?: string }>({ nom: '', code: '', description: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CategorieItem | null>(null);

  const filtered = useMemo(() => {
    return categories.filter(c =>
      c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const openNew = () => {
    setEditing(null);
    setFormData({ nom: '', code: '', description: '' });
    setIsFormOpen(true);
  };

  const openEdit = (item: CategorieItem) => {
    setEditing(item);
    setFormData({ nom: item.nom, code: item.code, description: item.description });
    setIsFormOpen(true);
  };

  const saveCategory = () => {
    if (!formData.nom.trim() || !formData.code.trim()) return;
    if (editing) {
      setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, nom: formData.nom, code: formData.code, description: formData.description } : c));
    } else {
      const newItem: CategorieItem = {
        id: `c${Date.now()}`,
        nom: formData.nom,
        code: formData.code.toUpperCase(),
        description: formData.description,
        nbArticles: 0
      };
      setCategories(prev => [newItem, ...prev]);
    }
    setIsFormOpen(false);
  };

  const askDelete = (item: CategorieItem) => {
    setToDelete(item);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setCategories(prev => prev.filter(c => c.id !== toDelete.id));
    setConfirmOpen(false);
    setToDelete(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Catégories d’articles</h1>
        <button onClick={openNew} className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">
          <Plus className="w-4 h-4 mr-2"/>Nouvelle catégorie
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center border rounded-lg px-3 py-2 w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 mr-2"/>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher (nom, code)" className="w-full outline-none text-sm"/>
        </div>
        <div className="hidden md:flex items-center text-gray-500 text-sm">
          <Filter className="w-4 h-4 mr-2"/>Filtrer par: Tous
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articles</th>
              <th className="px-6 py-3"/>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                      <Tags className="w-4 h-4"/>
                    </div>
                    <div className="font-medium text-gray-900">{c.nom}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{c.code}</td>
                <td className="px-6 py-4 text-gray-700">{c.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{c.nbArticles}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button onClick={() => openEdit(c)} className="inline-flex items-center px-2 py-1 mr-2 border rounded-lg"><Edit className="w-4 h-4 mr-1"/>Éditer</button>
                  <button onClick={() => askDelete(c)} disabled={c.nbArticles > 0} className="inline-flex items-center px-2 py-1 border rounded-lg text-red-600 border-red-200 disabled:opacity-50"><Trash2 className="w-4 h-4 mr-1"/>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Équipements"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
            <input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: EQU"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Description"/>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Annuler</button>
            <button onClick={saveCategory} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Enregistrer</button>
          </div>
        </div>
      </Modal>

      <ConfirmDeleteModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        itemName={toDelete?.nom}
        itemType="catégorie"
        warningMessage={toDelete && toDelete.nbArticles > 0 ? 'Impossible de supprimer une catégorie contenant des articles.' : undefined}
        isDangerous
      />
    </div>
  );
}


