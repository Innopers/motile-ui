import { useEffect } from "react";

/**
 * useHistoryClose Hook
 *
 * 브라우저 히스토리 기반 뒤로가기 제스처로 모달/Sheet 닫기
 * 모바일 웹뷰에서 네이티브 앱과 동일한 UX 제공
 *
 * @description
 * - 모달이 열릴 때 히스토리에 더미 state 추가
 * - 사용자가 뒤로가기 제스처(스와이프) 시 popstate 이벤트 발생
 * - onClose() 호출하여 모달만 닫기 (실제 페이지 이동 없음)
 *
 * @example
 * ```tsx
 * useHistoryClose({ isOpen, onClose });
 * ```
 */
export interface UseHistoryCloseProps {
  /**
   * 모달/Sheet 열림 상태
   */
  isOpen: boolean;

  /**
   * 모달/Sheet 닫기 핸들러
   */
  onClose: () => void;
}

export function useHistoryClose({ onClose, isOpen }: UseHistoryCloseProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = (_e: PopStateEvent) => {
      // 사용자가 뒤로가기 제스처/버튼 → 모달만 닫기
      onClose();
    };

    // 모달 열릴 때 더미 state 삽입
    window.history.pushState({ modal: true }, "");
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, onClose]);
}
