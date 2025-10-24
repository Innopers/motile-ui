import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "./Toast.css";

// ============================================================================
// Types
// ============================================================================

export type ToastVariant = "default";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  createdAt: number;
}

// ============================================================================
// Context
// ============================================================================

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
}

// ============================================================================
// Toast Item Component
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 250); // Match exit animation duration
  }, [toast.id, onRemove]);

  // Auto dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(handleDismiss, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [handleDismiss]);

  const baseClass = "taeri-toast";
  const classes = [baseClass, isExiting && `${baseClass}--exiting`]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-toast-id={toast.id}
    >
      <div className={`${baseClass}__message`}>{toast.message}</div>
    </div>
  );
}

// ============================================================================
// Toast Provider Component
// ============================================================================

export interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;

    const newToast: Toast = {
      id,
      message,
      variant: "default",
      createdAt: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue: ToastContextValue = useMemo(
    () => ({
      toasts,
      addToast,
    }),
    [toasts, addToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <div
            className="taeri-toast-container"
            aria-live="polite"
            aria-label="Notifications"
          >
            {toasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
