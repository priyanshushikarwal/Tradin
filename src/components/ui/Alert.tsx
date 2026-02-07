import React from 'react';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXCircle, HiX } from 'react-icons/hi';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const typeStyles = {
    success: {
      bg: 'bg-green-500/10 border-green-500/30',
      icon: HiCheckCircle,
      iconColor: 'text-green-400',
      titleColor: 'text-green-400',
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/30',
      icon: HiXCircle,
      iconColor: 'text-red-400',
      titleColor: 'text-red-400',
    },
    warning: {
      bg: 'bg-yellow-500/10 border-yellow-500/30',
      icon: HiExclamationCircle,
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-400',
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      icon: HiInformationCircle,
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-400',
    },
  };
  
  const { bg, icon: Icon, iconColor, titleColor } = typeStyles[type];
  
  return (
    <div
      className={`
        ${bg} border rounded-xl p-4
        flex items-start gap-3
        ${className}
      `}
    >
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-semibold ${titleColor} mb-1`}>{title}</h4>
        )}
        <div className="text-sm text-gray-300">{children}</div>
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <HiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
