import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 md:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const getIcon = () => {
            switch (toast.type) {
              case 'success':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
              case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
              case 'danger':
                return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
              default:
                return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
            }
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="clay-card-flat p-4 flex items-start gap-3 pointer-events-auto shadow-xl border border-white/50"
            >
              <div className="mt-0.5">{getIcon()}</div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800">{toast.title}</h4>
                {toast.description && (
                  <p className="text-xs text-slate-600 mt-0.5">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
