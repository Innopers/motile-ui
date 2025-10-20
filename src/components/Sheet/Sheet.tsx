import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useHistoryClose } from "../../hooks/useHistoryClose";
import "./Sheet.css";

/**
 * Sheet 위치 타입
 */
export type SheetPosition = "left" | "right";

/**
 * CloseOnBackdrop 옵션 타입
 *
 * - `true`: ESC 키와 외부 클릭 모두 허용
 * - `false`: ESC 키와 외부 클릭 모두 비활성화
 * - `{ escapeKey: boolean }`: ESC 키만 제어
 * - `{ clickOutside: boolean }`: 외부 클릭만 제어
 * - `{ escapeKey: boolean, clickOutside: boolean }`: 명시적으로 모두 제어
 */
export type CloseOnBackdropOptions =
  | boolean
  | {
      escapeKey?: boolean;
      clickOutside?: boolean;
    };

export interface SheetHandle {
  open: () => void;
  close: () => void;
}

export interface SheetProps {
  /**
   * Sheet 열림 상태
   */
  isOpen: boolean;

  /**
   * Sheet 닫을 때 호출되는 함수
   */
  onClose: () => void;

  /**
   * Sheet 열릴 때 호출되는 함수 (선택적)
   */
  onOpen?: () => void;

  /**
   * Sheet 제목 (선택적)
   */
  title?: string;

  /**
   * Sheet 내부 컨텐츠
   */
  children: React.ReactNode;

  /**
   * Sheet 나타나는 위치
   *
   * @default "right"
   */
  position?: SheetPosition;

  /**
   * 백드롭 클릭 또는 ESC 키로 닫기 제어
   *
   * @default true (모두 허용)
   */
  closeOnBackdrop?: CloseOnBackdropOptions;

  /**
   * 브라우저 히스토리 뒤로가기로 닫기 제어
   *
   * 모바일에서 스와이프 제스처, 데스크톱에서 뒤로가기 버튼/단축키로 Sheet를 닫을 수 있습니다.
   * - 모바일: 오른쪽 스와이프 제스처
   * - 데스크톱: 브라우저 뒤로가기 버튼, 마우스 뒤로가기, Alt+Left (Win), Cmd+[ (Mac)
   *
   * @default true
   */
  closeOnHistoryBack?: boolean;

  /**
   * Sheet 최대 너비 (데스크톱 전용)
   *
   * @default "600px"
   *
   * @example
   * <Sheet maxWidth="800px" />
   */
  maxWidth?: string;

  /**
   * z-index 값
   *
   * @default 1000
   */
  zIndex?: number;

  /**
   * Header 표시 여부
   *
   * @default true
   */
  showHeader?: boolean;

  /**
   * 추가 CSS 클래스
   */
  className?: string;

  /**
   * 추가 인라인 스타일
   */
  style?: React.CSSProperties;
}

/**
 * Sheet 컴포넌트
 *
 * 화면 왼쪽 또는 오른쪽에서 슬라이드되는 사이드 패널 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Sheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="설정"
 *   position="right"
 * >
 *   <p>Sheet 내용</p>
 * </Sheet>
 * ```
 */
export const Sheet = forwardRef<SheetHandle, SheetProps>(
  (
    {
      isOpen,
      onClose,
      onOpen,
      title,
      children,
      position = "right",
      closeOnBackdrop = true,
      closeOnHistoryBack = true,
      maxWidth = "600px",
      zIndex = 1000,
      showHeader = true,
      className,
      style,
    },
    ref
  ) => {
    const [isMounted, setIsMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);

    // closeOnBackdrop 옵션 정규화
    const normalizedOptions =
      typeof closeOnBackdrop === "boolean"
        ? { escapeKey: closeOnBackdrop, clickOutside: closeOnBackdrop }
        : {
            escapeKey: closeOnBackdrop.escapeKey ?? false,
            clickOutside: closeOnBackdrop.clickOutside ?? false,
          };

    // 배경 스크롤 방지 (Sheet 내부만 스크롤 허용)
    useScrollLock({
      enabled: isOpen,
      allowedSelectors: [".taeri-sheet__body"],
    });

    // 히스토리 기반 뒤로가기 제스처로 닫기 (모바일 웹뷰)
    useHistoryClose({ isOpen: isOpen && closeOnHistoryBack, onClose });

    // 외부 클릭으로 닫기
    useClickOutside({
      refs: [sheetRef],
      handler: onClose,
      enabled: isOpen && normalizedOptions.clickOutside,
    });

    // ESC 키로 닫기
    useEscapeKey({
      handler: onClose,
      enabled: isOpen && normalizedOptions.escapeKey,
    });

    // Imperative Handle (ref를 통한 제어)
    useImperativeHandle(ref, () => ({
      open: () => {
        if (onOpen) onOpen();
      },
      close: () => {
        onClose();
      },
    }));

    // hydration mismatch 방지
    useEffect(() => {
      setIsMounted(true);
    }, []);

    // isOpen prop 변경 감지
    useEffect(() => {
      if (isOpen) {
        setShouldRender(true);
        if (onOpen) onOpen();
      } else if (shouldRender) {
        setIsVisible(false);
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, 300); // CSS transition duration과 일치
        return () => clearTimeout(timer);
      }
    }, [isOpen, onOpen, shouldRender]);

    // Opening animation - CSS transition을 활용하기 위해 visible 상태를 지연 적용
    useEffect(() => {
      if (!shouldRender) return;

      // 브라우저가 초기 상태를 렌더링한 후 visible 클래스 추가
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    }, [shouldRender]);

    // Overlay 클릭 핸들러
    const handleOverlayClick = useCallback(
      (e: React.MouseEvent) => {
        if (normalizedOptions.clickOutside && e.target === overlayRef.current) {
          onClose();
        }
      },
      [normalizedOptions.clickOutside, onClose]
    );

    // 마운트되지 않았거나 렌더링 상태가 아니면 렌더링 안 함
    if (!isMounted || !shouldRender) {
      return null;
    }

    const overlayStyle: React.CSSProperties = {
      zIndex,
    };

    const sheetStyle: React.CSSProperties = {
      ...(maxWidth !== "600px" &&
        ({ "--sheet-max-width": maxWidth } as React.CSSProperties)),
      zIndex: zIndex + 1,
      ...style,
    };

    return createPortal(
      <div
        ref={overlayRef}
        className={`taeri-sheet__overlay ${
          isVisible ? "taeri-sheet__overlay--visible" : ""
        } taeri-sheet__overlay--${position}`}
        style={overlayStyle}
        onClick={handleOverlayClick}
        role="presentation"
      >
        <div
          ref={sheetRef}
          className={`taeri-sheet__content taeri-sheet__content--${position} ${
            isVisible ? "taeri-sheet__content--visible" : ""
          } ${className || ""}`}
          style={sheetStyle}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title && showHeader ? "sheet-title" : undefined}
        >
          {/* Header */}
          {showHeader && (
            <div className="taeri-sheet__header">
              <button
                onClick={onClose}
                className="taeri-sheet__back-button"
                aria-label="닫기"
                type="button"
              >
                <svg
                  className="taeri-sheet__chevron"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                {title && (
                  <h2 id="sheet-title" className="taeri-sheet__title">
                    {title}
                  </h2>
                )}
              </button>
            </div>
          )}

          {/* Content */}
          <div className="taeri-sheet__body">{children}</div>
        </div>
      </div>,
      document.body
    );
  }
);

Sheet.displayName = "Sheet";
