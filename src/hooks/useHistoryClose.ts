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

/**
 * 각 Sheet 인스턴스를 위한 고유 ID 생성
 * history.state에서 우리의 dummy entry를 정확히 식별하기 위함
 */
const generateSheetId = () =>
  `__motile_sheet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// ============================================================================
// 오버레이 레지스트리 (모듈 스코프) — 중첩 안전화
// ============================================================================
//
// 여러 Sheet이 동시에 열릴 때(중첩) 각 인스턴스가 자기만의 popstate 리스너를
// 가지면 pop 1회에 전부 닫혀버린다. 공유 리스너 1개 + 스택으로
// "최상단만 닫기"를 보장한다. 단일 인스턴스의 관측 동작은 기존과 동일하다.
//
// - overlayStack: 열린 순서(아래→위). top = 마지막 요소
// - orphanedDummies: top이 아닌 채로 닫혀 더미가 히스토리 중간에 묻힌 인스턴스의
//   id. 이후 pop으로 그 더미에 착지하면 한 번 더 back()으로 건너뛴다.
// - expectedPops: "정리/스킵용 back()"이 만들 popstate를 사용자 pop(닫기)으로
//   오해하지 않기 위한 카운터
//
// 불변식: 리스너 attached ⇔ (overlayStack.length > 0 || expectedPops > 0)

interface OverlayEntry {
  id: string;
  closeFromPop: () => void;
}

const overlayStack: OverlayEntry[] = [];
const orphanedDummies = new Set<string>();
let expectedPops = 0;
let listenerAttached = false;

function handleSharedPopState(_e: PopStateEvent) {
  if (expectedPops > 0) {
    // 정리/스킵용 back()의 pop — 닫기로 해석하지 않는다
    expectedPops -= 1;
  } else {
    // 사용자 pop — 스택 최상단만 닫는다
    overlayStack.pop()?.closeFromPop();
  }

  // 착지한 곳이 고아 더미면 한 번 더 back()으로 건너뛴다.
  // (event.state가 아니라 window.history.state를 읽는다 — 수동 dispatch 호환)
  const landedState = window.history.state as {
    __motileSheetModal?: string;
  } | null;
  const landedId = landedState?.__motileSheetModal;
  if (landedId && orphanedDummies.has(landedId)) {
    orphanedDummies.delete(landedId); // back() 전에 삭제 → 루프 불가
    expectedPops += 1;
    window.history.back();
  }

  detachIfIdle();
}

function attachIfNeeded() {
  if (listenerAttached) return;
  // 새 오버레이 세션 시작 — 이전 세션 잔여물 정리
  orphanedDummies.clear();
  expectedPops = 0;
  window.addEventListener("popstate", handleSharedPopState);
  listenerAttached = true;
}

function detachIfIdle() {
  if (!listenerAttached) return;
  if (overlayStack.length > 0 || expectedPops > 0) return;
  window.removeEventListener("popstate", handleSharedPopState);
  listenerAttached = false;
  orphanedDummies.clear();
}

const overlayRegistry = {
  /** 열린 인스턴스 등록 (id 기준 멱등 — React Strict Mode 재실행 안전) */
  add(id: string, closeFromPop: () => void) {
    attachIfNeeded();
    orphanedDummies.delete(id); // Strict Mode 재등록 시 고아 해제
    const existing = overlayStack.find((entry) => entry.id === id);
    if (existing) {
      existing.closeFromPop = closeFromPop;
    } else {
      overlayStack.push({ id, closeFromPop });
    }
  },

  /**
   * 등록 해제 (멱등).
   * 여기서 고아 등록은 하지 않는다 — cleanup만으로는 unmount와
   * Strict Mode 재실행을 구분할 수 없기 때문. (고아 등록은 닫힘 effect의
   * else-분기에서만 명시적으로 수행)
   */
  remove(id: string) {
    const index = overlayStack.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      overlayStack.splice(index, 1);
    }
    detachIfIdle();
  },

  /** top이 아닌 채로 닫힌 인스턴스의 더미를 이후 pop에서 스킵하도록 표시 */
  orphan(id: string) {
    // 리스너가 없으면(단일 인스턴스가 이미 정리된 경로) 오늘과 동일하게 무시
    if (!listenerAttached) return;
    orphanedDummies.add(id);
  },

  /** 곧 실행할 back()이 "정리용"임을 예고 — 그 pop은 닫기로 해석하지 않는다 */
  willConsumePop() {
    if (!listenerAttached) return;
    expectedPops += 1;
  },
};

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

  // 이 Sheet 인스턴스의 고유 ID (history.state 식별용)
  const sheetIdRef = useRef<string | null>(null);

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

    // pushState는 한 번만 실행 (React Strict Mode에서도 안전)
    // hasPushedRef로 중복 방지
    if (!hasPushedRef.current) {
      // 고유 ID 생성
      sheetIdRef.current = generateSheetId();

      // 더미 히스토리 항목 추가 (고유 ID를 state에 저장)
      // 이 ID로 나중에 우리의 dummy entry를 정확히 식별
      window.history.pushState({ __motileSheetModal: sheetIdRef.current }, "");
      hasPushedRef.current = true;
    }

    const id = sheetIdRef.current;
    if (!id) return;

    // 공유 popstate 리스너의 스택에 등록 (멱등 — Strict Mode 재실행 안전)
    // pop 발생 시 스택 최상단 인스턴스만 닫힌다 (중첩 안전).
    overlayRegistry.add(id, () => {
      // 히스토리 기반 닫기 플래그 설정 (컴포넌트 re-render 발생)
      setIsClosingFromHistory(true);
      onCloseRef.current();
    });

    // cleanup: 컴포넌트 unmount 또는 isOpen 변경 시 등록 해제
    return () => {
      overlayRegistry.remove(id);
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

    // 히스토리 기반 닫기가 아닌 경우 (ESC, 외부 클릭, 닫기 버튼, 직접 상태 변경)
    if (!isClosingFromHistory) {
      // 핵심 수정: history.length 대신 history.state로 우리의 dummy entry 확인
      // 외부 코드(analytics, router 등)가 pushState를 호출해도 정확히 식별 가능
      const currentState = window.history.state;
      const isOnOurDummy =
        currentState?.__motileSheetModal === sheetIdRef.current;

      if (isOnOurDummy) {
        // 현재 우리의 dummy entry 위에 있음 → history.back()으로 원래 위치로 이동
        const navigationFn = pendingNavigationRef.current;
        pendingNavigationRef.current = null;

        // 대기 중인 네비게이션이 있으면 back() 후 실행
        if (navigationFn) {
          navigationPopStateHandler = () => {
            window.removeEventListener("popstate", navigationPopStateHandler!);
            navigationPopStateHandler = null;
            setTimeout(() => {
              navigationFn();
            }, 0);
          };
          window.addEventListener("popstate", navigationPopStateHandler);
        }

        // 이 back()은 "더미 정리용" — 공유 리스너가 아래 시트를 닫는 것으로
        // 오해하지 않도록 예고 (중첩 시 필수, 단일 시트에선 no-op)
        overlayRegistry.willConsumePop();
        window.history.back();
      } else {
        // 우리의 dummy entry 위에 있지 않음
        // (외부 코드가 pushState를 호출했거나 사용자가 네비게이션함)
        // 이 경우 history.back()을 호출하면 예상치 못한 곳으로 이동할 수 있음
        // dummy entry는 history에 남지만, 사용자 경험에 큰 영향 없음
        // (뒤로가기 한 번 더 누르면 됨)

        // 중첩 상태에서 아래 시트가 먼저 닫힌 경우: 묻힌 더미를 고아로 표시해
        // 이후 pop에서 자동으로 건너뛴다 (단일 시트 경로에선 no-op)
        if (sheetIdRef.current) {
          overlayRegistry.orphan(sheetIdRef.current);
        }

        // 대기 중인 네비게이션이 있으면 실행
        if (pendingNavigationRef.current) {
          const navigationFn = pendingNavigationRef.current;
          pendingNavigationRef.current = null;
          setTimeout(() => {
            navigationFn();
          }, 0);
        }
      }
    }

    hasPushedRef.current = false;
    sheetIdRef.current = null;
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
   * - 현재 history.state가 우리의 dummy entry인 경우: history.back() 호출
   *   → popstate 이벤트 발생 → handlePopState에서 onClose 호출
   *   → 뒤로가기와 동일한 경로로 닫힘 (더미 히스토리 확실히 제거)
   * - 그 외 (외부 코드가 history 수정한 경우): 직접 onClose() 호출
   *   → cleanup effect에서 상황에 맞게 처리
   */
  const close = useCallback(() => {
    // 히스토리 기능 비활성화 시 직접 닫기
    if (!enabled) {
      onCloseRef.current();
      return;
    }

    // 더미 히스토리가 추가된 상태인지 확인
    if (hasPushedRef.current) {
      // 핵심: 현재 우리의 dummy entry 위에 있는지 확인
      const currentState = window.history.state;
      if (currentState?.__motileSheetModal === sheetIdRef.current) {
        // 우리의 dummy entry 위에 있음 → history.back()으로 원래 위치로 이동
        // back() 하면 popstate 이벤트 발생 → handlePopState에서 onClose 호출
        window.history.back();
      } else {
        // 우리의 dummy entry 위에 있지 않음
        // (외부 코드가 pushState를 호출한 경우)
        // 직접 onClose() 호출하고 cleanup effect에서 처리
        onCloseRef.current();
      }
    } else {
      // pushState를 안 했거나 이미 처리된 경우
      onCloseRef.current();
    }
  }, [enabled]);

  /**
   * Sheet을 닫으면서 페이지 네비게이션을 수행하는 함수
   *
   * 동작 순서:
   * 1. 네비게이션 콜백을 pendingNavigationRef에 저장
   * 2. onClose() 호출로 Sheet 닫기
   * 3. useEffect에서 history.back()으로 더미 히스토리 제거 (가능한 경우)
   * 4. popstate 이벤트 발생 후 저장된 네비게이션 콜백 실행
   *
   * 외부 코드가 history를 수정한 경우에도 네비게이션은 정상 실행됨
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
