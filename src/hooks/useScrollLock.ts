import { useEffect } from "react";

interface UseScrollLockOptions {
  enabled?: boolean;
  allowedSelectors?: string[];
}

/**
 * 강력한 스크롤 락 훅
 *
 * CSS와 이벤트 레벨에서 모든 스크롤을 차단하면서
 * 지정된 요소들은 스크롤을 허용합니다.
 *
 * iOS Safari의 모멘텀 스크롤도 touch-action과 overscroll-behavior로 차단합니다.
 *
 * @param enabled - 스크롤 락 활성화 여부
 * @param allowedSelectors - 스크롤을 허용할 CSS 선택자 배열
 */
export function useScrollLock({
  enabled = true,
  allowedSelectors = ["[data-scroll-allowed]", ".sheet-content", ".modal-body"],
}: UseScrollLockOptions = {}) {
  useEffect(() => {
    if (!enabled) return;

    // 기존 스타일 저장
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyHeight = document.body.style.height;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const originalBodyTouchAction = document.body.style.touchAction;
    const originalHtmlTouchAction = document.documentElement.style.touchAction;
    const originalBodyOverscrollBehavior =
      document.body.style.overscrollBehavior;
    const originalHtmlOverscrollBehavior =
      document.documentElement.style.overscrollBehavior;

    // 스크롤바 너비 계산 (레이아웃 시프트 방지)
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // CSS 레벨 스크롤 차단
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.height = "100%";

    // iOS Safari 모멘텀 스크롤 및 터치 제스처 차단
    document.body.style.touchAction = "none";
    document.documentElement.style.touchAction = "none";

    // 오버스크롤(바운스) 차단
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    // 스크롤바가 사라진 공간만큼 오른쪽 패딩 추가 (레이아웃 시프트 방지)
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // 이벤트 레벨 스크롤 차단 (허용된 요소 제외)
    const preventScroll = (e: Event) => {
      const target = e.target;

      // target이 HTMLElement인지 확인
      if (!target || !(target instanceof HTMLElement)) {
        // HTMLElement가 아니면 기본적으로 차단
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // 허용된 선택자에 해당하는 요소인지 확인
      const isAllowed = allowedSelectors.some((selector) => {
        try {
          return target.closest(selector);
        } catch {
          // closest 메소드 실행 중 에러 발생 시 차단
          return false;
        }
      });

      if (!isAllowed) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 모든 스크롤 관련 이벤트 차단
    const eventOptions = { passive: false };
    document.addEventListener("wheel", preventScroll, eventOptions);
    document.addEventListener("touchmove", preventScroll, eventOptions);
    document.addEventListener("scroll", preventScroll, eventOptions);

    // 키보드 스크롤도 차단 (스페이스바, 화살표 키 등)
    const preventKeyboardScroll = (e: KeyboardEvent) => {
      const target = e.target;

      // target이 HTMLElement인지 확인
      if (!target || !(target instanceof HTMLElement)) {
        // HTMLElement가 아니면 스크롤 키 차단
        const scrollKeys = [
          "Space",
          "PageUp",
          "PageDown",
          "End",
          "Home",
          "ArrowLeft",
          "ArrowUp",
          "ArrowRight",
          "ArrowDown",
        ];

        if (scrollKeys.includes(e.code)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        return;
      }

      // 허용된 요소 내부에서의 키보드 사용은 허용
      const isAllowed = allowedSelectors.some((selector) => {
        try {
          return target.closest(selector);
        } catch {
          return false;
        }
      });

      if (!isAllowed) {
        // 스크롤을 유발하는 키들
        const scrollKeys = [
          "Space", // 스페이스바
          "PageUp", // Page Up
          "PageDown", // Page Down
          "End", // End
          "Home", // Home
          "ArrowLeft", // ← 화살표
          "ArrowUp", // ↑ 화살표
          "ArrowRight", // → 화살표
          "ArrowDown", // ↓ 화살표
        ];

        if (scrollKeys.includes(e.code)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    document.addEventListener("keydown", preventKeyboardScroll, eventOptions);

    // 정리 함수
    return () => {
      // 스타일 복원
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.height = originalBodyHeight;
      document.body.style.paddingRight = originalBodyPaddingRight;
      document.body.style.touchAction = originalBodyTouchAction;
      document.documentElement.style.touchAction = originalHtmlTouchAction;
      document.body.style.overscrollBehavior = originalBodyOverscrollBehavior;
      document.documentElement.style.overscrollBehavior =
        originalHtmlOverscrollBehavior;

      // 이벤트 리스너 제거
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
      document.removeEventListener("scroll", preventScroll);
      document.removeEventListener("keydown", preventKeyboardScroll);
    };
  }, [enabled, allowedSelectors]);

  return {
    isLocked: enabled,
  };
}
