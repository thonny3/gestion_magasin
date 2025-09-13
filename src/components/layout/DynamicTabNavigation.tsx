import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getRouteTabs } from '../../config/advancedRoutes';

interface DynamicTabNavigationProps {
  className?: string;
}

export default function DynamicTabNavigation({ className }: DynamicTabNavigationProps) {
  const location = useLocation();
  const tabs = getRouteTabs(location.pathname);
  
  // Si pas d'onglets pour cette route, ne rien afficher
  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <div className={`border-b border-slate-200 dark:border-slate-700 mb-6 ${className || ''}`}>
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
