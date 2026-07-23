import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/30 dark:border-emerald-500/30',
    error: 'border-rose-500/30 dark:border-rose-500/30',
    warning: 'border-amber-500/30 dark:border-amber-500/30',
    info: 'border-blue-500/30 dark:border-blue-500/30',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start justify-between p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl shadow-xl border ${borderColors[toast.type]} transition-all duration-200 animate-in slide-in-from-bottom-5`}
    >
      <div className="flex items-start space-x-3">
        {icons[toast.type]}
        <div>
          <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>
          {toast.message && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              {toast.message}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-3 p-1 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
