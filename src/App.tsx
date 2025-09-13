import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import ArticlesList from './components/articles/ArticlesList';
import BonsReceptionList from './components/reception/BonsReceptionList';
import MouvementsStock from './components/stock/MouvementsStock';
import BonsSortieList from './components/sortie/BonsSortieList';

import PVReceptionList from './components/pv/PVReceptionList';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false); // Mode clair par défaut

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'articles':
        return <ArticlesList />;
      case 'reception':
        return <BonsReceptionList />;
      case 'stock':
        return <MouvementsStock />;
      case 'sortie':
        return <BonsSortieList />;
      case 'pv':
        return <PVReceptionList />;
      case 'settings':
        return <div className="p-6"><h2 className="text-2xl font-bold">Paramètres</h2><p className="text-slate-600">Module en cours de développement...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          
          <main className="flex-1 overflow-y-auto bg-white">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;