import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`bg-white rounded-[40px] shadow-2xl w-full ${maxWidth} overflow-hidden relative z-10 flex flex-col max-h-[95vh]`}
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all text-gray-400 active:scale-90"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
