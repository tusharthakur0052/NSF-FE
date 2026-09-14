import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { toast, type ToastMessage } from '../../utils/toast';

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast: item, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (item.duration <= 0) return;

    const intervalTime = 25;
    const totalSteps = item.duration / intervalTime;
    const stepDecrement = 100 / totalSteps;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            onDismiss(item.id);
            return 0;
          }
          return Math.max(0, prev - stepDecrement);
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [item.id, item.duration, isPaused, onDismiss]);

  const config = {
    error: {
      bg: 'bg-white',
      border: 'border-red-200',
      badgeBg: 'bg-red-50 text-red-600',
      titleColor: 'text-red-950',
      bodyColor: 'text-red-700',
      barColor: 'bg-red-500',
      shadow: 'shadow-xl shadow-red-500/10',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-white',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-50 text-emerald-600',
      titleColor: 'text-emerald-950',
      bodyColor: 'text-emerald-700',
      barColor: 'bg-emerald-500',
      shadow: 'shadow-xl shadow-emerald-500/10',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-white',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-50 text-amber-600',
      titleColor: 'text-amber-950',
      bodyColor: 'text-amber-700',
      barColor: 'bg-amber-500',
      shadow: 'shadow-xl shadow-amber-500/10',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-white',
      border: 'border-sky-200',
      badgeBg: 'bg-sky-50 text-sky-600',
      titleColor: 'text-sky-950',
      bodyColor: 'text-sky-700',
      barColor: 'bg-sky-500',
      shadow: 'shadow-xl shadow-sky-500/10',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
    },
  }[item.type];

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl border ${config.border} ${config.bg} ${config.shadow} p-4 transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-4`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`p-1.5 rounded-xl ${config.badgeBg} flex items-center justify-center`}>
          {config.icon}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          {item.title && (
            <h4 className={`text-sm font-bold tracking-tight ${config.titleColor}`}>
              {item.title}
            </h4>
          )}
          <p className={`text-xs leading-relaxed mt-0.5 break-words font-medium ${config.bodyColor}`}>
            {item.message}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          className="shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Timer Progress Bar */}
      {item.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/80 overflow-hidden">
          <div
            className={`h-full transition-all ease-linear ${config.barColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[] }> = ({ toasts }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={(id) => toast.dismiss(id)} />
        </div>
      ))}
    </div>
  );
};
