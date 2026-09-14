import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast, type ToastMessage, type ToastOptions } from '../utils/toast';
import { ToastContainer } from '../components/ui/Toast';

interface ToastContextType {
  toasts: ToastMessage[];
  show: (message: string, type?: 'error' | 'success' | 'warning' | 'info', options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  success: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((updatedToasts) => {
      setToasts(updatedToasts);
    });
    return () => unsubscribe();
  }, []);

  const value: ToastContextType = {
    toasts,
    show: (msg, type, opt) => toast.show(msg, type, opt),
    error: (msg, opt) => toast.error(msg, opt),
    success: (msg, opt) => toast.success(msg, opt),
    warning: (msg, opt) => toast.warning(msg, opt),
    info: (msg, opt) => toast.info(msg, opt),
    dismiss: (id) => toast.dismiss(id),
    clear: () => toast.clear(),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    // If used outside provider, fallback to direct singleton methods
    return {
      toasts: [],
      show: (msg, type, opt) => toast.show(msg, type, opt),
      error: (msg, opt) => toast.error(msg, opt),
      success: (msg, opt) => toast.success(msg, opt),
      warning: (msg, opt) => toast.warning(msg, opt),
      info: (msg, opt) => toast.info(msg, opt),
      dismiss: (id) => toast.dismiss(id),
      clear: () => toast.clear(),
    };
  }
  return context;
};
