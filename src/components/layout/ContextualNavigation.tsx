import React from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Download, Filter, Search, RefreshCw } from 'lucide-react';
import { getRouteMeta } from '../../config/advancedRoutes';

interface ContextualNavigationProps {
  className?: string;
}

export default function ContextualNavigation({ className }: ContextualNavigationProps) {
  const location = useLocation();
  const meta = getRouteMeta(location.pathname);

  if (!meta) {
    return null;
  }

  // Actions contextuelles basées sur la route
  const getContextualActions = () => {
    switch (location.pathname) {
      case '/articles':
        return [
          { label: 'Ajouter Article', icon: Plus, action: 'add', variant: 'primary' },
          { label: 'Importer', icon: Download, action: 'import', variant: 'secondary' },
          { label: 'Filtrer', icon: Filter, action: 'filter', variant: 'secondary' },
        ];
      case '/reception':
        return [
          { label: 'Nouveau Bon', icon: Plus, action: 'add', variant: 'primary' },
          { label: 'Rechercher', icon: Search, action: 'search', variant: 'secondary' },
          { label: 'Actualiser', icon: RefreshCw, action: 'refresh', variant: 'secondary' },
        ];
      case '/sortie':
        return [
          { label: 'Nouveau Bon', icon: Plus, action: 'add', variant: 'primary' },
          { label: 'Valider', icon: Filter, action: 'validate', variant: 'secondary' },
          { label: 'Actualiser', icon: RefreshCw, action: 'refresh', variant: 'secondary' },
        ];
      case '/stock':
        return [
          { label: 'Nouveau Mouvement', icon: Plus, action: 'add', variant: 'primary' },
          { label: 'Inventaire', icon: Filter, action: 'inventory', variant: 'secondary' },
          { label: 'Rapport', icon: Download, action: 'report', variant: 'secondary' },
        ];
      default:
        return [
          { label: 'Nouveau', icon: Plus, action: 'add', variant: 'primary' },
          { label: 'Rechercher', icon: Search, action: 'search', variant: 'secondary' },
        ];
    }
  };

  const actions = getContextualActions();

  return (
    <div className={`flex items-center justify-between mb-6 ${className || ''}`}>
      <div className="flex items-center space-x-4">
        {actions.map((action) => (
          <button
            key={action.action}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              action.variant === 'primary'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200'
            }`}
            onClick={() => console.log(`Action: ${action.action}`)}
          >
            <action.icon size={16} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
}
