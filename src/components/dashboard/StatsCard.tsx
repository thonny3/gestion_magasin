import React from 'react';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  isLoading?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-500',
    hover: 'hover:bg-green-600',
    light: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200'
  },
  yellow: {
    bg: 'bg-yellow-500',
    hover: 'hover:bg-yellow-600',
    light: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  red: {
    bg: 'bg-red-500',
    hover: 'hover:bg-red-600',
    light: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200'
  },
};

export default function StatsCard({ title, value, icon: Icon, color, trend, description, isLoading = false }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
      {/* Effet de gradient en arrière-plan */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            {isLoading ? (
              <div className="flex items-center space-x-2 mb-1">
                <RefreshCw size={20} className="animate-spin text-gray-400" />
                <span className="text-3xl font-bold text-gray-400">...</span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            )}
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
            {trend && !isLoading && (
              <div className={`flex items-center mt-2 text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? (
                  <TrendingUp size={16} className="mr-1" />
                ) : (
                  <TrendingDown size={16} className="mr-1" />
                )}
                <span>{Math.abs(trend.value)}%</span>
                <span className="ml-1">vs mois dernier</span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-xl ${colors.bg} ${colors.hover} transition-colors duration-300 group-hover:scale-110 ${isLoading ? 'opacity-50' : ''}`}>
            {isLoading ? (
              <RefreshCw className="w-7 h-7 text-white animate-spin" />
            ) : (
              <Icon className="w-7 h-7 text-white" />
            )}
          </div>
        </div>
        
        {/* Barre de progression pour les tendances */}
        {trend && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  trend.isPositive ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(Math.abs(trend.value), 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
    </div>
  );
}