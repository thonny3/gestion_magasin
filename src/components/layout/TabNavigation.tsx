import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface Tab {
  id: string;
  label: string;
  path: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  basePath: string;
  className?: string;
}

export default function TabNavigation({ tabs, basePath, className }: TabNavigationProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={cn("border-b border-slate-200 dark:border-slate-700", className)}>
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                isActive
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
