import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { menuConfig } from '../../config/routes';

export default function Breadcrumb() {
  const location = useLocation();
  
  const getBreadcrumbItems = () => {
    const path = location.pathname;
    if (path === '/') {
      return [{ label: 'Tableau de bord', path: '/' }];
    }
    
    const section = path.substring(1);
    const menuItem = menuConfig.find(item => item.id === section);
    
    if (menuItem) {
      return [
        { label: 'Tableau de bord', path: '/' },
        { label: menuItem.label, path: menuItem.path }
      ];
    }
    
    return [{ label: 'Page non trouvée', path: '/' }];
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <ChevronRight size={16} className="text-slate-400" />
          )}
          {index === 0 ? (
            <Link
              to={item.path}
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
            >
              <Home size={16} />
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
