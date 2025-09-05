import React, { useMemo, useState } from 'react';
import { AlertTriangle, Search, Filter, Download, DollarSign, Calendar } from 'lucide-react';

interface ImpayeItem {
  id: string;
  numero: string;
  client: string;
  dateEcheance: string;
  montantRestant: number;
  joursRetard: number;
  categorie: string;
}

const mockImpayes: ImpayeItem[] = [
  { id: 'i1', numero: 'FACT-2024-103', client: 'Commerce DEF', dateEcheance: '2024-12-15', montantRestant: 800000, joursRetard: 12, categorie: 'Services' },
  { id: 'i2', numero: 'FACT-2024-104', client: 'Boutique GHI', dateEcheance: '2025-01-10', montantRestant: 1200000, joursRetard: 5, categorie: 'Produits' },
];

export default function ImpayesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('all');

  const filtered = useMemo(() => {
    return mockImpayes.filter(i => {
      const matchesSearch = i.numero.toLowerCase().includes(searchTerm.toLowerCase()) || i.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategorie = filterCategorie === 'all' || i.categorie === filterCategorie;
      return matchesSearch && matchesCategorie;
    }).sort((a, b) => b.joursRetard - a.joursRetard);
  }, [searchTerm, filterCategorie]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Impayés</h1>
        <button className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm">
          <Download className="w-4 h-4 mr-2"/>Exporter
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center border rounded-lg px-3 py-2 w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 mr-2"/>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher (numéro, client)" className="w-full outline-none text-sm"/>
        </div>
        <div className="flex items-center border rounded-lg px-3 py-2 text-sm">
          <Filter className="w-4 h-4 text-gray-400 mr-2"/>
          <select value={filterCategorie} onChange={e => setFilterCategorie(e.target.value)} className="outline-none">
            <option value="all">Toutes catégories</option>
            <option value="Services">Services</option>
            <option value="Produits">Produits</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(i => (
          <div key={i.id} className="p-4 bg-white rounded-xl shadow border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{i.numero}</div>
                  <div className="text-sm text-gray-600">{i.client}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end text-red-700 text-sm">
                  <Calendar className="w-4 h-4 mr-1"/>Échéance: {new Date(i.dateEcheance).toLocaleDateString('fr-FR')}
                </div>
                <div className="font-bold text-red-700">{i.montantRestant.toLocaleString('fr-FR')} FCFA</div>
                <div className="text-xs text-red-600">Retard: {i.joursRetard} jours</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white rounded-xl border shadow flex items-center justify-between">
        <div className="text-sm text-gray-500">Total Impayés</div>
        <div className="font-semibold flex items-center text-red-700">
          <DollarSign className="w-4 h-4 mr-1"/>
          {filtered.reduce((s, i) => s + i.montantRestant, 0).toLocaleString('fr-FR')}
        </div>
      </div>
    </div>
  );
}


