import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { Package, DollarSign, Hash, Tag } from 'lucide-react';
import { categoriesApi } from '../../utils/api';

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: any) => void;
}

export default function AddArticleModal({ isOpen, onClose, onSave }: AddArticleModalProps) {
  const [formData, setFormData] = useState({
    code_article: '',
    designation: '',
    description: '',
    unite_mesure: 'pièce',
    categorie: '',
    prix_unitaire: '',
    stock_minimum: '',
    stock_actuel: '',
    fournisseur: '',
    marque: '',
    reference_fournisseur: '',
    emplacement: '',
    date_peremption: '',
    numero_lot: '',
    statut: 'actif'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<{ id: number; nom: string }[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesApi.list();
        const items = (res.data?.items || []) as any[];
        setCategories(items.map(i => ({ id: i.id, nom: i.nom })));
      } catch (e) {
        setCategories([]);
      }
    };
    if (isOpen) loadCategories();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code_article.trim()) {
      newErrors.code_article = 'Le code article est requis';
    }
    if (!formData.designation.trim()) {
      newErrors.designation = 'La désignation est requise';
    }
    if (!formData.categorie.trim()) {
      newErrors.categorie = 'La catégorie est requise';
    }
    if (!formData.prix_unitaire || parseFloat(formData.prix_unitaire) <= 0) {
      newErrors.prix_unitaire = 'Le prix unitaire doit être supérieur à 0';
    }
    if (!formData.stock_minimum || parseInt(formData.stock_minimum) < 0) {
      newErrors.stock_minimum = 'Le stock minimum doit être supérieur ou égal à 0';
    }
    if (!formData.stock_actuel || parseInt(formData.stock_actuel) < 0) {
      newErrors.stock_actuel = 'Le stock actuel doit être supérieur ou égal à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const newArticle = {
        ...formData,
        id_article: Date.now(), // Temporary ID
        prix_unitaire: parseFloat(formData.prix_unitaire),
        stock_minimum: parseInt(formData.stock_minimum),
        stock_actuel: parseInt(formData.stock_actuel),
        date_creation: new Date().toISOString(),
        derniere_modification: new Date().toISOString()
      };
      
      onSave(newArticle);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setFormData({
      code_article: '',
      designation: '',
      description: '',
      unite_mesure: 'pièce',
      categorie: '',
      prix_unitaire: '',
      stock_minimum: '',
      stock_actuel: '',
      fournisseur: '',
      marque: '',
      reference_fournisseur: '',
      emplacement: '',
      date_peremption: '',
      numero_lot: '',
      statut: 'actif'
    });
    setErrors({});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un Article" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
              <Hash size={16} />
              <span>Code Article *</span>
            </label>
            <input
              type="text"
              name="code_article"
              value={formData.code_article}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.code_article ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Ex: ART001"
            />
            {errors.code_article && (
              <p className="mt-1 text-sm text-red-600">{errors.code_article}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
              <Package size={16} />
              <span>Désignation *</span>
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.designation ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Nom de l'article"
            />
            {errors.designation && (
              <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Description détaillée de l'article"
          />
        </div>

        {/* Unité et Catégorie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Unité de Mesure
            </label>
            <select
              name="unite_mesure"
              value={formData.unite_mesure}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pièce">Pièce</option>
              <option value="kg">Kilogramme</option>
              <option value="litre">Litre</option>
              <option value="mètre">Mètre</option>
              <option value="boîte">Boîte</option>
              <option value="pack">Pack</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
              <Tag size={16} />
              <span>Catégorie *</span>
            </label>
            <select
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.categorie ? 'border-red-300' : 'border-slate-300'
              }`}
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(c => (
                <option key={c.id} value={c.nom}>{c.nom}</option>
              ))}
            </select>
            {errors.categorie && (
              <p className="mt-1 text-sm text-red-600">{errors.categorie}</p>
            )}
          </div>
        </div>

        {/* Prix et Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
              <DollarSign size={16} />
              <span>Prix Unitaire *</span>
            </label>
            <input
              type="number"
              name="prix_unitaire"
              value={formData.prix_unitaire}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.prix_unitaire ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="0.00"
            />
            {errors.prix_unitaire && (
              <p className="mt-1 text-sm text-red-600">{errors.prix_unitaire}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Stock Minimum *
            </label>
            <input
              type="number"
              name="stock_minimum"
              value={formData.stock_minimum}
              onChange={handleChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.stock_minimum ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="0"
            />
            {errors.stock_minimum && (
              <p className="mt-1 text-sm text-red-600">{errors.stock_minimum}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Stock Actuel *
            </label>
            <input
              type="number"
              name="stock_actuel"
              value={formData.stock_actuel}
              onChange={handleChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.stock_actuel ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="0"
            />
            {errors.stock_actuel && (
              <p className="mt-1 text-sm text-red-600">{errors.stock_actuel}</p>
            )}
          </div>
        </div>

        {/* Informations fournisseur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fournisseur
            </label>
            <input
              type="text"
              name="fournisseur"
              value={formData.fournisseur}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nom du fournisseur"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Marque
            </label>
            <input
              type="text"
              name="marque"
              value={formData.marque}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Marque du produit"
            />
          </div>
        </div>

        {/* Référence et Emplacement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Référence Fournisseur
            </label>
            <input
              type="text"
              name="reference_fournisseur"
              value={formData.reference_fournisseur}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Référence du fournisseur"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Emplacement
            </label>
            <input
              type="text"
              name="emplacement"
              value={formData.emplacement}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Étagère A-1"
            />
          </div>
        </div>

        {/* Informations additionnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date de Péremption
            </label>
            <input
              type="date"
              name="date_peremption"
              value={formData.date_peremption}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Numéro de Lot
            </label>
            <input
              type="text"
              name="numero_lot"
              value={formData.numero_lot}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Numéro de lot"
            />
          </div>
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Statut
          </label>
          <select
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="discontinue">Discontinué</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Ajouter l'Article
          </button>
        </div>
      </form>
    </Modal>
  );
}

