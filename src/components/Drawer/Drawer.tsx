import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
import { Slot } from "@/utils/Slot";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import "./Drawer.css";

// ============================================================================
// Types
// ============================================================================

/**
 * 백드롭 인터랙션으로 닫기 옵션
 */
export type CloseOnBackdropOptions =
  | boolean
  | {
      escapeKey?: boolean;
      clickOutside?: boolean;
    };

/**
 * Drawer Context 값
 */
interface DrawerContextValue {
  open: boolean;
  setOpen: (value: boolean) => void;
  closeOnBackdrop: CloseOnBackdropOptions;
  closeOnDrag: boolean;
  maxHeight: string;
  width: string;
  maxWidth?: string;
  zIndex: number;
  drawerRef: React.RefObject<HTMLDivElement>;
  bodyRef: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
  handleClose: () => void;
  handleDragStart: (clientY: number) => void;
  handleDragMove: (clientY: number) => void;
  handleDragEnd: () => void;
}

// ============================================================================
// Context
// ============================================================================

const DrawerContext = createContext<DrawerContextValue | null>(null);

const useDrawerContext = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer components must be used within Drawer.Root");
  }
  return context;
};

// ============================================================================
// Drawer.Root - Context Provider
// ============================================================================

export interface DrawerRootProps {
  children: React.ReactNode;

  /**
   * Drawer 열림/닫힘 상태 (controlled)
   */
  open?: boolean;

  /**
   * Drawer 기본 열림 상태 (uncontrolled)
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * 상태 변경 시 호출되는 콜백
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * 백드롭 인터랙션으로 닫기 허용
   * @default true
   */
  closeOnBackdrop?: CloseOnBackdropOptions;

  /**
   * 드래그로 닫기 허용
   * @default true
   */
  closeOnDrag?: boolean;

  /**
   * Drawer 최대 높이
   * @default '70dvh'
   */
  maxHeight?: string;

  /**
   * Drawer 너비 (데스크톱)
   * @default '480px'
   */
  width?: string;

  /**
   * Drawer 최대 컨테이너 너비 (데스크톱 전용)
   */
  maxWidth?: string;

  /**
   * z-index 값
   * @default 9999
   */
  zIndex?: number;
}

export const DrawerRoot: React.FC<DrawerRootProps> = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeOnBackdrop = true,
  closeOnDrag = true,
  maxHeight = "70dvh",
  width = "480px",
  maxWidth,
  zIndex = 9999,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Drag state
  const startYRef = useRef<number | null>(null);
  const currentYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(defaultOpen);

  // Controlled/Uncontrolled state
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const setOpen = (value: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(value);
    }
    onOpenChange?.(value);
  };

  // closeOnBackdrop 옵션 처리
  const backdropOptions =
    typeof closeOnBackdrop === "boolean"
      ? { escapeKey: closeOnBackdrop, clickOutside: closeOnBackdrop }
      : {
          escapeKey: closeOnBackdrop?.escapeKey ?? false,
          clickOutside: closeOnBackdrop?.clickOutside ?? false,
        };

  // 배경 스크롤 차단
  useScrollLock({
    enabled: open,
    allowedSelectors: ["[data-scroll-allowed]", ".motile-drawer__body"],
  });

  // Open/Close 핸들러
  const handleClose = () => {
    if (!drawerRef.current) {
      setIsVisible(false);
      setTimeout(() => {
        setShouldRender(false);
        setOpen(false);
      }, 300);
      return;
    }

    // Closing animation
    drawerRef.current.style.transition = "transform 0.3s ease";
    drawerRef.current.style.transform = "translateY(100%)";
    setIsVisible(false);

    setTimeout(() => {
      setShouldRender(false);
      setOpen(false);
    }, 300);
  };

  // open prop 변경 감지
  useEffect(() => {
    if (open) {
      setShouldRender(true);
    } else if (shouldRender) {
      handleClose();
    }
  }, [open]);

  // Opening animation
  useEffect(() => {
    if (!shouldRender || !drawerRef.current) return;

    const drawer = drawerRef.current;

    // 초기 상태 (아래로 숨김)
    drawer.style.transition = "none";
    drawer.style.transform = "translateY(100%)";

    // 다음 프레임에 애니메이션 시작
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        drawer.style.transition = "transform 0.3s ease";
        drawer.style.transform = "translateY(0)";
        setIsVisible(true);
      });
    });
  }, [shouldRender]);

  // 외부 클릭으로 닫기
  useClickOutside({
    refs: [drawerRef],
    handler: handleClose,
    enabled: open && backdropOptions.clickOutside,
  });

  // ESC 키로 닫기
  useEscapeKey({
    handler: handleClose,
    enabled: open && backdropOptions.escapeKey,
  });

  // Drag handlers
  const handleDragStart = (clientY: number) => {
    if (!closeOnDrag) return;
    startYRef.current = clientY;
    isDraggingRef.current = false;
  };

  const handleDragMove = (clientY: number) => {
    if (
      !closeOnDrag ||
      !drawerRef.current ||
      startYRef.current === null ||
      !bodyRef.current
    )
      return;

    const deltaY = clientY - startYRef.current;

    // Body가 최상단에 있고 아래로 드래그할 때만 Drawer 이동
    if (bodyRef.current.scrollTop <= 0 && deltaY > 0) {
      isDraggingRef.current = true;
      currentYRef.current = deltaY;
      drawerRef.current.style.transition = "none";
      drawerRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleDragEnd = () => {
    if (!closeOnDrag || !drawerRef.current) return;

    const threshold = window.innerHeight * 0.2;
    drawerRef.current.style.transition = "transform 0.3s ease";

    if (isDraggingRef.current && currentYRef.current > threshold) {
      // 임계값 초과 시 닫기
      handleClose();
    } else {
      // 원위치
      drawerRef.current.style.transform = "translateY(0)";
      currentYRef.current = 0;
    }

    isDraggingRef.current = false;
    startYRef.current = null;
  };

  const contextValue: DrawerContextValue = {
    open: shouldRender,
    setOpen,
    closeOnBackdrop,
    closeOnDrag,
    maxHeight,
    width,
    maxWidth,
    zIndex,
    drawerRef,
    bodyRef,
    isVisible,
    handleClose,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };

  return (
    <DrawerContext.Provider value={contextValue}>
      {children}
    </DrawerContext.Provider>
  );
};

DrawerRoot.displayName = "Drawer.Root";

// ============================================================================
// Drawer.Trigger - 열기 트리거
// ============================================================================

export interface DrawerTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactElement;
  asChild?: boolean;
}

export const DrawerTrigger = forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  ({ children, asChild, onClick, ...props }, ref) => {
    const { setOpen } = useDrawerContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      setOpen(true);
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
      <button type="button" onClick={handleClick} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

DrawerTrigger.displayName = "Drawer.Trigger";

// ============================================================================
// Drawer.Portal - Portal wrapper
// ============================================================================

export interface DrawerPortalProps {
  children: React.ReactNode;
  container?: HTMLElement;
}

export const DrawerPortal: React.FC<DrawerPortalProps> = ({
  children,
  container,
}) => {
  const { open } = useDrawerContext();

  if (!open) return null;

  return createPortal(children, container || document.body);
};

DrawerPortal.displayName = "Drawer.Portal";

// ============================================================================
// Drawer.Overlay - 배경 오버레이
// ============================================================================

export interface DrawerOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DrawerOverlay = forwardRef<HTMLDivElement, DrawerOverlayProps>(
  ({ className, ...props }, ref) => {
    const { isVisible, zIndex } = useDrawerContext();

    return (
      <div
        ref={ref}
        className={`motile-drawer__overlay ${
          isVisible ? "motile-drawer__overlay--visible" : ""
        } ${className || ""}`}
        style={{ zIndex }}
        role="presentation"
        {...props}
      />
    );
  }
);

DrawerOverlay.displayName = "Drawer.Overlay";

// ============================================================================
// Drawer.Content - 메인 컨테이너
// ============================================================================

export interface DrawerContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, style, children, ...props }, ref) => {
    const { drawerRef, isVisible, maxHeight, width, maxWidth, zIndex } =
      useDrawerContext();

    const drawerStyle: React.CSSProperties = {
      ...(maxHeight !== "70dvh" &&
        ({ "--drawer-max-height": maxHeight } as React.CSSProperties)),
      ...(width !== "480px" &&
        ({ "--drawer-width": width } as React.CSSProperties)),
      ...(maxWidth &&
        ({ "--drawer-max-width": maxWidth } as React.CSSProperties)),
      zIndex: zIndex + 1,
      ...style,
    };

    return (
      <div
        ref={(node) => {
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          (drawerRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node;
        }}
        className={`motile-drawer__content ${
          isVisible ? "motile-drawer__content--visible" : ""
        } ${className || ""}`}
        style={drawerStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
      </div>
    );
  }
);

DrawerContent.displayName = "Drawer.Content";

// ============================================================================
// Drawer.Handle - 드래그 핸들
// ============================================================================

export interface DrawerHandleProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DrawerHandle = forwardRef<HTMLDivElement, DrawerHandleProps>(
  ({ className, ...props }, ref) => {
    const { handleDragStart, handleDragMove, handleDragEnd } =
      useDrawerContext();

    const handleTouchStart = (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      handleDragMove(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      handleDragEnd();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      handleDragStart(e.clientY);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        handleDragMove(moveEvent.clientY);
      };

      const handleMouseUp = () => {
        handleDragEnd();
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    return (
      <div
        ref={ref}
        className={`motile-drawer__header ${className || ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        {...props}
      >
        <div className="motile-drawer__handle" aria-hidden="true" />
      </div>
    );
  }
);

DrawerHandle.displayName = "Drawer.Handle";

// ============================================================================
// Drawer.Title - 제목
// ============================================================================

export interface DrawerTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

export const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  ({ children, asChild, className, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return (
        <Slot
          {...props}
          className={`motile-drawer__title ${className || ""}`}
          ref={ref as React.Ref<HTMLElement>}
        >
          {children}
        </Slot>
      );
    }

    return (
      <div className="motile-drawer__title-wrapper">
        <h2
          ref={ref}
          id="motile-drawer-title"
          className={`motile-drawer__title ${className || ""}`}
          {...props}
        >
          {children}
        </h2>
      </div>
    );
  }
);

DrawerTitle.displayName = "Drawer.Title";

// ============================================================================
// Drawer.Body - 스크롤 가능 영역
// ============================================================================

export interface DrawerBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DrawerBody = forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ className, children, ...props }, ref) => {
    const { bodyRef } = useDrawerContext();

    return (
      <div
        ref={(node) => {
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          (bodyRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node;
        }}
        className={`motile-drawer__body ${className || ""}`}
        data-scroll-allowed
        {...props}
      >
        {children}
      </div>
    );
  }
);

DrawerBody.displayName = "Drawer.Body";

// ============================================================================
// Drawer.Close - 닫기 버튼
// ============================================================================

export interface DrawerCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactElement;
  asChild?: boolean;
}

export const DrawerClose = forwardRef<HTMLButtonElement, DrawerCloseProps>(
  ({ children, asChild, onClick, ...props }, ref) => {
    const { handleClose } = useDrawerContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      handleClose();
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
      <button type="button" onClick={handleClick} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

DrawerClose.displayName = "Drawer.Close";

// ============================================================================
// Compound Component Export
// ============================================================================

export const Drawer = {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Portal: DrawerPortal,
  Overlay: DrawerOverlay,
  Content: DrawerContent,
  Handle: DrawerHandle,
  Title: DrawerTitle,
  Body: DrawerBody,
  Close: DrawerClose,
};
