import { useEffect, useRef, useState } from "react";

/**
 * useHistoryClose Hook
 *
 * 브라우저 히스토리를 활용하여 모달/Sheet를 뒤로가기로 닫는 기능을 제공합니다.
 * iOS Safari의 오른쪽 스와이프 제스처와 데스크톱의 브라우저 뒤로가기 버튼을 지원합니다.
 *
 * @description
 * History Absorption Pattern 구현:
 *
 * **동작 원리**
 * 1. 모달이 열릴 때 `window.history.pushState()`로 더미 히스토리 항목 추가
 * 2. 브라우저 뒤로가기 시 `popstate` 이벤트가 발생하면 모달 닫기
 * 3. 다른 방법(버튼 클릭, ESC, 외부 클릭 등)으로 닫을 때는 `history.back()`으로 더미 히스토리 제거
 *
 * **상태 관리**
 * - `useState`를 사용하여 히스토리 기반 닫기 여부를 추적
 * - 컴포넌트가 re-render되어 closing animation을 즉시 스킵 가능
 * - 빠른 스와이프 제스처에서도 깜빡임 없이 닫힘
 *
 * **히스토리 정리**
 * - 뒤로가기로 닫을 때: 브라우저가 자동으로 히스토리 pop (history.back() 불필요)
 * - ESC/외부 클릭으로 닫을 때: `history.back()` 호출하여 더미 히스토리 제거
 * - 더미 히스토리가 남지 않아 사용자 경험 개선
 *
 * @limitation
 * - 모달 열린 상태에서 새로고침 시 히스토리에 더미 state가 남음
 * - 이후 뒤로가기 시 같은 페이지가 한 번 더 렌더링됨 (acceptable trade-off)
 *
 * @example
 * ```tsx
 * const isClosingFromHistory = useHistoryClose({
 *   isOpen,
 *   onClose,
 * });
 *
 * // 히스토리 기반 닫기인 경우 애니메이션 스킵
 * const closingDuration = isClosingFromHistory ? 0 : 300;
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

export function useHistoryClose({
  onClose,
  isOpen,
}: UseHistoryCloseProps) {
  // onClose를 ref로 저장하여 popstate 이벤트 핸들러에서 최신 함수 참조
  const onCloseRef = useRef(onClose);

  // 히스토리 항목 추가 여부를 추적 (중복 pushState 방지)
  const hasPushedRef = useRef(false);

  // 히스토리 기반 닫기 상태 (useState 사용으로 re-render 트리거)
  const [isClosingFromHistory, setIsClosingFromHistory] = useState(false);

  // onClose 함수가 변경될 때마다 ref 업데이트
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // 모달 열림/닫힘 상태에 따른 히스토리 관리
  useEffect(() => {
    // 모달이 열릴 때: 더미 히스토리 항목 추가 및 이벤트 리스너 등록
    if (isOpen && !hasPushedRef.current) {
      const handlePopState = (_e: PopStateEvent) => {
        // 히스토리 기반 닫기 플래그 설정 (컴포넌트 re-render 발생)
        setIsClosingFromHistory(true);
        onCloseRef.current();
      };

      // 더미 히스토리 항목 추가
      window.history.pushState({ modal: true }, "");
      hasPushedRef.current = true;
      window.addEventListener("popstate", handlePopState);

      // cleanup: 컴포넌트 unmount 또는 isOpen 변경 시 리스너 제거
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }

    // 모달이 닫힐 때: 히스토리 정리 및 상태 초기화
    if (!isOpen && hasPushedRef.current) {
      // 히스토리 기반 닫기가 아닌 경우 (ESC, 외부 클릭, 닫기 버튼)에만 더미 히스토리 제거
      if (!isClosingFromHistory) {
        window.history.back();
      }

      hasPushedRef.current = false;
      setIsClosingFromHistory(false);
    }
  }, [isOpen, isClosingFromHistory]);

  return isClosingFromHistory;
}
