import { RefObject, useEffect } from "react";

export interface UseClickOutsideOptions {
  /**
   * 클릭 감지에서 제외할 요소들의 ref 배열
   *
   * 이 요소들 외부를 클릭했을 때만 handler가 실행됩니다.
   *
   * **사용 예시**:
   * - 단일 요소: `refs: [contentRef]`
   * - 여러 요소: `refs: [triggerRef, contentRef]` (trigger와 content 모두 내부로 간주)
   *
   * @example
   * ```tsx
   * // 단일 ref - 가장 일반적인 케이스 (Modal, Drawer)
   * const contentRef = useRef<HTMLDivElement>(null);
   * useClickOutside({
   *   refs: [contentRef],
   *   handler: () => handleClose(),
   *   enabled: isOpen
   * });
   *
   * // 여러 ref - Dropdown, Popover, Combobox 등
   * const triggerRef = useRef<HTMLButtonElement>(null);
   * const menuRef = useRef<HTMLDivElement>(null);
   * useClickOutside({
   *   refs: [triggerRef, menuRef],
   *   handler: () => handleClose(),
   *   enabled: isOpen
   * });
   * ```
   */
  refs: RefObject<HTMLElement>[];

  /**
   * 외부 클릭 시 실행할 콜백 함수
   */
  handler: (event: MouseEvent | TouchEvent) => void;

  /**
   * Hook 활성화 여부
   * @default true
   */
  enabled?: boolean;
}

/**
 * useClickOutside Hook
 *
 * 지정된 요소들의 외부 영역을 클릭했을 때 콜백을 실행합니다.
 * 마우스와 터치 이벤트를 모두 지원합니다.
 *
 * **refs 배열의 의미**:
 * - refs 배열은 "내부 영역"을 정의합니다.
 * - 배열에 포함된 모든 요소가 "클릭되지 않았을 때"만 handler가 실행됩니다.
 * - 하나의 요소만 있어도 배열 형태로 전달해야 합니다: `refs: [ref]`
 *
 * @example
 * ```tsx
 * // 단일 요소 (가장 흔한 케이스)
 * const contentRef = useRef<HTMLDivElement>(null);
 * useClickOutside({
 *   refs: [contentRef],
 *   handler: () => setIsOpen(false),
 *   enabled: isOpen
 * });
 *
 * // 여러 요소 (Trigger + Content 패턴)
 * const triggerRef = useRef<HTMLButtonElement>(null);
 * const menuRef = useRef<HTMLDivElement>(null);
 * useClickOutside({
 *   refs: [triggerRef, menuRef],
 *   handler: () => setIsOpen(false),
 *   enabled: isOpen
 * });
 * ```
 */
export function useClickOutside({
  refs,
  handler,
  enabled = true,
}: UseClickOutsideOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // 모든 ref가 존재하는지 확인
      const allRefsExist = refs.every((ref) => ref.current);
      if (!allRefsExist) return;

      // 클릭한 요소가 모든 ref 외부에 있는지 확인
      const isOutside = refs.every((ref) => !ref.current?.contains(target));

      if (isOutside) {
        handler(event);
      }
    };

    // 마우스와 터치 이벤트 모두 처리
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [refs, handler, enabled]);
}
