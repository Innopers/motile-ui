import { useEffect } from "react";

export interface UseEscapeKeyOptions {
  /**
   * ESC 키 입력 시 실행할 콜백 함수
   */
  handler: (event: KeyboardEvent) => void;

  /**
   * Hook 활성화 여부
   * @default true
   */
  enabled?: boolean;
}

/**
 * useEscapeKey Hook
 *
 * ESC 키를 눌렀을 때 콜백을 실행합니다.
 * 모달, 드로어, 팝오버 등을 닫는 용도로 주로 사용됩니다.
 *
 * @example
 * ```tsx
 * useEscapeKey({
 *   handler: () => {
 *     console.log('ESC key pressed!');
 *     handleClose();
 *   },
 *   enabled: isOpen
 * });
 * ```
 */
export function useEscapeKey({
  handler,
  enabled = true,
}: UseEscapeKeyOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handler(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handler, enabled]);
}
