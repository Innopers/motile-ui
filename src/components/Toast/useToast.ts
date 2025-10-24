import { useCallback } from "react";
import { useToastContext } from "./Toast";

export interface UseToastReturn {
  /**
   * Show a default toast notification
   */
  show: (message: string) => string;
  /**
   * Show a success toast notification
   */
  success: (message: string) => string;
  /**
   * Show an error toast notification
   */
  error: (message: string) => string;
  /**
   * Show a warning toast notification
   */
  warning: (message: string) => string;
}

/**
 * Hook to use toast notifications
 * Must be used within ToastProvider
 */
export function useToast(): UseToastReturn {
  const { addToast } = useToastContext();

  const show = useCallback(
    (message: string) => {
      return addToast(message);
    },
    [addToast]
  );

  const success = useCallback(
    (message: string) => {
      return addToast(message, "success");
    },
    [addToast]
  );

  const error = useCallback(
    (message: string) => {
      return addToast(message, "error");
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string) => {
      return addToast(message, "warning");
    },
    [addToast]
  );

  return {
    show,
    success,
    error,
    warning,
  };
}
