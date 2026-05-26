import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

// Module-level state + subscribers (singleton pattern — no Context needed)
let state: ToastState = { toasts: [] };
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((fn) => fn());
}

function addToast(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  const duration = toast.duration ?? 4000;
  state = { toasts: [...state.toasts, { ...toast, id, duration }] };
  notify();

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
}

function removeToast(id: string) {
  state = { toasts: state.toasts.filter((t) => t.id !== id) };
  notify();
}

// Public imperative API — use this outside of React components
export const toast = {
  success: (message: string, title?: string) => addToast({ type: 'success', message, title }),
  error: (message: string, title?: string) => addToast({ type: 'error', message, title }),
  warning: (message: string, title?: string) => addToast({ type: 'warning', message, title }),
  info: (message: string, title?: string) => addToast({ type: 'info', message, title }),
  dismiss: (id: string) => removeToast(id),
};

// React hook — use this inside components
export function useToast() {
  const [, forceUpdate] = useState(0);

  useState(() => {
    const rerender = () => forceUpdate((n) => n + 1);
    subscribers.add(rerender);
    return () => subscribers.delete(rerender);
  });

  return {
    toasts: state.toasts,
    toast,
    dismiss: removeToast,
  };
}
