import { User, Article, BonReception, BonSortie, Distribution, FicheStock, EtatPaiement, OrdreMission } from '../types';

export const users: User[] = [
  { id_utilisateur: 1, nom: 'Rakoto', prenom: 'Jean', fonction: 'Responsable', email: 'jean.rakoto@gov.mg', role: 'admin' },
  { id_utilisateur: 2, nom: 'Rabe', prenom: 'Marie', fonction: 'Magasinier', email: 'marie.rabe@gov.mg', role: 'magasinier' },
  { id_utilisateur: 3, nom: 'Andry', prenom: 'Paul', fonction: 'RDP', email: 'paul.andry@gov.mg', role: 'rdp' },
];

export const articles: Article[] = [
  { id_article: 1, code_article: 'RIZ001', designation: 'Riz blanc 25kg', unite: 'sac', prix_unitaire: 45000, stock_minimum: 10, stock_actuel: 150 },
  { id_article: 2, code_article: 'HUI001', designation: 'Huile végétale 5L', unite: 'bidon', prix_unitaire: 25000, stock_minimum: 20, stock_actuel: 80 },
  { id_article: 3, code_article: 'SUC001', designation: 'Sucre blanc 1kg', unite: 'paquet', prix_unitaire: 3500, stock_minimum: 50, stock_actuel: 200 },
  { id_article: 4, code_article: 'SEL001', designation: 'Sel fin 1kg', unite: 'paquet', prix_unitaire: 1500, stock_minimum: 30, stock_actuel: 120 },
];

export const bonsReception: BonReception[] = [
  {
    id_bon_reception: 1,
    numero_bon: 'BR-2024-001',
    date_reception: '2024-01-15',
    district: 'Antananarivo',
    commune: 'Ambohijanahary',
    fournisseur: 'Coopérative Agricole',
    utilisateur_id: 2,
  },
  {
    id_bon_reception: 2,
    numero_bon: 'BR-2024-002',
    date_reception: '2024-01-20',
    district: 'Fianarantsoa',
    commune: 'Alakamisy',
    fournisseur: 'ONG Humanitaire',
    utilisateur_id: 2,
  },
];

export const bonsSortie: BonSortie[] = [
  {
    id_bon_sortie: 1,
    numero_bon: 'BS-2024-001',
    date_sortie: '2024-01-18',
    district: 'Antananarivo',
    commune: 'Ambohijanahary',
    destinataire: 'Centre Social',
    utilisateur_id: 1,
  },
];

export const lignesReception: LigneReception[] = [
  {
    id_ligne_reception: 1,
    id_bon_reception: 1,
    id_article: 1, // Riz blanc 25kg
    quantite: 100,
    prix_unitaire: 45000,
    montant: 4500000
  },
  {
    id_ligne_reception: 2,
    id_bon_reception: 1,
    id_article: 2, // Huile végétale 5L
    quantite: 50,
    prix_unitaire: 25000,
    montant: 1250000
  },
  {
    id_ligne_reception: 3,
    id_bon_reception: 2,
    id_article: 3, // Sucre blanc 1kg
    quantite: 200,
    prix_unitaire: 3500,
    montant: 700000
  },
  {
    id_ligne_reception: 4,
    id_bon_reception: 2,
    id_article: 4, // Sel fin 1kg
    quantite: 120,
    prix_unitaire: 1500,
    montant: 180000
  }
];

export const lignesSortie: LigneSortie[] = [
  {
    id_ligne_sortie: 1,
    id_bon_sortie: 1,
    id_article: 1, // Riz blanc 25kg
    quantite: 50,
    prix_unitaire: 45000,
    montant: 2250000
  },
  {
    id_ligne_sortie: 2,
    id_bon_sortie: 1,
    id_article: 2, // Huile végétale 5L
    quantite: 20,
    prix_unitaire: 25000,
    montant: 500000
  }
];

export const distributions: Distribution[] = [
  {
    id_distribution: 1,
    id_bon_sortie: 1,
    beneficiaire: 'RASOAMANANA Marie',
    fonction: 'Chef de famille',
    lieu: 'Fokontany Ambohitrakely',
    cin: '101 234 567 890',
    article_recu: 'Riz blanc 25kg',
    quantite: 2,
    date_reception: '2024-01-18',
  },
];

export const fichesStock: FicheStock[] = [
  // Les mouvements de stock seront créés automatiquement
  // quand vous validez des bons de réception ou de sortie
];

export const etatsPaiement: EtatPaiement[] = [
  {
    id_paiement: 1,
    mois: 'Janvier 2024',
    nom_prenom: 'RAKOTO Jean',
    fonction: 'Responsable',
    montant: 850000,
    cin: '101 234 567 890',
    date_paiement: '2024-01-31',
  },
];

export const ordresMission: OrdreMission[] = [
  {
    id_om: 1,
    numero_om: 'OM-2024-001',
    nom_personne: 'ANDRY Paul',
    fonction: 'RDP',
    moto_no: 'M-001',
    districts_visites: 'Antananarivo, Antsirabe',
    date_depart: '2024-01-20',
    km_depart: 15420,
    date_arrivee: '2024-01-22',
    km_arrivee: 15650,
  },
  {
    id_om: 2,
    numero_om: 'OM-2024-002',
    nom_personne: 'RAKOTO Marie',
    fonction: 'Magasinier',
    moto_no: 'M-002',
    districts_visites: 'Fianarantsoa, Manakara',
    date_depart: '2024-01-25',
    km_depart: 12500,
    date_arrivee: '2024-01-27',
    km_arrivee: 12850,
  },
];