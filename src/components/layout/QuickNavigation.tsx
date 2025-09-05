import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  FileText, 
  Users, 
  TrendingUp, 
  Truck, 
  FileCheck, 
  DollarSign, 
  MapPin,
  ArrowRight
} from 'lucide-react';
import { menuConfig } from '../../config/routes';

const quickNavItems = [
  { id: 'articles', icon: Package, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500', hoverColor: 'hover:from-blue-600 hover:to-blue-700' },
  { id: 'reception', icon: FileText, color: 'from-green-500 to-green-600', bgColor: 'bg-green-500', hoverColor: 'hover:from-green-600 hover:to-green-700' },
  { id: 'sortie', icon: Truck, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500', hoverColor: 'hover:from-orange-600 hover:to-orange-700' },
  { id: 'stock', icon: TrendingUp, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500', hoverColor: 'hover:from-purple-600 hover:to-purple-700' },
  { id: 'distribution', icon: Users, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500', hoverColor: 'hover:from-indigo-600 hover:to-indigo-700' },
  { id: 'paiement', icon: DollarSign, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-500', hoverColor: 'hover:from-emerald-600 hover:to-emerald-700' },
  { id: 'mission', icon: MapPin, color: 'from-rose-500 to-rose-600', bgColor: 'bg-rose-500', hoverColor: 'hover:from-rose-600 hover:to-rose-700' },
  { id: 'pv', icon: FileCheck, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-500', hoverColor: 'hover:from-cyan-600 hover:to-cyan-700' },
];

export default function QuickNavigation() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {quickNavItems.map((item, index) => {
        const menuItem = menuConfig.find(m => m.id === item.id);
        if (!menuItem) return null;
        
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            to={menuItem.path}
            className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Effet de gradient en arrière-plan */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Icône avec animation */}
                <div className={`relative w-16 h-16 ${item.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                  
                  {/* Effet de pulsation */}
                  <div className={`absolute inset-0 ${item.bgColor} rounded-2xl opacity-0 group-hover:opacity-30 group-hover:scale-125 transition-all duration-300`}></div>
                </div>
                
                {/* Contenu */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-300 text-sm">
                    {menuItem.label}
                  </h3>
                  
                  {/* Indicateur d'accès */}
                  <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs text-gray-500">Accéder</span>
                    <ArrowRight size={12} className="text-gray-500 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bordure colorée au hover */}
            <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-${item.bgColor.split('-')[1]}-200 transition-colors duration-300`}></div>
          </Link>
        );
      })}
    </div>
  );
}
