export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  duration?: number; // duration in ms, default 4500
  id?: string;
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  createdAt: number;
}

type ToastListener = (toasts: ToastMessage[]) => void;

class ToastManager {
  private toasts: ToastMessage[] = [];
  private listeners: Set<ToastListener> = new Set();

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  public show(message: string, type: ToastType = 'info', options?: ToastOptions): string {
    const id = options?.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const duration = options?.duration !== undefined ? options.duration : 4500;

    // Prevent duplicate exact toasts within a short 1.5s window
    const existingIndex = this.toasts.findIndex(
      (t) => t.message === message && t.type === type && Date.now() - t.createdAt < 1500
    );
    if (existingIndex !== -1) {
      return this.toasts[existingIndex].id;
    }

    const newToast: ToastMessage = {
      id,
      type,
      title: options?.title,
      message,
      duration,
      createdAt: Date.now(),
    };

    // Keep max 5 visible toasts at once
    this.toasts = [newToast, ...this.toasts.slice(0, 4)];
    this.notify();

    return id;
  }

  public error(message: string, options?: ToastOptions): string {
    return this.show(message, 'error', {
      title: options?.title || 'Error',
      duration: options?.duration || 5000,
      ...options,
    });
  }

  public success(message: string, options?: ToastOptions): string {
    return this.show(message, 'success', {
      title: options?.title || 'Success',
      duration: options?.duration || 4000,
      ...options,
    });
  }

  public warning(message: string, options?: ToastOptions): string {
    return this.show(message, 'warning', {
      title: options?.title || 'Warning',
      duration: options?.duration || 4500,
      ...options,
    });
  }

  public info(message: string, options?: ToastOptions): string {
    return this.show(message, 'info', {
      title: options?.title || 'Information',
      duration: options?.duration || 4000,
      ...options,
    });
  }

  public dismiss(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  public clear(): void {
    this.toasts = [];
    this.notify();
  }
}

export const toast = new ToastManager();
