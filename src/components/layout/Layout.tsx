import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import DynamicTabNavigation from './DynamicTabNavigation';
import PageHeader from './PageHeader';
import ContextualNavigation from './ContextualNavigation';

export default function Layout() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // S'assurer que l'application démarre en mode clair
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Déterminer la section active basée sur l'URL actuelle
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    return path.substring(1); // Enlever le '/' initial
  };

  const activeSection = getActiveSection();

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleSectionChange = (section: string) => {
    if (section === 'dashboard') {
      navigate('/');
    } else {
      navigate(`/${section}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        <Sidebar activeSection={activeSection} setActiveSection={handleSectionChange} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          
          <main className="flex-1 overflow-y-auto bg-white">
            <div className="p-6">
              <Breadcrumb />
              <PageHeader />
              <DynamicTabNavigation />
              <ContextualNavigation />
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
