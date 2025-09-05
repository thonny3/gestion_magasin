import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Filter, X, RotateCcw } from 'lucide-react';

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

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterCriteria) => void;
  currentFilters: FilterCriteria;
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

export default function FilterModal({ isOpen, onClose, onApply, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterCriteria>(currentFilters);

  const categories = [
    'Équipements',
    'Fournitures',
    'Mobilier',
    'Outils',
    'Consommables',
    'Accessoires'
  ];

  const statuts = [
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' },
    { value: 'discontinue', label: 'Discontinué' }
  ];

  const fournisseurs = [
    'Dell',
    'HP',
    'Canon',
    'Epson',
    'Logitech',
    'Microsoft',
    'Apple',
    'Samsung'
  ];

  const emplacements = [
    'Étagère A-1',
    'Étagère A-2',
    'Étagère B-1',
    'Étagère B-2',
    'Entrepôt Zone 1',
    'Entrepôt Zone 2',
    'Bureau Principal',
    'Réserve'
  ];

  const handleChange = (field: keyof FilterCriteria, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (typeof value === 'boolean') return value;
      return value !== '';
    }).length;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtrage Avancé" size="lg">
      <div className="space-y-6">
        {/* Active Filters Count */}
        {getActiveFiltersCount() > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {getActiveFiltersCount()} filtre{getActiveFiltersCount() > 1 ? 's' : ''} actif{getActiveFiltersCount() > 1 ? 's' : ''}
              </span>
              <button
                onClick={handleReset}
                className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <RotateCcw size={14} />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>
        )}

        {/* Category and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Catégorie
            </label>
            <select
              value={filters.categorie}
              onChange={(e) => handleChange('categorie', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Statut
            </label>
            <select
              value={filters.statut}
              onChange={(e) => handleChange('statut', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              {statuts.map(statut => (
                <option key={statut.value} value={statut.value}>{statut.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fourchette de Prix (€)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                placeholder="Prix min"
                value={filters.priceMin}
                onChange={(e) => handleChange('priceMin', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Prix max"
                value={filters.priceMax}
                onChange={(e) => handleChange('priceMax', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Stock Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Niveau de Stock
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <input
                type="number"
                placeholder="Stock min"
                value={filters.stockMin}
                onChange={(e) => handleChange('stockMin', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Stock max"
                value={filters.stockMax}
                onChange={(e) => handleChange('stockMax', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>
          
          {/* Stock Faible Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="stockFaible"
              checked={filters.stockFaible}
              onChange={(e) => handleChange('stockFaible', e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="stockFaible" className="text-sm text-slate-700">
              Uniquement les articles en stock faible
            </label>
          </div>
        </div>

        {/* Supplier and Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fournisseur
            </label>
            <select
              value={filters.fournisseur}
              onChange={(e) => handleChange('fournisseur', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les fournisseurs</option>
              {fournisseurs.map(fournisseur => (
                <option key={fournisseur} value={fournisseur}>{fournisseur}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Marque
            </label>
            <input
              type="text"
              placeholder="Filtrer par marque"
              value={filters.marque}
              onChange={(e) => handleChange('marque', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Emplacement
          </label>
          <select
            value={filters.emplacement}
            onChange={(e) => handleChange('emplacement', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les emplacements</option>
            {emplacements.map(emplacement => (
              <option key={emplacement} value={emplacement}>{emplacement}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date de Création
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="date"
                value={filters.dateCreationFrom}
                onChange={(e) => handleChange('dateCreationFrom', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="date"
                value={filters.dateCreationTo}
                onChange={(e) => handleChange('dateCreationTo', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Preview */}
        {getActiveFiltersCount() > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-900 mb-2">Filtres appliqués:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (typeof value === 'boolean' && !value) return null;
                if (typeof value === 'string' && value === '') return null;
                
                const label = key === 'categorie' ? `Catégorie: ${value}` :
                             key === 'priceMin' ? `Prix ≥ ${value}€` :
                             key === 'priceMax' ? `Prix ≤ ${value}€` :
                             key === 'stockMin' ? `Stock ≥ ${value}` :
                             key === 'stockMax' ? `Stock ≤ ${value}` :
                             key === 'statut' ? `Statut: ${value}` :
                             key === 'fournisseur' ? `Fournisseur: ${value}` :
                             key === 'marque' ? `Marque: ${value}` :
                             key === 'stockFaible' ? 'Stock faible' :
                             key === 'emplacement' ? `Emplacement: ${value}` :
                             key === 'dateCreationFrom' ? `Depuis: ${value}` :
                             key === 'dateCreationTo' ? `Jusqu'au: ${value}` : '';

                return (
                  <span
                    key={key}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    <span>{label}</span>
                    <button
                      onClick={() => handleChange(key as keyof FilterCriteria, typeof value === 'boolean' ? false : '')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleApply}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Filter size={16} />
            <span>Appliquer les Filtres</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

