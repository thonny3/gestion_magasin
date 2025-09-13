import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface AlertCardProps {
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  count?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const AlertCard: React.FC<AlertCardProps> = ({ type, title, message, count, action }) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case 'info':
        return <Info size={20} className="text-blue-600" />;
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          hover: 'hover:bg-yellow-100'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          hover: 'hover:bg-blue-100'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          hover: 'hover:bg-green-100'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          hover: 'hover:bg-red-100'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          hover: 'hover:bg-blue-100'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`${styles.bg} ${styles.border} rounded-xl p-4 border transition-colors duration-200 ${styles.hover}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-semibold ${styles.text}`}>{title}</h4>
            {count && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-800">
                {count}
              </span>
            )}
          </div>
          <p className={`mt-1 text-sm ${styles.text} opacity-90`}>{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-sm font-medium ${styles.text} hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type}-50 focus:ring-${type}-600`}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;


