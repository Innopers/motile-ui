import { RefObject, useEffect } from "react";

export interface UseAutoBlurOptions {
  /**
   * 대상 범위를 좁히는 컨테이너 ref.
   *
   * 지정하면 이 컨테이너 **내부**에 포커스된 요소만 blur합니다.
   * 생략하면 문서 전체의 포커스된 입력 요소를 대상으로 합니다.
   *
   * @example
   * ```tsx
   * const sheetRef = useRef<HTMLDivElement>(null);
   * useAutoBlur({ containerRef: sheetRef, enabled: isOpen });
   * ```
   */
  // `| null`로 React 18/19 모두의 useRef<T>(null) 반환 타입을 수용
  containerRef?: RefObject<HTMLElement | null>;

  /**
   * Hook 활성화 여부
   * @default true
   */
  enabled?: boolean;
}

/**
 * 요소가 소프트 키보드(또는 date/time 등 네이티브 피커)를 띄우는 입력 요소인지 판별.
 * - textarea, contenteditable, 그리고 키보드/피커를 띄우는 input을 대상으로 합니다.
 * - checkbox/radio/range/file/color/button류/hidden/image 등 키보드를 띄우지 않는
 *   input 타입만 제외합니다(text·search·email·number·date·time 등은 대상).
 */
function opensSoftKeyboard(el: Element | null): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el instanceof HTMLTextAreaElement) return true;
  if (el.isContentEditable) return true;
  if (el instanceof HTMLInputElement) {
    const noKeyboardTypes = [
      "button",
      "checkbox",
      "color",
      "file",
      "hidden",
      "image",
      "radio",
      "range",
      "reset",
      "submit",
    ];
    return !noKeyboardTypes.includes(el.type);
  }
  return false;
}

/**
 * useAutoBlur Hook
 *
 * 모바일에서 입력 요소(input/textarea/contenteditable)에 포커스된 상태로
 * **스크롤(touchmove)** 하면 해당 요소를 blur해 소프트 키보드를 닫습니다.
 *
 * iOS Safari 등은 입력에 포커스가 남아 있는 한 키보드를 계속 띄워두는데,
 * 이를 순수 CSS로 닫을 수 없어 스크롤 제스처를 감지해 blur하는 방식입니다.
 * touchmove만 감지하므로 데스크톱(비터치)에는 영향이 없습니다.
 *
 * 참고: light DOM의 `document.activeElement`를 검사하므로, 입력이 shadow DOM
 * 내부에 있는 경우는 대상에서 제외될 수 있습니다(일반적인 React 앱에는 해당 없음).
 *
 * @example
 * ```tsx
 * // 문서 전체 — 어떤 입력이든 스크롤 시 키보드 닫기
 * useAutoBlur();
 *
 * // 특정 컨테이너로 범위 제한 + 열림 상태에서만 동작
 * const bodyRef = useRef<HTMLDivElement>(null);
 * useAutoBlur({ containerRef: bodyRef, enabled: isOpen });
 * ```
 */
export function useAutoBlur({
  containerRef,
  enabled = true,
}: UseAutoBlurOptions = {}): void {
  useEffect(() => {
    if (!enabled) return;

    const handleTouchMove = () => {
      const active = document.activeElement;
      if (!opensSoftKeyboard(active)) return;
      if (containerRef && !containerRef.current?.contains(active)) return;
      active.blur();
    };

    // passive: 스크롤을 막지 않고 blur만 수행 (스크롤 성능 영향 없음)
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => window.removeEventListener("touchmove", handleTouchMove);
  }, [containerRef, enabled]);
}
