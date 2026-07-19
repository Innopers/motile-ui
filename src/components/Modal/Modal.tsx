import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useHistoryClose } from "@/hooks/useHistoryClose";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Slot } from "@/utils/Slot";

import "./Modal.css";

// ============================================================================
// Types
// ============================================================================

/**
 * Modal variant 타입
 * - `scale`: 중앙에서 확대되며 나타남 (기본값)
 * - `slideDown`: 화면 위에서 중앙으로 떨어지며 나타남
 * - `slideUp`: 화면 아래에서 중앙으로 올라오며 나타남
 * - `bottomSheet`: 화면 하단에서 올라오는 drawer 스타일
 */
type ModalVariant = "scale" | "slideDown" | "slideUp" | "bottomSheet";

/**
 * 백드롭 인터랙션으로 닫기 옵션
 * - boolean: ESC 키와 외부 클릭 모두 제어
 * - object: 각각 독립적으로 제어
 */
export type CloseOnBackdropOptions =
  | boolean
  | {
      /**
       * ESC 키로 닫기 허용
       * @default false (object 사용 시)
       */
      escapeKey?: boolean;
      /**
       * 외부 클릭으로 닫기 허용
       * @default false (object 사용 시)
       */
      clickOutside?: boolean;
    };

interface ModalContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 히스토리 인식 닫기 — enableHistoryClose=true면 history.back(), 아니면 onOpenChange(false) */
  close: () => void;
  /** enableHistoryClose 활성 여부 (backdrop 이중경로 dedup용) */
  enableHistoryClose: boolean;
  titleId: string;
  descriptionId: string;
}

interface ModalRootProps {
  /**
   * Modal 열림/닫힘 상태
   */
  open: boolean;

  /**
   * Modal 상태 변경 핸들러
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Modal 내용
   */
  children: React.ReactNode;

  /**
   * 브라우저 히스토리(뒤로가기 / iOS 스와이프 제스처)로 Modal 닫기 활성화.
   *
   * 옵트인 기능이다. 활성 시 열릴 때 더미 히스토리 항목을 push하고,
   * 브라우저 뒤로가기로 Modal이 닫힌다. 내부적으로 Sheet과 동일한 오버레이
   * 히스토리 레지스트리를 공유하므로 Sheet/Modal 중첩에서도 안전하다.
   *
   * 주의: 열린 상태로 Modal.Root가 언마운트되거나 외부 라우팅(router.push 등)으로
   * 닫히면 정리용 back()이 실행되지 않아 더미 항목이 남을 수 있다(뒤로가기 한 번은 no-op).
   *
   * @default false
   */
  enableHistoryClose?: boolean;
}

interface ModalOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Portal target element (기본값: document.body)
   */
  container?: HTMLElement;

  /**
   * Modal variant
   * - `scale`: 중앙에서 확대되면서 나타남 (기본값)
   * - `slideDown`: 화면 위에서 중앙으로 떨어지며 나타남
   * - `slideUp`: 화면 아래에서 중앙으로 올라오며 나타남
   * - `bottomSheet`: 화면 하단에서 올라오는 drawer 스타일 (모바일 친화적)
   *
   * @default "scale"
   * @type {'scale' | 'slideDown' | 'slideUp' | 'bottomSheet'}
   */
  variant?: ModalVariant;

  /**
   * 백드롭 인터랙션으로 닫기 제어
   *
   * - `true`: 외부 클릭과 ESC 키 모두 허용
   * - `false`: 외부 클릭과 ESC 키 모두 비활성화
   * - `{ escapeKey: true }`: ESC 키만 허용
   * - `{ clickOutside: true }`: 외부 클릭만 허용
   * - `{ escapeKey: true, clickOutside: true }`: 모두 허용 (명시적)
   *
   * @default true
   */
  closeOnBackdrop?: CloseOnBackdropOptions;

  /**
   * 배경 스크롤 잠금 비활성화
   * @default false
   */
  disableScrollLock?: boolean;

  /**
   * Modal 너비
   * - scale, slideDown, slideUp: content 크기에 맞춤 (기본값)
   * - bottomSheet: 데스크톱에서 적용 (모바일은 항상 100%)
   *
   * @default undefined (content 크기에 맞춤)
   *
   * @example
   * // 고정 너비
   * <Modal.Overlay width="500px" />
   *
   * // 퍼센트 너비
   * <Modal.Overlay width="80%" />
   */
  width?: string;

  /**
   * Modal 최대 너비
   *
   * @default undefined
   *
   * @example
   * // 최대 너비 제한
   * <Modal.Overlay maxWidth="600px" />
   *
   * // 레이아웃에 맞추기
   * <Modal.Overlay maxWidth="1024px" />
   */
  maxWidth?: string;

  /**
   * z-index 값
   *
   * @default 1000
   *
   * @example
   * // 다른 오버레이보다 위에 표시
   * <Modal.Overlay zIndex={2000} />
   */
  zIndex?: number;
}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 강제 마운트 (애니메이션용)
   */
  forceMount?: boolean;
}

interface ModalCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 커스텀 자식 요소 사용
   */
  asChild?: boolean;
}

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

// ============================================================================
// Context
// ============================================================================

const ModalContext = createContext<ModalContextValue | null>(null);

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal compound components must be used within Modal.Root");
  }
  return context;
};

// ============================================================================
// Modal.Root - Context Provider (Controlled Component)
// ============================================================================

export const ModalRoot: React.FC<ModalRootProps> = ({
  open,
  onOpenChange,
  children,
  enableHistoryClose = false,
}) => {
  const titleId = useId();
  const descriptionId = useId();

  // 히스토리 기반 뒤로가기 닫기 (옵트인). Sheet과 동일한 훅/레지스트리를 공유한다.
  // Modal은 exit 애니메이션이 없으므로 isClosingFromHistory·navigateAndClose는 쓰지 않는다.
  const { close } = useHistoryClose({
    isOpen: open,
    onClose: () => onOpenChange(false),
    enabled: enableHistoryClose,
  });

  const contextValue = React.useMemo(
    () => ({
      open,
      onOpenChange,
      close,
      enableHistoryClose,
      titleId,
      descriptionId,
    }),
    [open, onOpenChange, close, enableHistoryClose, titleId, descriptionId]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};

// ============================================================================
// Modal.Overlay - Portal + Backdrop + Outside Click Handling
// ============================================================================

export const ModalOverlay = React.forwardRef<HTMLDivElement, ModalOverlayProps>(
  (
    {
      container,
      variant = "scale",
      closeOnBackdrop = true,
      disableScrollLock = false,
      width,
      maxWidth,
      zIndex = 1000,
      className,
      onClick,
      style,
      ...props
    },
    ref
  ) => {
    const { open, onOpenChange, close, enableHistoryClose } = useModalContext();
    const overlayRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    // 클라이언트 마운트 후에만 Portal 렌더링 (SSR hydration 불일치 방지)
    useEffect(() => {
      setMounted(true);
    }, []);

    // closeOnBackdrop 옵션 파싱
    const enableClickOutside =
      typeof closeOnBackdrop === "boolean"
        ? closeOnBackdrop
        : (closeOnBackdrop.clickOutside ?? false);

    const enableEscapeKey =
      typeof closeOnBackdrop === "boolean"
        ? closeOnBackdrop
        : (closeOnBackdrop.escapeKey ?? false);

    // 배경 스크롤 잠금
    useScrollLock({
      enabled: open && !disableScrollLock,
      allowedSelectors: [".motile-modal__content"],
    });

    // Backdrop 클릭 시 닫기
    useClickOutside({
      refs: [overlayRef],
      handler: () => {
        // enableHistoryClose 옵트인 시 mousedown 경로는 끈다.
        // (click 경로 handleClick의 close() 하나만 남겨 backdrop 클릭당 history.back() 1회)
        if (enableClickOutside && !enableHistoryClose) {
          onOpenChange(false);
        }
      },
      enabled: open,
    });

    // ESC 키로 닫기
    // enabled를 정직하게 계산 — 닫히지 않을 모달이 ESC 스택의 top을 점유하지 않게
    useEscapeKey({
      handler: () => {
        if (enableEscapeKey) {
          close();
        }
      },
      enabled: open && enableEscapeKey,
      stacked: true, // 중첩 오버레이에서 ESC는 최상단만 닫는다
    });

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      // Overlay 자체를 클릭한 경우 (자식 요소가 아닌)
      if (e.target === e.currentTarget && enableClickOutside) {
        close();
      }
    };

    // 클라이언트 마운트 전이거나 닫힌 상태면 렌더링 안 함
    if (!mounted || !open) return null;

    // Backdrop style (z-index)
    const backdropStyle: React.CSSProperties = {
      zIndex,
      ...style,
    };

    // Modal width/maxWidth 스타일 (CSS Variables)
    const modalStyle: React.CSSProperties = {
      ...(width && ({ "--modal-width": width } as React.CSSProperties)),
      ...(maxWidth &&
        ({ "--modal-max-width": maxWidth } as React.CSSProperties)),
      zIndex: zIndex + 1,
    };

    const overlayContent = (
      <div
        ref={ref}
        className={`motile-modal__backdrop ${className || ""}`}
        data-state={open ? "open" : "closed"}
        data-variant={variant}
        onClick={handleClick}
        style={backdropStyle}
        {...props}
      >
        <div
          ref={overlayRef}
          className="motile-modal"
          data-variant={variant}
          style={modalStyle}
        >
          {props.children}
        </div>
      </div>
    );

    // Portal을 사용하여 body에 렌더링
    return createPortal(overlayContent, container || document.body);
  }
);

ModalOverlay.displayName = "Modal.Overlay";

// ============================================================================
// Modal.Content - Main Content Container
// ============================================================================

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, forceMount, ...props }, ref) => {
    const { open, titleId, descriptionId } = useModalContext();

    if (!open && !forceMount) return null;

    return (
      <div
        ref={ref}
        className={`motile-modal__content ${className || ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-state={open ? "open" : "closed"}
        {...props}
      />
    );
  }
);

ModalContent.displayName = "Modal.Content";

// ============================================================================
// Modal.Title - Accessible Title
// ============================================================================

export const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => {
    const { titleId } = useModalContext();

    return (
      <h2
        ref={ref}
        id={titleId}
        className={`motile-modal__title ${className || ""}`}
        {...props}
      />
    );
  }
);

ModalTitle.displayName = "Modal.Title";

// ============================================================================
// Modal.Body - Accessible Body Content
// ============================================================================

export const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => {
    const { descriptionId } = useModalContext();

    return (
      <div
        ref={ref}
        id={descriptionId}
        className={`motile-modal__body ${className || ""}`}
        {...props}
      />
    );
  }
);

ModalBody.displayName = "Modal.Body";

// ============================================================================
// Modal.Close - Close Button
// ============================================================================

export const ModalClose = React.forwardRef<HTMLButtonElement, ModalCloseProps>(
  ({ asChild, className, onClick, children, ...props }, ref) => {
    const { close } = useModalContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      close();
    };

    if (asChild) {
      return (
        <Slot
          {...props}
          onClick={handleClick}
          ref={ref as React.Ref<HTMLElement>}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        className={`motile-modal__close ${className || ""}`}
        onClick={handleClick}
        aria-label="닫기"
        {...props}
      >
        {children || (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </button>
    );
  }
);

ModalClose.displayName = "Modal.Close";

// ============================================================================
// Modal.Footer - Footer Container (Optional Utility)
// ============================================================================

export const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`motile-modal__footer ${className || ""}`}
        {...props}
      />
    );
  }
);

ModalFooter.displayName = "Modal.Footer";

// ============================================================================
// Modal.Header - Header Container (Optional Utility)
// ============================================================================

export const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`motile-modal__header ${className || ""}`}
        {...props}
      />
    );
  }
);

ModalHeader.displayName = "Modal.Header";

// ============================================================================
// Compound Component Export
// ============================================================================

export const Modal = {
  Root: ModalRoot,
  Overlay: ModalOverlay,
  Content: ModalContent,
  Title: ModalTitle,
  Body: ModalBody,
  Close: ModalClose,
  Footer: ModalFooter,
  Header: ModalHeader,
};

// ============================================================================
// Type Exports
// ============================================================================

export type {
  ModalBodyProps,
  ModalCloseProps,
  ModalContentProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalOverlayProps,
  ModalRootProps,
  ModalTitleProps,
  ModalVariant,
};
