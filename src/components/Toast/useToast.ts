import { useCallback } from "react";
import { useToastContext } from "./Toast";

export interface UseToastReturn {
  /**
   * Show a toast notification
   */
  show: (message: string) => string;
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

  return {
    show,
  };
}
