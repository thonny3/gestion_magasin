import React, { useMemo } from 'react';
import { AlertTriangle, Package, ArrowDownRight } from 'lucide-react';
import { articles as mockArticles } from '../../data/mockData';

export default function StockAlerts() {
  const alerts = useMemo(() => {
    return mockArticles
      .map(a => ({
        id: a.id_article,
        code: a.code_article,
        designation: a.designation,
        stockActuel: a.stock_actuel || 0,
        stockMinimum: a.stock_minimum,
      }))
      .filter(a => a.stockActuel <= a.stockMinimum)
      .sort((a, b) => a.stockActuel - b.stockActuel);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Alertes de Stock</h1>
        <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-3">
            <Package size={22} />
          </div>
          <p className="text-lg font-semibold text-gray-900">Aucune alerte</p>
          <p className="text-gray-600">Tous les articles sont au-dessus du seuil minimum.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {alerts.map(a => (
            <div key={a.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow border border-red-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{a.designation}</p>
                  <p className="text-sm text-gray-600">{a.code}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2 text-red-600">
                  <ArrowDownRight size={18} />
                  <span className="text-sm">Min {a.stockMinimum}</span>
                </div>
                <p className="text-xl font-bold text-red-700">{a.stockActuel}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


