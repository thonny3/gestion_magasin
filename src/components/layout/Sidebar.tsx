import React from 'react';
import { 
  Package, 
  FileText, 
  Users, 
  TrendingUp, 
  Truck, 
  FileCheck, 
  DollarSign, 
  MapPin,
  Home,
  Settings
} from 'lucide-react';
import { menuConfig } from '../../config/routes';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

// Mapping des icônes pour chaque section
const iconMap = {
  dashboard: Home,
  articles: Package,
  reception: FileText,
  sortie: Truck,
  distribution: Users,
  stock: TrendingUp,
  paiement: DollarSign,
  mission: MapPin,
  pv: FileCheck,
  settings: Settings,
};

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  return (
    <div className="w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-white h-full flex flex-col border-r border-slate-200 dark:border-slate-700">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">StockManager Pro</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Gestion de Magasin</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuConfig.map((item) => {
            const Icon = iconMap[item.id as keyof typeof iconMap] || Home;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">JR</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Jean Rakoto</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Administrateur</p>
          </div>
        </div>
      </div>
    </div>
  );
}