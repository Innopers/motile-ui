import React, {
  useEffect,
  useRef,
  useId,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useScrollLock } from "../../hooks/useScrollLock";
import "./Modal.css";

// ============================================================================
// Types
// ============================================================================

/**
 * Modal variant 타입
 */
type ModalVariant = "scale";

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
}

interface ModalOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Portal target element (기본값: document.body)
   */
  container?: HTMLElement;

  /**
   * Modal variant
   * - `scale`: 확대되면서 나타남 (기본값)
   *
   * @default "scale"
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
}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 강제 마운트 (애니메이션용)
   */
  forceMount?: boolean;
}

interface ModalCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 커스텀 자식 요소 사용
   */
  asChild?: boolean;
}

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface ModalDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

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
}) => {
  const titleId = useId();
  const descriptionId = useId();

  const contextValue = React.useMemo(
    () => ({
      open,
      onOpenChange,
      titleId,
      descriptionId,
    }),
    [open, onOpenChange, titleId, descriptionId]
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
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const { open, onOpenChange } = useModalContext();
    const overlayRef = useRef<HTMLDivElement>(null);

    // closeOnBackdrop 옵션 파싱
    const enableClickOutside =
      typeof closeOnBackdrop === "boolean"
        ? closeOnBackdrop
        : closeOnBackdrop.clickOutside ?? false;

    const enableEscapeKey =
      typeof closeOnBackdrop === "boolean"
        ? closeOnBackdrop
        : closeOnBackdrop.escapeKey ?? false;

    // 배경 스크롤 잠금
    useScrollLock({
      enabled: open && !disableScrollLock,
      allowedSelectors: [".taeri-modal__content"],
    });

    // Backdrop 클릭 시 닫기
    useClickOutside({
      refs: [overlayRef],
      handler: () => {
        if (enableClickOutside) {
          onOpenChange(false);
        }
      },
      enabled: open,
    });

    // ESC 키로 닫기
    useEscapeKey({
      handler: () => {
        if (enableEscapeKey) {
          onOpenChange(false);
        }
      },
      enabled: open,
    });

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      // Overlay 자체를 클릭한 경우 (자식 요소가 아닌)
      if (e.target === e.currentTarget && enableClickOutside) {
        onOpenChange(false);
      }
    };

    if (!open) return null;

    const overlayContent = (
      <div
        ref={ref}
        className={`taeri-modal__backdrop ${className || ""}`}
        data-state={open ? "open" : "closed"}
        data-variant={variant}
        onClick={handleClick}
        {...props}
      >
        <div ref={overlayRef} className="taeri-modal" data-variant={variant}>
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
    const contentRef = useRef<HTMLDivElement>(null);

    // 포커스 트랩 (Modal이 열릴 때 첫 번째 포커스 가능한 요소에 포커스)
    useEffect(() => {
      if (open && contentRef.current) {
        const focusableElements = contentRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        }
      }
    }, [open]);

    if (!open && !forceMount) return null;

    return (
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === "function") ref(node);
            else ref.current = node;
          }
          if (node) {
            (contentRef as React.MutableRefObject<HTMLDivElement>).current =
              node;
          }
        }}
        className={`taeri-modal__content ${className || ""}`}
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
        className={`taeri-modal__title ${className || ""}`}
        {...props}
      />
    );
  }
);

ModalTitle.displayName = "Modal.Title";

// ============================================================================
// Modal.Description - Accessible Description
// ============================================================================

export const ModalDescription = React.forwardRef<
  HTMLDivElement,
  ModalDescriptionProps
>(({ className, ...props }, ref) => {
  const { descriptionId } = useModalContext();

  return (
    <div
      ref={ref}
      id={descriptionId}
      className={`taeri-modal__body ${className || ""}`}
      {...props}
    />
  );
});

ModalDescription.displayName = "Modal.Description";

// ============================================================================
// Modal.Close - Close Button
// ============================================================================

export const ModalClose = React.forwardRef<HTMLButtonElement, ModalCloseProps>(
  ({ asChild, className, onClick, ...props }, ref) => {
    const { onOpenChange } = useModalContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onOpenChange(false);
    };

    if (asChild && React.isValidElement(props.children)) {
      return React.cloneElement(props.children as React.ReactElement, {
        onClick: handleClick,
      });
    }

    return (
      <button
        ref={ref}
        type="button"
        className={`taeri-modal__close ${className || ""}`}
        onClick={handleClick}
        aria-label="닫기"
        {...props}
      >
        {props.children || (
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
        className={`taeri-modal__footer ${className || ""}`}
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
        className={`taeri-modal__header ${className || ""}`}
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
  Description: ModalDescription,
  Close: ModalClose,
  Footer: ModalFooter,
  Header: ModalHeader,
};

// ============================================================================
// Type Exports
// ============================================================================

export type {
  ModalVariant,
  ModalRootProps,
  ModalOverlayProps,
  ModalContentProps,
  ModalCloseProps,
  ModalTitleProps,
  ModalDescriptionProps,
  ModalHeaderProps,
  ModalFooterProps,
};
