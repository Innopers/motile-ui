import { useEffect, useRef, useState } from "react";

/**
 * 브라우저 히스토리를 활용한 모달/Sheet 뒤로가기 닫기 기능
 *
 * @description
 * 모달 열림 시 더미 히스토리 추가 → 뒤로가기 시 모달 닫기
 * iOS Safari 스와이프 제스처 및 브라우저 뒤로가기 버튼 지원
 *
 * @example
 * ```tsx
 * const { isClosingFromHistory, navigateAndClose } = useHistoryClose({
 *   isOpen,
 *   onClose,
 * });
 *
 * // 히스토리 기반 닫기 시 애니메이션 스킵
 * const duration = isClosingFromHistory ? 0 : 300;
 *
 * // Sheet 내부 링크 클릭 시 네비게이션
 * <a onClick={() => navigateAndClose(() => router.push('/path'))}>
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

export interface UseHistoryCloseReturn {
  /**
   * 히스토리 기반 닫기 여부
   */
  isClosingFromHistory: boolean;

  /**
   * Sheet을 닫으면서 페이지 네비게이션을 수행하는 함수
   * 히스토리를 깔끔하게 유지하면서 네비게이션을 처리합니다.
   *
   * @param navigationFn - 네비게이션 콜백 (예: () => router.push('/path'))
   *
   * @example
   * ```tsx
   * const { navigateAndClose } = useHistoryClose({ isOpen, onClose });
   *
   * const handleLinkClick = (href: string) => {
   *   navigateAndClose(() => router.push(href));
   * };
   * ```
   */
  navigateAndClose: (navigationFn: () => void) => void;
}

export function useHistoryClose({
  onClose,
  isOpen,
}: UseHistoryCloseProps): UseHistoryCloseReturn {
  // onClose를 ref로 저장하여 popstate 이벤트 핸들러에서 최신 함수 참조
  const onCloseRef = useRef(onClose);

  // 히스토리 항목 추가 여부를 추적 (중복 pushState 방지)
  const hasPushedRef = useRef(false);

  // 히스토리 기반 닫기 상태 (useState 사용으로 re-render 트리거)
  const [isClosingFromHistory, setIsClosingFromHistory] = useState(false);

  // Sheet이 열릴 때의 히스토리 길이 저장 (navigation 감지용)
  const initialHistoryLengthRef = useRef(0);

  // 대기 중인 네비게이션 콜백 저장
  const pendingNavigationRef = useRef<(() => void) | null>(null);

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

      // 현재 히스토리 길이 저장 (더미 항목 추가 전)
      initialHistoryLengthRef.current = window.history.length;

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
      // 히스토리 기반 닫기가 아닌 경우 (ESC, 외부 클릭, 닫기 버튼)
      if (!isClosingFromHistory) {
        // Sheet 내부에서 navigation이 발생했는지 확인
        // 더미 항목 추가 후 예상되는 길이: initialHistoryLength + 1
        const expectedLength = initialHistoryLengthRef.current + 1;
        const hasNavigated = window.history.length !== expectedLength;

        // navigation이 없었을 때만 더미 히스토리 제거
        if (!hasNavigated) {
          // 대기 중인 네비게이션이 있는 경우
          if (pendingNavigationRef.current) {
            // popstate 이벤트 리스너 등록 (history.back() 완료 후 실행)
            const handleNavigationPopState = () => {
              window.removeEventListener("popstate", handleNavigationPopState);

              // 히스토리 정리 후 네비게이션 실행
              if (pendingNavigationRef.current) {
                pendingNavigationRef.current();
                pendingNavigationRef.current = null;
              }
            };

            window.addEventListener("popstate", handleNavigationPopState);
            window.history.back();
          } else {
            // 일반 닫기: 더미 히스토리만 제거
            window.history.back();
          }
        } else {
          // navigation이 발생한 경우 pending navigation 초기화
          pendingNavigationRef.current = null;
        }
      }

      hasPushedRef.current = false;
      setIsClosingFromHistory(false);
    }
  }, [isOpen, isClosingFromHistory]);

  /**
   * Sheet을 닫으면서 페이지 네비게이션을 수행하는 함수
   *
   * 동작 순서:
   * 1. 네비게이션 콜백을 pendingNavigationRef에 저장
   * 2. onClose() 호출로 Sheet 닫기
   * 3. useEffect에서 history.back()으로 더미 히스토리 제거
   * 4. popstate 이벤트 발생 후 저장된 네비게이션 콜백 실행
   *
   * 최종 히스토리: [page1, page2] (깔끔하게 유지)
   */
  const navigateAndClose = (navigationFn: () => void) => {
    pendingNavigationRef.current = navigationFn;
    onCloseRef.current();
  };

  return {
    isClosingFromHistory,
    navigateAndClose,
  };
}
