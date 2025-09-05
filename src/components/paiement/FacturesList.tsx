import React, { useMemo, useState } from 'react';
import { FileText, Search, Filter, Download, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

interface FactureItem {
  id: string;
  numero: string;
  client: string;
  dateEmission: string;
  dateEcheance: string;
  montant: number;
  montantPaye: number;
  montantRestant: number;
  statut: 'payee' | 'partielle' | 'impayee' | 'en_retard';
  categorie: string;
}

const initialFactures: FactureItem[] = [
  { id: '1', numero: 'FACT-2024-101', client: 'Entreprise ABC', dateEmission: '2024-12-01', dateEcheance: '2024-12-31', montant: 1500000, montantPaye: 1500000, montantRestant: 0, statut: 'payee', categorie: 'Services' },
  { id: '2', numero: 'FACT-2024-102', client: 'Société XYZ', dateEmission: '2024-12-05', dateEcheance: '2025-01-05', montant: 2500000, montantPaye: 1000000, montantRestant: 1500000, statut: 'partielle', categorie: 'Produits' },
  { id: '3', numero: 'FACT-2024-103', client: 'Commerce DEF', dateEmission: '2024-11-15', dateEcheance: '2024-12-15', montant: 800000, montantPaye: 0, montantRestant: 800000, statut: 'en_retard', categorie: 'Services' },
];

export default function FacturesList() {
  const [factures, setFactures] = useState<FactureItem[]>(initialFactures);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'payee' | 'partielle' | 'impayee' | 'en_retard'>('all');
  const [filterCategorie, setFilterCategorie] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<FactureItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<FactureItem | null>(null);
  const [formData, setFormData] = useState<{
    numero: string;
    client: string;
    dateEmission: string;
    dateEcheance: string;
    montant: number | string;
    montantPaye: number | string;
    categorie: string;
    statut: FactureItem['statut'];
  }>({ numero: '', client: '', dateEmission: '', dateEcheance: '', montant: '', montantPaye: '', categorie: 'Produits', statut: 'impayee' });

  const filtered = useMemo(() => {
    return factures.filter(f => {
      const matchesSearch = f.numero.toLowerCase().includes(searchTerm.toLowerCase()) || f.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatut = filterStatut === 'all' || f.statut === filterStatut;
      const matchesCategorie = filterCategorie === 'all' || f.categorie === filterCategorie;
      return matchesSearch && matchesStatut && matchesCategorie;
    });
  }, [factures, searchTerm, filterStatut, filterCategorie]);

  const getBadge = (statut: FactureItem['statut']) => {
    const common = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    if (statut === 'payee') return <span className={`${common} bg-green-100 text-green-800`}><CheckCircle className="w-3 h-3 mr-1"/>Payée</span>;
    if (statut === 'partielle') return <span className={`${common} bg-blue-100 text-blue-800`}><Clock className="w-3 h-3 mr-1"/>Partielle</span>;
    if (statut === 'impayee') return <span className={`${common} bg-gray-100 text-gray-800`}><Clock className="w-3 h-3 mr-1"/>Impayée</span>;
    return <span className={`${common} bg-red-100 text-red-800`}><AlertTriangle className="w-3 h-3 mr-1"/>En retard</span>;
  };

  const openNew = () => {
    setEditing(null);
    setFormData({ numero: '', client: '', dateEmission: '', dateEcheance: '', montant: '', montantPaye: '', categorie: 'Produits', statut: 'impayee' });
    setIsFormOpen(true);
  };

  const openEdit = (item: FactureItem) => {
    setEditing(item);
    setFormData({
      numero: item.numero,
      client: item.client,
      dateEmission: item.dateEmission,
      dateEcheance: item.dateEcheance,
      montant: item.montant,
      montantPaye: item.montantPaye,
      categorie: item.categorie,
      statut: item.statut,
    });
    setIsFormOpen(true);
  };

  const saveFacture = () => {
    if (!formData.numero.trim() || !formData.client.trim() || !formData.dateEmission || !formData.dateEcheance) return;
    const montant = Number(formData.montant) || 0;
    const montantPaye = Number(formData.montantPaye) || 0;
    const montantRestant = Math.max(0, montant - montantPaye);
    if (editing) {
      setFactures(prev => prev.map(f => f.id === editing.id ? {
        ...f,
        numero: formData.numero,
        client: formData.client,
        dateEmission: formData.dateEmission,
        dateEcheance: formData.dateEcheance,
        montant,
        montantPaye,
        montantRestant,
        categorie: formData.categorie,
        statut: formData.statut,
      } : f));
    } else {
      const newItem: FactureItem = {
        id: `${Date.now()}`,
        numero: formData.numero,
        client: formData.client,
        dateEmission: formData.dateEmission,
        dateEcheance: formData.dateEcheance,
        montant,
        montantPaye,
        montantRestant,
        categorie: formData.categorie,
        statut: formData.statut,
      };
      setFactures(prev => [newItem, ...prev]);
    }
    setIsFormOpen(false);
  };

  const askDelete = (item: FactureItem) => {
    setToDelete(item);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setFactures(prev => prev.filter(f => f.id !== toDelete.id));
    setConfirmOpen(false);
    setToDelete(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
        <div className="flex items-center gap-2">
          <button onClick={openNew} className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">
            <Plus className="w-4 h-4 mr-2"/>Nouvelle facture
          </button>
          <button className="inline-flex items-center px-3 py-2 bg-slate-100 text-slate-800 rounded-lg text-sm">
            <Download className="w-4 h-4 mr-2"/>Exporter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center border rounded-lg px-3 py-2 w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 mr-2"/>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher (numéro, client)" className="w-full outline-none text-sm"/>
        </div>
        <div className="flex items-center border rounded-lg px-3 py-2 text-sm">
          <Filter className="w-4 h-4 text-gray-400 mr-2"/>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value as any)} className="outline-none">
            <option value="all">Tous les statuts</option>
            <option value="payee">Payée</option>
            <option value="partielle">Partielle</option>
            <option value="impayee">Impayée</option>
            <option value="en_retard">En retard</option>
          </select>
        </div>
        <div className="flex items-center border rounded-lg px-3 py-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400 mr-2"/>
          <select value={filterCategorie} onChange={e => setFilterCategorie(e.target.value)} className="outline-none">
            <option value="all">Toutes catégories</option>
            <option value="Services">Services</option>
            <option value="Produits">Produits</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payé</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3"/>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map(f => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{f.numero}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{f.client}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">{f.montant.toLocaleString('fr-FR')} FCFA</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{f.montantPaye.toLocaleString('fr-FR')} FCFA</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{f.montantRestant.toLocaleString('fr-FR')} FCFA</td>
                <td className="px-6 py-4 whitespace-nowrap">{getBadge(f.statut)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button onClick={() => openEdit(f)} className="inline-flex items-center px-2 py-1 mr-2 border rounded-lg"><Edit className="w-4 h-4 mr-1"/>Éditer</button>
                  <button onClick={() => askDelete(f)} className="inline-flex items-center px-2 py-1 border rounded-lg text-red-600 border-red-200"><Trash2 className="w-4 h-4 mr-1"/>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border shadow flex items-center justify-between">
          <div className="text-sm text-gray-500">Montant Total</div>
          <div className="font-semibold flex items-center text-gray-900"><DollarSign className="w-4 h-4 mr-1"/>{filtered.reduce((s, f) => s + f.montant, 0).toLocaleString('fr-FR')}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow flex items-center justify-between">
          <div className="text-sm text-gray-500">Total Payé</div>
          <div className="font-semibold flex items-center text-green-700"><DollarSign className="w-4 h-4 mr-1"/>{filtered.reduce((s, f) => s + f.montantPaye, 0).toLocaleString('fr-FR')}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow flex items-center justify-between">
          <div className="text-sm text-gray-500">Total Restant</div>
          <div className="font-semibold flex items-center text-red-700"><DollarSign className="w-4 h-4 mr-1"/>{filtered.reduce((s, f) => s + f.montantRestant, 0).toLocaleString('fr-FR')}</div>
        </div>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editing ? 'Modifier la facture' : 'Nouvelle facture'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Numéro *</label>
              <input value={formData.numero} onChange={e => setFormData({ ...formData, numero: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="FACT-2025-001"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
              <input value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Client"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date d'émission *</label>
              <input type="date" value={formData.dateEmission} onChange={e => setFormData({ ...formData, dateEmission: e.target.value })} className="w-full px-3 py-2 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date d'échéance *</label>
              <input type="date" value={formData.dateEcheance} onChange={e => setFormData({ ...formData, dateEcheance: e.target.value })} className="w-full px-3 py-2 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Montant *</label>
              <input type="number" value={formData.montant} onChange={e => setFormData({ ...formData, montant: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="0"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Montant payé</label>
              <input type="number" value={formData.montantPaye} onChange={e => setFormData({ ...formData, montantPaye: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="0"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
              <select value={formData.categorie} onChange={e => setFormData({ ...formData, categorie: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="Services">Services</option>
                <option value="Produits">Produits</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select value={formData.statut} onChange={e => setFormData({ ...formData, statut: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg">
                <option value="payee">Payée</option>
                <option value="partielle">Partielle</option>
                <option value="impayee">Impayée</option>
                <option value="en_retard">En retard</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Annuler</button>
            <button onClick={saveFacture} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Enregistrer</button>
          </div>
        </div>
      </Modal>

      <ConfirmDeleteModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        itemName={toDelete?.numero}
        itemType="facture"
        isDangerous
      />
    </div>
  );
}


