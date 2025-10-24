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

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastOptions {
  duration?: number;
  zIndex?: number;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  zIndex?: number;
  createdAt: number;
}

// ============================================================================
// Context
// ============================================================================

interface ToastContextValue {
  toasts: Toast[];
  addToast: (
    message: string,
    variant?: ToastVariant,
    options?: ToastOptions
  ) => string;
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

  // Auto dismiss
  useEffect(() => {
    const timer = setTimeout(handleDismiss, toast.duration);

    return () => {
      clearTimeout(timer);
    };
  }, [handleDismiss, toast.duration]);

  const icon = useMemo(() => {
    if (toast.variant === "success") {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
          <path
            d="M6 10L8.5 12.5L14 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    if (toast.variant === "error") {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
          <path
            d="M7 7L13 13M13 7L7 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    }
    if (toast.variant === "warning") {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 2L2 17H18L10 2Z" fill="currentColor" opacity="0.2" />
          <path
            d="M10 7V11M10 14V14.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    }
    if (toast.variant === "info") {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
          <path
            d="M10 7V7.5M10 10V14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    }
    return null;
  }, [toast.variant]);

  const baseClass = "taeri-toast";
  const classes = [
    baseClass,
    `${baseClass}--${toast.variant}`,
    isExiting && `${baseClass}--exiting`,
  ]
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
      {icon && <div className={`${baseClass}__icon`}>{icon}</div>}
      <div className={`${baseClass}__message`}>{toast.message}</div>
    </div>
  );
}

// ============================================================================
// Toast Provider Component
// ============================================================================

export interface ToastProviderProps {
  children: React.ReactNode;
  zIndex?: number;
}

export function ToastProvider({ children, zIndex = 9999 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (
      message: string,
      variant: ToastVariant = "default",
      options?: ToastOptions
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`;

      const newToast: Toast = {
        id,
        message,
        variant,
        duration: options?.duration ?? 4000,
        zIndex: options?.zIndex,
        createdAt: Date.now(),
      };

      setToasts((prev) => [newToast, ...prev]);

      return id;
    },
    []
  );

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

  // 개별 Toast 중 가장 높은 zIndex를 찾아서 container에 적용
  const customZIndexToasts = toasts.filter(
    (toast) => toast.zIndex !== undefined
  );
  const containerZIndex =
    customZIndexToasts.length > 0
      ? Math.max(...customZIndexToasts.map((toast) => toast.zIndex!))
      : zIndex;

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <div
            className="taeri-toast-container"
            aria-live="polite"
            aria-label="Notifications"
            style={{ zIndex: containerZIndex }}
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
