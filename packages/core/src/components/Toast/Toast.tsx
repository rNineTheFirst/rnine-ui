import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, Info, OctagonAlert, TriangleAlert, X } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './Toast.module.scss';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
  id?: string;
  message: string;
  variant?: ToastVariant;
  /** Milliseconds before it goes away; 0 keeps it until dismissed. Default 5000 (errors: 8000). */
  duration?: number;
};

type Toast = Required<Omit<ToastOptions, 'duration'>> & { duration: number };

export type ToastContextValue = {
  toasts: Toast[];
  addToast: (options: Omit<ToastOptions, 'id'>) => string;
  dismissToast: (id: string) => void;
  /** Alias of dismissToast. */
  removeToast: (id: string) => void;
  success: (message: string, options?: Partial<ToastOptions>) => string;
  error: (message: string, options?: Partial<ToastOptions>) => string;
  warning: (message: string, options?: Partial<ToastOptions>) => string;
  info: (message: string, options?: Partial<ToastOptions>) => string;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = { success: Check, error: OctagonAlert, warning: TriangleAlert, info: Info };

/** Shows toasts raised with useToast(). Wrap the app once (inside ThemeProvider). */
export function ToastProvider({ children, max = 4 }: { children: ReactNode; max?: number }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismissToast = useCallback((id: string) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const addToast = useCallback(
    ({ message, variant = 'info', duration }: Omit<ToastOptions, 'id'>) => {
      counter.current += 1;
      const id = `toast-${counter.current}`;
      const toast: Toast = { id, message, variant, duration: duration ?? (variant === 'error' ? 8000 : 5000) };
      setToasts((all) => [...all, toast].slice(-max));
      return id;
    },
    [max],
  );

  const value = useMemo<ToastContextValue>(() => {
    const make = (variant: ToastVariant) => (message: string, options?: Partial<ToastOptions>) =>
      addToast({ ...options, message, variant });
    return {
      toasts,
      addToast,
      dismissToast,
      removeToast: dismissToast,
      success: make('success'),
      error: make('error'),
      warning: make('warning'),
      info: make('info'),
    };
  }, [toasts, addToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section className={styles.viewport} aria-label="Notifications">
        {/* Polite updates; errors also use role="alert" on their own item */}
        <ol className={styles.list}>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
          ))}
        </ol>
      </section>
    </ToastContext.Provider>
  );
}

/** Raise toasts from anywhere under ToastProvider: const toast = useToast(); toast.success('Saved'). */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>.');
  return ctx;
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);
  const started = useRef(0);

  useEffect(() => {
    if (!toast.duration || paused) return;
    started.current = Date.now();
    const t = window.setTimeout(() => onDismiss(toast.id), remaining.current);
    return () => {
      window.clearTimeout(t);
      remaining.current -= Date.now() - started.current;
    };
  }, [paused, toast.duration, toast.id, onDismiss]);

  const Icon = ICONS[toast.variant];
  return (
    <li
      className={cx(styles.toast, styles[toast.variant], paused && styles.paused)}
      role={toast.variant === 'error' ? 'alert' : 'status'}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon className={styles.icon} strokeWidth={1.5} aria-hidden="true" />
      <p className={styles.message}>{toast.message}</p>
      <button type="button" className={styles.close} onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
        <X strokeWidth={1.5} aria-hidden="true" />
      </button>
      {toast.duration > 0 && <span className={styles.timer} style={{ animationDuration: `${toast.duration}ms` }} aria-hidden="true" />}
    </li>
  );
}
