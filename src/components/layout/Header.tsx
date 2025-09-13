import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Moon, Sun, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../types/routes';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigateToSettings = () => {
    navigate(ROUTES.SETTINGS);
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm bg-white flex items-center justify-center">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800">
            Système de Gestion de Magasin
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>
          
          <button className="p-2 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors duration-200">
            <Bell size={20} />
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors duration-200"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Menu utilisateur */}
          <div className="relative ml-4 pl-4 border-l border-slate-200" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-emerald-700" />
              </div>
              <div className="text-sm text-left">
                <p className="font-medium text-slate-800">{user?.username}</p>
                <p className="text-slate-500 capitalize">{user?.role}</p>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-slate-400 transition-transform duration-200 ${
                  showUserMenu ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Menu déroulant */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{user?.username}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={handleNavigateToSettings}
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                  >
                    <Settings size={16} className="mr-3 text-slate-400" />
                    Paramètres
                  </button>
                </div>
                
                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut size={16} className="mr-3" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}