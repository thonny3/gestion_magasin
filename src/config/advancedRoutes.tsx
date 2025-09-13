import React from 'react';
import { RouteObject } from 'react-router-dom';
import { ROUTES } from '../types/routes';

// Import des composants
import Dashboard from '../components/dashboard/Dashboard';
import ArticlesList from '../components/articles/ArticlesList';
import BonsReceptionList from '../components/reception/BonsReceptionList';
import MouvementsStock from '../components/stock/MouvementsStock';
import BonsSortieList from '../components/sortie/BonsSortieList';

import PVReceptionList from '../components/pv/PVReceptionList';

// Configuration des routes avec sous-routes
export const advancedRouteConfig: RouteObject[] = [
  {
    path: ROUTES.DASHBOARD,
    element: <Dashboard />,
    meta: {
      title: 'Tableau de Bord',
      description: 'Vue d\'ensemble de votre gestion de stock',
      icon: 'Home',
      breadcrumb: ['Tableau de Bord']
    }
  },
  {
    path: ROUTES.ARTICLES,
    element: <ArticlesList />,
    meta: {
      title: 'Gestion des Articles',
      description: 'Gérer le catalogue et les stocks des articles',
      icon: 'Package',
      breadcrumb: ['Tableau de Bord', 'Articles'],
      tabs: [
        { id: 'liste', label: 'Liste des Articles', path: '/articles' },
        { id: 'ajout', label: 'Ajouter un Article', path: '/articles/ajout' },
        { id: 'categories', label: 'Catégories', path: '/articles/categories' }
      ]
    }
  },
  {
    path: ROUTES.RECEPTION,
    element: <BonsReceptionList />,
    meta: {
      title: 'Bons de Réception',
      description: 'Gérer les entrées de stock',
      icon: 'FileText',
      breadcrumb: ['Tableau de Bord', 'Bons de Réception'],
      tabs: [
        { id: 'liste', label: 'Liste des Réceptions', path: '/reception' },
        { id: 'nouveau', label: 'Nouveau Bon', path: '/reception/nouveau' },
        { id: 'historique', label: 'Historique', path: '/reception/historique' }
      ]
    }
  },
  {
    path: ROUTES.SORTIE,
    element: <BonsSortieList />,
    meta: {
      title: 'Bons de Sortie',
      description: 'Gérer les sorties de stock',
      icon: 'Truck',
      breadcrumb: ['Tableau de Bord', 'Bons de Sortie'],
      tabs: [
        { id: 'liste', label: 'Liste des Sorties', path: '/sortie' },
        { id: 'nouveau', label: 'Nouveau Bon', path: '/sortie/nouveau' },
        { id: 'validation', label: 'Validation', path: '/sortie/validation' }
      ]
    }
  },

  {
    path: ROUTES.STOCK,
    element: <MouvementsStock />,
    meta: {
      title: 'Mouvements de Stock',
      description: 'Suivre tous les mouvements de stock',
      icon: 'TrendingUp',
      breadcrumb: ['Tableau de Bord', 'Mouvements de Stock'],
      tabs: [
        { id: 'mouvements', label: 'Mouvements', path: '/stock' },
        { id: 'inventaire', label: 'Inventaire', path: '/stock/inventaire' },
        { id: 'alertes', label: 'Alertes Stock', path: '/stock/alertes' }
      ]
    }
  },
  
  
  {
    path: ROUTES.PV,
    element: <PVReceptionList />,
    meta: {
      title: 'PV de Réception',
      description: 'Procès-verbaux de réception',
      icon: 'FileCheck',
      breadcrumb: ['Tableau de Bord', 'PV de Réception'],
      tabs: [
        { id: 'pv', label: 'PV de Réception', path: '/pv' },
        { id: 'templates', label: 'Modèles', path: '/pv/templates' },
        { id: 'archives', label: 'Archives', path: '/pv/archives' }
      ]
    }
  }
];

// Fonction utilitaire pour obtenir les métadonnées d'une route
export const getRouteMeta = (path: string) => {
  const route = advancedRouteConfig.find(r => r.path === path);
  return route?.meta || null;
};

// Fonction pour obtenir le titre de la page
export const getPageTitle = (path: string) => {
  const meta = getRouteMeta(path);
  return meta?.title || 'StockManager Pro';
};

// Fonction pour obtenir les onglets d'une route
export const getRouteTabs = (path: string) => {
  const meta = getRouteMeta(path);
  return meta?.tabs || [];
};
