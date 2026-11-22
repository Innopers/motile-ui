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

const PICKER_TYPES = ["date", "datetime-local", "month", "time", "week"];

/** 글자 키보드를 쓰는 칸 (피커 · readOnly · inputmode="none" 제외) */
function typesText(el: HTMLElement): boolean {
  if (el.getAttribute("inputmode") === "none") return false;
  if (el instanceof HTMLInputElement) {
    return !el.readOnly && !PICKER_TYPES.includes(el.type);
  }
  if (el instanceof HTMLTextAreaElement) return !el.readOnly;
  return true;
}

const KEYBOARD_SLACK = 40;

// clientHeight 기준: iOS 26 은 키보드가 뜨면 innerHeight 도 줄어듦
// scale 곱함: 확대로 줄어든 높이는 키보드가 아님
function isKeyboardOpen(): boolean {
  const viewport = window.visualViewport;
  return (
    !!viewport &&
    viewport.height * viewport.scale <
      document.documentElement.clientHeight - KEYBOARD_SLACK
  );
}

/**
 * useAutoBlur Hook
 *
 * 모바일에서 입력 요소(input/textarea/contenteditable)에 포커스된 채 아래 경우 blur해
 * 소프트 키보드를 닫음.
 * - 포커스된 칸 밖을 끌기 (칸 안 끌기 · 두 손가락 확대는 제외)
 * - 키보드만 내려감 (안드로이드 뒤로 가기)
 *
 * iOS Safari 등은 입력에 포커스가 남아 있는 한 키보드를 계속 띄워두는데,
 * 이를 순수 CSS로 닫을 수 없어 스크롤 제스처를 감지해 blur하는 방식입니다.
 * 데스크톱(비터치)에는 영향이 없습니다.
 *
 * 한계: viewport `interactive-widget=resizes-content` · `overlays-content` 나
 * Android WebView 에서는 키보드 내려감을 알 수 없음
 *
 * 참고: light DOM의 `document.activeElement`를 검사하므로, 입력이 shadow DOM
 * 내부에 있는 경우는 대상에서 제외될 수 있습니다(일반적인 React 앱에는 해당 없음).
 *
 * @example
 * ```tsx
 * // 문서 전체 — 포커스된 칸 밖을 끌면 키보드 닫기
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

    const focusedField = () => {
      const active = document.activeElement;
      if (!opensSoftKeyboard(active)) return null;
      if (containerRef && !containerRef.current?.contains(active)) return null;
      return active;
    };

    // 두 손가락 손짓 중 (손가락 하나를 떼도 손짓 끝까지 유지)
    let multiTouch = false;
    // 이번 포커스 동안 키보드가 떠 있었음
    let keyboardSeen = isKeyboardOpen();

    const handleTouchStart = (e: TouchEvent) => {
      multiTouch = e.touches.length > 1;
    };

    // touchmove target 은 손짓을 시작한 요소
    const handleTouchMove = (e: TouchEvent) => {
      const field = focusedField();
      if (!field || multiTouch) return;
      if (e.target instanceof Node && field.contains(e.target)) return;
      field.blur();
    };

    const handleFocusIn = () => {
      keyboardSeen = isKeyboardOpen();
    };

    const handleViewportResize = () => {
      const field = focusedField();
      if (!field || !typesText(field)) return;
      if (isKeyboardOpen()) {
        keyboardSeen = true;
      } else if (keyboardSeen) {
        keyboardSeen = false;
        field.blur();
      }
    };

    // passive: 스크롤을 막지 않고 blur만 수행 (스크롤 성능 영향 없음)
    // capture: 스크롤 잠금(useScrollLock)이 전파를 막아도 받음
    const touchOptions = { passive: true, capture: true };
    const viewport = window.visualViewport;
    window.addEventListener("touchstart", handleTouchStart, touchOptions);
    window.addEventListener("touchmove", handleTouchMove, touchOptions);
    document.addEventListener("focusin", handleFocusIn);
    viewport?.addEventListener("resize", handleViewportResize);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart, touchOptions);
      window.removeEventListener("touchmove", handleTouchMove, touchOptions);
      document.removeEventListener("focusin", handleFocusIn);
      viewport?.removeEventListener("resize", handleViewportResize);
    };
  }, [containerRef, enabled]);
}
