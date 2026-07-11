import { useEffect, useId, useRef } from "react";

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

  /**
   * 스택 모드 — 동시에 활성화된 stacked 인스턴스 중 최상단(마지막 등록)만
   * ESC를 처리합니다. 중첩 오버레이(Sheet 위 Sheet, Modal 위 Select 등)에서
   * ESC 1회에 전부 닫혀버리는 문제를 방지합니다.
   *
   * 기본값 false = 기존 동작(모든 리스너 발화) 그대로 — 기존 소비자 영향 없음.
   * @default false
   */
  stacked?: boolean;
}

// ============================================================================
// ESC 스택 (모듈 스코프) — 중첩 안전화
// ============================================================================
// stacked=true + enabled인 인스턴스만 등록 순서대로 쌓인다 (마지막 = 최상단).
// 등록은 handler와 분리된 effect(deps [enabled, stacked])에서 수행하므로
// 인라인 핸들러가 리렌더마다 재생성되어도 스택 순서는 흔들리지 않는다.

const escapeStack: string[] = [];

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
 *
 * @example 중첩 오버레이 — 최상단만 닫히게
 * ```tsx
 * useEscapeKey({ handler: close, enabled: open, stacked: true });
 * ```
 */
export function useEscapeKey({
  handler,
  enabled = true,
  stacked = false,
}: UseEscapeKeyOptions): void {
  const escapeId = useId();

  // 최신 stacked 값 참조 (keydown 리스너 effect의 deps를 늘리지 않기 위함)
  const stackedRef = useRef(stacked);
  useEffect(() => {
    stackedRef.current = stacked;
  }, [stacked]);

  // 스택 등록/해제 — handler 변경과 분리 (핸들러 재생성이 순서를 바꾸지 못하게)
  useEffect(() => {
    if (!enabled || !stacked) return;

    if (!escapeStack.includes(escapeId)) {
      escapeStack.push(escapeId);
    }

    return () => {
      const index = escapeStack.indexOf(escapeId);
      if (index >= 0) {
        escapeStack.splice(index, 1);
      }
    };
  }, [enabled, stacked, escapeId]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // stacked 모드: 스택 최상단(마지막 등록)만 처리
        // (기본 unstacked 경로는 이 가드가 false로 단락 — 기존 동작 그대로)
        if (
          stackedRef.current &&
          escapeStack[escapeStack.length - 1] !== escapeId
        ) {
          return;
        }
        handler(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handler, enabled, escapeId]);
}
