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

  return {
    show,
    success,
  };
}
