import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { Plus, Edit, Trash2, Tag, Search } from 'lucide-react';
import { categoriesApi } from '../../utils/api';

interface Category {
  id: number;
  nom: string;
  description: string;
  couleur: string;
  nombre_articles: number;
}

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categories: Category[]) => void;
}

export default function CategoriesModal({ isOpen, onClose, onSave }: CategoriesModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await categoriesApi.list();
        const items = (res.data?.items || []) as any[];
        setCategories(items.map((c) => ({
          id: c.id,
          nom: c.nom,
          description: c.description || '',
          couleur: c.couleur || '#3B82F6',
          nombre_articles: c.nbArticles ?? c.nombre_articles ?? 0,
        })));
      } catch (e) {
        // ignore
      }
    };
    if (isOpen) load();
  }, [ isOpen ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    couleur: '#3B82F6'
  });

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  const filteredCategories = categories.filter(cat =>
    cat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (formData.nom.trim()) {
      try {
        const payload = { nom: formData.nom, code: formData.nom.substring(0,3).toUpperCase(), description: formData.description, couleur: formData.couleur };
        const res = await categoriesApi.create(payload as any);
        const c = res.data?.item;
        if (c) {
          setCategories([...categories, { id: c.id, nom: c.nom, description: c.description || '', couleur: c.couleur || '#3B82F6', nombre_articles: 0 }]);
        }
        resetForm();
        setShowAddForm(false);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nom: category.nom,
      description: category.description,
      couleur: category.couleur
    });
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && formData.nom.trim()) {
      try {
        await categoriesApi.update(editingCategory.id, { nom: formData.nom, code: (editingCategory as any).code || formData.nom.substring(0,3).toUpperCase(), description: formData.description, couleur: formData.couleur });
        setCategories(categories.map(cat =>
          cat.id === editingCategory.id
            ? { ...cat, nom: formData.nom, description: formData.description, couleur: formData.couleur }
            : cat
        ));
        resetForm();
        setEditingCategory(null);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await categoriesApi.remove(categoryId);
      setCategories(categories.filter(cat => cat.id !== categoryId));
    } catch (e) {
      // ignore
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      couleur: '#3B82F6'
    });
  };

  const handleSave = () => {
    onSave(categories);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestion des Catégories" size="lg">
      <div className="space-y-6">
        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span>Nouvelle Catégorie</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingCategory) && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-lg font-medium text-slate-900 mb-4">
              {editingCategory ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Équipements"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Couleur
                </label>
                <div className="flex space-x-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, couleur: color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.couleur === color ? 'border-slate-800' : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description de la catégorie"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                  setEditingCategory(null);
                }}
                className="px-4 py-2 text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingCategory ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-3">
          {filteredCategories.length > 0 ? (
            filteredCategories.map(category => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.couleur }}
                  />
                  <div>
                    <h5 className="font-medium text-slate-900">{category.nom}</h5>
                    <p className="text-sm text-slate-600">{category.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {category.nombre_articles} article{category.nombre_articles !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={category.nombre_articles > 0}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Tag className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune catégorie trouvée</h3>
              <p className="text-slate-600">
                {searchTerm ? 'Aucune catégorie ne correspond à votre recherche.' : 'Ajoutez votre première catégorie.'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Enregistrer les Modifications
          </button>
        </div>
      </div>
    </Modal>
  );
}

