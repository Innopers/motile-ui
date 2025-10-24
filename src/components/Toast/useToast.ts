import { useCallback } from "react";
import { useToastContext, ToastOptions } from "./Toast";

export interface UseToastReturn {
  /**
   * Show a default toast notification
   */
  show: (message: string, options?: ToastOptions) => string;
  /**
   * Show a success toast notification
   */
  success: (message: string, options?: ToastOptions) => string;
  /**
   * Show an error toast notification
   */
  error: (message: string, options?: ToastOptions) => string;
  /**
   * Show a warning toast notification
   */
  warning: (message: string, options?: ToastOptions) => string;
  /**
   * Show an info toast notification
   */
  info: (message: string, options?: ToastOptions) => string;
}

/**
 * Hook to use toast notifications
 * Must be used within ToastProvider
 */
export function useToast(): UseToastReturn {
  const { addToast } = useToastContext();

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      return addToast(message, "default", options);
    },
    [addToast]
  );

  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      return addToast(message, "success", options);
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      return addToast(message, "error", options);
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) => {
      return addToast(message, "warning", options);
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => {
      return addToast(message, "info", options);
    },
    [addToast]
  );

  return {
    show,
    success,
    error,
    warning,
    info,
  };
}
