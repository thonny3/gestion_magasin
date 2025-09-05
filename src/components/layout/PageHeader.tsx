import React from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMeta } from '../../config/advancedRoutes';

export default function PageHeader() {
  const location = useLocation();
  const meta = getRouteMeta(location.pathname);

  if (!meta) {
    return null;
  }

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
        {meta.title}
      </h1>
      {meta.description && (
        <p className="text-lg text-slate-600 dark:text-slate-400">
          {meta.description}
        </p>
      )}
    </div>
  );
}
