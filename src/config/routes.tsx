import React from 'react';
import { RouteObject } from 'react-router-dom';
import { ROUTES } from '../types/routes';

// Import des composants
import Dashboard from '../components/dashboard/Dashboard';
import ArticlesList from '../components/articles/ArticlesList';
import CategoriesList from '../components/articles/CategoriesList';
import BonsReceptionList from '../components/reception/BonsReceptionList';
import MouvementsStock from '../components/stock/MouvementsStock';
import InventaireStock from '../components/stock/InventaireStock';
import StockAlerts from '../components/stock/StockAlerts';
import BonsSortieList from '../components/sortie/BonsSortieList';

import PVReceptionList from '../components/pv/PVReceptionList';
import ProfileSettings from '../components/settings/ProfileSettings';
import UsersManagement from '../components/users/UsersManagement';

// Configuration des routes
export const routeConfig: RouteObject[] = [
  {
    path: ROUTES.DASHBOARD,
    element: <Dashboard />,
  },
  {
    path: ROUTES.ARTICLES,
    element: <ArticlesList />,
  },
  {
    path: `${ROUTES.ARTICLES}/categories`,
    element: <CategoriesList />,
  },
  {
    path: ROUTES.RECEPTION,
    element: <BonsReceptionList />,
  },
  {
    path: ROUTES.SORTIE,
    element: <BonsSortieList />,
  },
  
  {
    path: ROUTES.STOCK,
    element: <MouvementsStock />,
  },
  {
    path: `${ROUTES.STOCK}/inventaire`,
    element: <InventaireStock />,
  },
  {
    path: `${ROUTES.STOCK}/alertes`,
    element: <StockAlerts />,
  },
 
  {
    path: ROUTES.PV,
    element: <PVReceptionList />,
  },
  {
    path: ROUTES.SETTINGS,
    element: <ProfileSettings />,
  },
  {
    path: ROUTES.USERS,
    element: <UsersManagement />,
  },
];

// Configuration des éléments de menu
export const menuConfig = [
  { id: 'dashboard', label: 'Tableau de bord', path: ROUTES.DASHBOARD },
  { id: 'articles', label: 'Articles', path: ROUTES.ARTICLES },
  { id: 'reception', label: 'Bons Réception', path: ROUTES.RECEPTION },
  { id: 'sortie', label: 'Bons Sortie', path: ROUTES.SORTIE },

  { id: 'stock', label: 'Mouvements Stock', path: ROUTES.STOCK },
  
  { id: 'pv', label: 'PV Réception', path: ROUTES.PV },
  { id: 'users', label: 'Gestion Utilisateurs', path: ROUTES.USERS },
  { id: 'settings', label: 'Paramètres', path: ROUTES.SETTINGS },
];
