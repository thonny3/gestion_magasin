import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import { 
  CreditCard, 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  BarChart3,
  Calendar,
  User,
  Building
} from 'lucide-react';

interface Facture {
  id: string;
  numero: string;
  client: string;
  dateEmission: string;
  dateEcheance: string;
  montant: number;
  montantPaye: number;
  montantRestant: number;
  statut: 'payee' | 'partielle' | 'impayee' | 'en_retard';
  modePaiement?: string;
  datePaiement?: string;
  observations?: string;
  categorie: string;
}

import { paiementsApi } from '../../utils/api';

export default function EtatsPaiementList() {
  const [factures, setFactures] = useState<Facture[]>([]);
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await paiementsApi.list();
        const items = (res.data?.items || []) as any[];
        const mapped: Facture[] = items.map((p: any) => ({
          id: String(p.id),
          numero: p.numero,
          client: p.client,
          dateEmission: p.date_emission,
          dateEcheance: p.date_echeance,
          montant: Number(p.montant || 0),
          montantPaye: Number(p.montant_paye || 0),
          montantRestant: Math.max(0, Number(p.montant || 0) - Number(p.montant_paye || 0)),
          statut: p.statut,
          modePaiement: p.mode_paiement || undefined,
          datePaiement: p.date_paiement || undefined,
          observations: p.observations || undefined,
          categorie: p.categorie || 'Services',
        }));
        setFactures(mapped);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'payee' | 'partielle' | 'impayee' | 'en_retard'>('all');
  const [filterCategorie, setFilterCategorie] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    numero: '',
    client: '',
    dateEmission: '',
    dateEcheance: '',
    montant: '',
    montantPaye: '',
    categorie: 'Services',
    statut: 'impayee' as Facture['statut'],
    modePaiement: ''
  });

  const filteredFactures = useMemo(() => {
    return factures.filter(facture => {
      const matchesSearch = 
        facture.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facture.client.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatut = filterStatut === 'all' || facture.statut === filterStatut;
      const matchesCategorie = filterCategorie === 'all' || facture.categorie === filterCategorie;
      
      return matchesSearch && matchesStatut && matchesCategorie;
    });
  }, [factures, searchTerm, filterStatut, filterCategorie]);

  const stats = useMemo(() => {
    const total = factures.length;
    const payee = factures.filter(f => f.statut === 'payee').length;
    const partielle = factures.filter(f => f.statut === 'partielle').length;
    const impayee = factures.filter(f => f.statut === 'impayee').length;
    const enRetard = factures.filter(f => f.statut === 'en_retard').length;
    
    const montantTotal = factures.reduce((sum, f) => sum + f.montant, 0);
    const montantPaye = factures.reduce((sum, f) => sum + f.montantPaye, 0);
    const montantRestant = factures.reduce((sum, f) => sum + f.montantRestant, 0);
    const montantEnRetard = factures
      .filter(f => f.statut === 'en_retard')
      .reduce((sum, f) => sum + f.montantRestant, 0);

    return {
      total,
      payee,
      partielle,
      impayee,
      enRetard,
      montantTotal,
      montantPaye,
      montantRestant,
      montantEnRetard
    };
  }, [factures]);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'payee': return 'text-green-600 bg-green-100';
      case 'partielle': return 'text-yellow-600 bg-yellow-100';
      case 'impayee': return 'text-gray-600 bg-gray-100';
      case 'en_retard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'payee': return <CheckCircle size={16} />;
      case 'partielle': return <Clock size={16} />;
      case 'impayee': return <AlertTriangle size={16} />;
      case 'en_retard': return <XCircle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const getJoursRetard = (dateEcheance: string) => {
    const echeance = new Date(dateEcheance);
    const aujourdhui = new Date();
    const diffTime = aujourdhui.getTime() - echeance.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    console.log('Export des factures...');
  };

  const handleCreate = async () => {
    if (!addForm.numero || !addForm.client || !addForm.dateEmission || !addForm.dateEcheance) return;
    const payload = {
      numero: addForm.numero,
      client: addForm.client,
      date_emission: addForm.dateEmission,
      date_echeance: addForm.dateEcheance,
      montant: Number(addForm.montant || 0),
      montant_paye: Number(addForm.montantPaye || 0),
      statut: addForm.statut,
      mode_paiement: addForm.modePaiement || null,
      categorie: addForm.categorie,
    };
    const res = await paiementsApi.create(payload);
    const p = res.data?.item;
    if (p) {
      const newItem: Facture = {
        id: String(p.id),
        numero: p.numero,
        client: p.client,
        dateEmission: p.date_emission,
        dateEcheance: p.date_echeance,
        montant: Number(p.montant || 0),
        montantPaye: Number(p.montant_paye || 0),
        montantRestant: Math.max(0, Number(p.montant || 0) - Number(p.montant_paye || 0)),
        statut: p.statut,
        modePaiement: p.mode_paiement || undefined,
        categorie: p.categorie || 'Services'
      };
      setFactures(prev => [newItem, ...prev]);
    }
    setIsAddOpen(false);
    setAddForm({ numero: '', client: '', dateEmission: '', dateEcheance: '', montant: '', montantPaye: '', categorie: 'Services', statut: 'impayee', modePaiement: '' });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
              <h1 className="text-3xl font-bold mb-2">États de Paiement</h1>
              <p className="text-purple-100 text-lg">Gestion des factures et suivi des paiements</p>
              <div className="flex items-center mt-4 space-x-4 text-purple-100">
                <div className="flex items-center space-x-2">
                  <FileText size={20} />
                  <span>{stats.total} factures au total</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign size={20} />
                  <span>{stats.montantRestant.toLocaleString()} Ar à recouvrer</span>
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
              <p className="text-sm font-medium text-gray-600 mb-1">Total Factures</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs text-gray-500">Toutes les factures</p>
            </div>
            <div className="p-4 bg-purple-500 rounded-xl">
              <FileText size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Montant Total</p>
              <p className="text-3xl font-bold text-green-600 mb-1">{stats.montantTotal.toLocaleString()} Ar</p>
              <p className="text-xs text-gray-500">Montant émis</p>
            </div>
            <div className="p-4 bg-green-500 rounded-xl">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Montant Payé</p>
              <p className="text-3xl font-bold text-blue-600 mb-1">{stats.montantPaye.toLocaleString()} Ar</p>
              <p className="text-xs text-gray-500">Paiements reçus</p>
            </div>
            <div className="p-4 bg-blue-500 rounded-xl">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">En Retard</p>
              <p className="text-3xl font-bold text-red-600 mb-1">{stats.montantEnRetard.toLocaleString()} Ar</p>
              <p className="text-xs text-gray-500">Montant en retard</p>
            </div>
            <div className="p-4 bg-red-500 rounded-xl">
              <AlertTriangle size={24} className="text-white" />
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
                placeholder="Rechercher une facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Tous les statuts</option>
                <option value="payee">Payées</option>
                <option value="partielle">Partielles</option>
                <option value="impayee">Impayées</option>
                <option value="en_retard">En retard</option>
              </select>

              <select
                value={filterCategorie}
                onChange={(e) => setFilterCategorie(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Toutes catégories</option>
                <option value="Services">Services</option>
                <option value="Produits">Produits</option>
              </select>
            </div>
          </div>

          <button onClick={() => setIsAddOpen(true)} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2">
            <Plus size={20} />
            <span>Nouvelle Facture</span>
          </button>
        </div>
      </div>

      {/* Tableau des factures */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Liste des Factures</h3>
          <p className="text-sm text-gray-600 mt-1">{filteredFactures.length} factures trouvées</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facture
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Échéance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFactures.map((facture) => (
                <tr key={facture.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{facture.numero}</div>
                      <div className="text-xs text-gray-500">{facture.categorie}</div>
                      <div className="text-xs text-gray-400">{new Date(facture.dateEmission).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{facture.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{facture.montant.toLocaleString()} Ar</div>
                      {facture.montantRestant > 0 && (
                        <div className="text-xs text-red-600">
                          Reste: {facture.montantRestant.toLocaleString()} Ar
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(facture.statut)}`}>
                      {getStatutIcon(facture.statut)}
                      <span className="ml-1">
                        {facture.statut === 'payee' ? 'Payée' : 
                         facture.statut === 'partielle' ? 'Partielle' : 
                         facture.statut === 'impayee' ? 'Impayée' : 'En retard'}
                      </span>
                    </span>
                    {facture.statut === 'en_retard' && (
                      <div className="text-xs text-red-600 mt-1">
                        +{getJoursRetard(facture.dateEcheance)} jours
                    </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}</div>
                    {facture.statut === 'en_retard' && (
                      <div className="text-xs text-red-600">
                        Retard de {getJoursRetard(facture.dateEcheance)} jours
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {facture.modePaiement ? (
                      <div>
                        <div className="font-medium">{facture.modePaiement}</div>
                        {facture.datePaiement && (
                          <div className="text-xs text-gray-500">
                            {new Date(facture.datePaiement).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Aucun paiement</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="Voir détails">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200" title="Modifier">
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
      {filteredFactures.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-gray-400 mb-4">
              <FileText size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📄 Aucune facture trouvée</h3>
            <p className="text-gray-600 mb-4">Modifiez vos critères de recherche ou créez une nouvelle facture</p>
            <button onClick={() => setIsAddOpen(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
              Nouvelle Facture
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nouvelle Facture" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Numéro *</label>
              <input value={addForm.numero} onChange={e => setAddForm({ ...addForm, numero: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="FACT-2025-001"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
              <input value={addForm.client} onChange={e => setAddForm({ ...addForm, client: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Client"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date d'émission *</label>
              <input type="date" value={addForm.dateEmission} onChange={e => setAddForm({ ...addForm, dateEmission: e.target.value })} className="w-full px-3 py-2 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date d'échéance *</label>
              <input type="date" value={addForm.dateEcheance} onChange={e => setAddForm({ ...addForm, dateEcheance: e.target.value })} className="w-full px-3 py-2 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Montant *</label>
              <input type="number" value={addForm.montant} onChange={e => setAddForm({ ...addForm, montant: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="0"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Montant payé</label>
              <input type="number" value={addForm.montantPaye} onChange={e => setAddForm({ ...addForm, montantPaye: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="0"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
              <select value={addForm.categorie} onChange={e => setAddForm({ ...addForm, categorie: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="Services">Services</option>
                <option value="Produits">Produits</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select value={addForm.statut} onChange={e => setAddForm({ ...addForm, statut: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg">
                <option value="payee">Payée</option>
                <option value="partielle">Partielle</option>
                <option value="impayee">Impayée</option>
                <option value="en_retard">En retard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mode de paiement</label>
              <input value={addForm.modePaiement} onChange={e => setAddForm({ ...addForm, modePaiement: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Espèces, Virement..."/>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Annuler</button>
            <button onClick={handleCreate} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Enregistrer</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}