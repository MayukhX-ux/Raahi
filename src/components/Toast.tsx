import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, CheckCircle } from 'lucide-react';

interface ToastProps {
  isOpen: boolean;
  message: string;
  journeyTitle: string;
  onClose: () => void;
}

export default function Toast({ isOpen, message, journeyTitle, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full glass-modal border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
          id="status-completed-toast"
        >
          <div className="w-full bg-white/5 h-1">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" 
            />
          </div>

          <div className="p-4 flex items-start gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 border border-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">Journey Completed!</span>
              <h5 className="font-bold text-sm text-white mt-0.5 truncate leading-snug">{journeyTitle}</h5>
              <p className="text-xs text-[#9fa3a7] mt-1 leading-relaxed">{message}</p>
            </div>

            <button
              onClick={onClose}
              className="p-1 hover:bg-white/5 text-[#9fa3a7] hover:text-white rounded-lg transition-colors cursor-pointer focus:outline-none"
              title="Dismiss"
              id="close-toast-btn"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
