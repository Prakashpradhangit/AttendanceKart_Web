import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, HelpCircle } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [dialog, setDialog] = useState(null); // { message, title, type, onConfirm, onCancel }

  // Custom alert mimicking window.alert
  const showAlert = useCallback((message, title = 'Notification', type = 'info') => {
    return new Promise((resolve) => {
      setDialog({
        type,
        title,
        message,
        isConfirm: false,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        }
      });
    });
  }, []);

  // Custom confirm mimicking window.confirm
  const showConfirm = useCallback((message, title = 'Please Confirm') => {
    return new Promise((resolve) => {
      setDialog({
        type: 'confirm',
        title,
        message,
        isConfirm: true,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        }
      });
    });
  }, []);

  // Custom toast notification
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now().toString();
    setAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 4000);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={24} />;
      case 'error': return <AlertCircle className="text-rose-500" size={24} />;
      case 'confirm': return <HelpCircle className="text-indigo-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-100';
      case 'error': return 'bg-rose-50 border-rose-100';
      case 'confirm': return 'bg-indigo-50 border-indigo-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showToast }}>
      {children}

      {/* Global Dialog Modal */}
      <AnimatePresence>
        {dialog && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={dialog.isConfirm ? dialog.onCancel : dialog.onConfirm}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full z-10 border border-gray-100 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-50 ${
                dialog.type === 'error' ? 'bg-rose-500/20' : 
                dialog.type === 'confirm' ? 'bg-indigo-500/20' : 'bg-blue-500/20'
              }`} />
              
              <div className="flex flex-col items-center text-center gap-4 relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm ${getBg(dialog.type)}`}>
                  {getIcon(dialog.type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{dialog.title}</h3>
                  <p className="text-slate-500 text-sm mt-2 font-medium leading-relaxed">{dialog.message}</p>
                </div>

                <div className="flex w-full gap-3 mt-4">
                  {dialog.isConfirm && (
                    <button
                      onClick={dialog.onCancel}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={dialog.onConfirm}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                      dialog.type === 'error' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' :
                      dialog.type === 'confirm' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' :
                      'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                    }`}
                  >
                    {dialog.isConfirm ? 'Confirm' : 'Okay'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto flex items-center gap-3 px-5 py-4 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 min-w-[300px]"
            >
              {getIcon(alert.type)}
              <p className="font-semibold text-sm text-slate-700">{alert.message}</p>
              <button 
                onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                className="ml-auto text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  );
};
