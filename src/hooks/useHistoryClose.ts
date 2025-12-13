import { useCallback, useEffect, useRef, useState } from "react";

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

  /**
   * 히스토리 기반 닫기 기능 활성화 여부
   * URL로 Sheet를 제어하는 경우 false로 설정
   * @default true
   */
  enabled?: boolean;
}

export interface UseHistoryCloseReturn {
  /**
   * 히스토리 기반 닫기 여부
   */
  isClosingFromHistory: boolean;

  /**
   * Sheet/Modal을 닫는 함수
   * 히스토리 기반 닫기가 활성화된 경우 history.back()을 통해 닫아
   * 더미 히스토리를 확실하게 제거합니다.
   *
   * @description
   * - enableHistoryClose=true: history.back() → popstate → onClose
   * - enableHistoryClose=false: 직접 onClose() 호출
   *
   * Sheet.Close, 닫기 버튼 등에서 사용하세요.
   *
   * @example
   * ```tsx
   * const { close } = useHistoryClose({ isOpen, onClose });
   *
   * <button onClick={close}>닫기</button>
   * ```
   */
  close: () => void;

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
  enabled = true,
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

  // ============================================================================
  // 열림 상태: popstate 리스너 등록 + pushState
  // ============================================================================
  useEffect(() => {
    // 기능 비활성화 시 아무것도 안 함 (URL 기반 제어 등)
    if (!enabled) return;

    // Sheet이 닫혀있으면 아무것도 안 함
    if (!isOpen) return;

    // popstate 이벤트 핸들러 (뒤로가기/스와이프 감지)
    const handlePopState = (_e: PopStateEvent) => {
      // 히스토리 기반 닫기 플래그 설정 (컴포넌트 re-render 발생)
      setIsClosingFromHistory(true);
      onCloseRef.current();
    };

    // pushState는 한 번만 실행 (React Strict Mode에서도 안전)
    // hasPushedRef로 중복 방지
    if (!hasPushedRef.current) {
      // 현재 히스토리 길이 저장 (더미 항목 추가 전)
      initialHistoryLengthRef.current = window.history.length;

      // 더미 히스토리 항목 추가
      window.history.pushState({ modal: true }, "");
      hasPushedRef.current = true;
    }

    // 리스너는 항상 등록 (React Strict Mode cleanup 후 재등록 필요)
    // 핵심 수정: 조건문 밖에서 리스너 등록하여 Strict Mode에서도 정상 작동
    window.addEventListener("popstate", handlePopState);

    // cleanup: 컴포넌트 unmount 또는 isOpen 변경 시 리스너 제거
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, enabled]);

  // ============================================================================
  // 닫힘 상태: 히스토리 정리 및 상태 초기화
  // ============================================================================
  useEffect(() => {
    // 기능 비활성화 시 아무것도 안 함
    if (!enabled) return;

    // Sheet이 열려있거나, pushState를 안 했으면 아무것도 안 함
    if (isOpen || !hasPushedRef.current) return;

    // cleanup에서 제거할 리스너 참조
    let navigationPopStateHandler: (() => void) | null = null;

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
          // navigationFn을 로컬 변수에 저장 (참조 안정성)
          const navigationFn = pendingNavigationRef.current;
          pendingNavigationRef.current = null; // 먼저 초기화

          // popstate 이벤트 핸들러 정의
          navigationPopStateHandler = () => {
            window.removeEventListener("popstate", navigationPopStateHandler!);
            navigationPopStateHandler = null;

            // 핵심 수정: popstate 핸들러 밖에서 navigation 실행
            // popstate 이벤트 처리 중 history 변경 시 브라우저 충돌 방지
            setTimeout(() => {
              navigationFn();
            }, 0);
          };

          window.addEventListener("popstate", navigationPopStateHandler);
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

    // cleanup: 등록된 popstate 리스너 제거 (메모리 누수 방지)
    return () => {
      if (navigationPopStateHandler) {
        window.removeEventListener("popstate", navigationPopStateHandler);
      }
    };
  }, [isOpen, isClosingFromHistory, enabled]);

  /**
   * Sheet/Modal을 닫는 함수
   *
   * 동작 방식:
   * - enabled=true이고 더미 히스토리가 추가된 상태: history.back() 호출
   *   → popstate 이벤트 발생 → handlePopState에서 onClose 호출
   *   → 뒤로가기와 동일한 경로로 닫힘 (더미 히스토리 확실히 제거)
   * - 그 외: 직접 onClose() 호출
   */
  const close = useCallback(() => {
    // 히스토리 기능 비활성화 시 직접 닫기
    if (!enabled) {
      onCloseRef.current();
      return;
    }

    // 더미 히스토리가 추가된 상태면 history.back()으로 닫기
    // → popstate 이벤트 발생 → handlePopState에서 isClosingFromHistory=true, onClose() 호출
    // → 뒤로가기와 동일한 경로로 처리되어 더미 히스토리 확실히 제거
    if (hasPushedRef.current) {
      window.history.back();
    } else {
      // 아직 pushState 안 했거나 이미 처리된 경우
      onCloseRef.current();
    }
  }, [enabled]);

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
  const navigateAndClose = useCallback((navigationFn: () => void) => {
    pendingNavigationRef.current = navigationFn;
    onCloseRef.current();
  }, []);

  return {
    isClosingFromHistory,
    close,
    navigateAndClose,
  };
}
