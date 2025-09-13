export interface User {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  role: 'admin' | 'magasinier' | 'rdp' | 'president';
}

export interface Article {
  id_article: number;
  code_article: string;
  designation: string;
  unite: string;
  prix_unitaire: number;
  stock_minimum: number;
  stock_actuel?: number;
  // Optional fields used by filters/UI
  description?: string;
  categorie?: string;
  fournisseur?: string;
  marque?: string;
  emplacement?: string;
  statut?: 'actif' | 'inactif' | 'discontinue';
}

export interface BonReception {
  id_bon_reception: number;
  numero_bon: string;
  date_reception: string;
  district: string;
  commune: string;
  fournisseur: string;
  utilisateur_id: number;
  utilisateur?: User;
  lignes?: LigneReception[];
}

export interface LigneReception {
  id_ligne_reception: number;
  id_bon_reception: number;
  id_article: number;
  article?: Article;
  quantite: number;
  prix_unitaire: number;
  montant: number;
}

export interface BonSortie {
  id_bon_sortie: number;
  numero_bon: string;
  date_sortie: string;
  district: string;
  commune: string;
  destinataire: string;
  utilisateur_id: number;
  utilisateur?: User;
  lignes?: LigneSortie[];
}

export interface LigneSortie {
  id_ligne_sortie: number;
  id_bon_sortie: number;
  id_article: number;
  article?: Article;
  quantite: number;
  prix_unitaire: number;
  montant: number;
}

export interface Distribution {
  id_distribution: number;
  id_bon_sortie: number;
  beneficiaire: string;
  fonction: string;
  lieu: string;
  cin: string;
  article_recu: string;
  quantite: number;
  date_reception: string;
}

export interface FicheStock {
  id_fiche_stock: number;
  id_article: number;
  article?: Article;
  date_mouvement: string;
  type_mouvement: 'entrée' | 'sortie';
  quantite: number;
  reste: number;
  demandeur: string;
  observation: string;
}

export interface PVReception {
  id_pv: number;
  id_bon_reception: number;
  date: string;
  adresse: string;
  fournisseur: string;
  livreur: string;
  details_articles: string;
}

export interface EtatPaiement {
  id_paiement: number;
  mois: string;
  nom_prenom: string;
  fonction: string;
  montant: number;
  cin: string;
  date_paiement: string;
}

export interface OrdreMission {
  id_om: number;
  numero_om: string;
  nom_personne: string;
  fonction: string;
  moto_no: string;
  districts_visites: string;
  date_depart: string;
  km_depart: number;
  date_arrivee: string;
  km_arrivee: number;
}

export interface PVReception {
  id_pv: number;
  numero_pv: string;
  id_bon_reception?: number;
  numero_bon?: string;
  date_reception?: string;
  district?: string;
  commune?: string;
  date_pv: string;
  adresse: string;
  fournisseur: string;
  livreur?: string;
  telephone_livreur?: string;
  details_articles?: string;
  observations?: string;
  statut: 'draft' | 'finalise';
  createur?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  permissions: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  role_id?: number;
  role_name?: string;
  role_display_name?: string;
  role_permissions?: string[];
  is_active: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  active_last_30_days: number;
  by_role: Array<{
    role_name: string;
    role_display_name: string;
    user_count: number;
  }>;
}