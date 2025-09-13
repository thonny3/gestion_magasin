export interface RouteItem {
  id: string;
  path: string;
  label: string;
  icon: any;
  element: React.ComponentType;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  ARTICLES: '/articles',
  RECEPTION: '/reception',
  SORTIE: '/sortie',
 
  STOCK: '/stock',


  PV: '/pv',
  SETTINGS: '/settings',
  USERS: '/users',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];
