import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Slot } from "@/utils/Slot";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useHistoryClose } from "@/hooks/useHistoryClose";
import "./Sheet.css";

/**
 * Sheet 위치 타입
 */
export type SheetPosition = "left" | "right";

/**
 * CloseOnBackdrop 옵션 타입
 */
export type CloseOnBackdropOptions =
  | boolean
  | {
      escapeKey?: boolean;
      clickOutside?: boolean;
    };

// ============================================================================
// Context
// ============================================================================

interface SheetContextValue {
  // State
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;

  // Config
  position: SheetPosition;
  closeOnBackdrop: CloseOnBackdropOptions;
  maxWidth: string;
  zIndex: number;

  // Callbacks
  onOpenChange?: (open: boolean) => void;

  // Refs
  triggerId: string;
  contentId: string;
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
  sheetRef: React.MutableRefObject<HTMLDivElement | null>;

  // History
  isClosingFromHistory: boolean;
}

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("Sheet components must be used within Sheet.Root");
  }
  return context;
}

// ============================================================================
// useControllableState Hook
// ============================================================================

function useControllableState({
  value,
  defaultValue = false,
  onChange,
}: {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (open: boolean) => void;
}) {
  const isControlled = value !== undefined;
  const [internalState, setInternalState] = useState(defaultValue);
  const state = isControlled ? value : internalState;

  const setState = useCallback(
    (nextValue: boolean | ((prev: boolean) => boolean)) => {
      const resolvedValue =
        typeof nextValue === "function" ? nextValue(state) : nextValue;

      if (!isControlled) {
        setInternalState(resolvedValue);
      }
      onChange?.(resolvedValue);
    },
    [isControlled, onChange, state]
  );

  return [state, setState] as const;
}

// ============================================================================
// Root Component
// ============================================================================

interface SheetRootProps {
  children: React.ReactNode;

  // Position & Style
  position?: SheetPosition;
  closeOnBackdrop?: CloseOnBackdropOptions;
  maxWidth?: string;
  zIndex?: number;

  // State Control
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function SheetRoot({
  children,
  position = "right",
  closeOnBackdrop = true,
  maxWidth = "600px",
  zIndex = 1000,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: SheetRootProps) {
  const id = useId().replace(/:/g, "");
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  // 히스토리 기반 뒤로가기 제스처로 닫기 (모바일 웹뷰)
  const isClosingFromHistory = useHistoryClose({
    isOpen: open,
    onClose: () => setOpen(false),
  });

  const contextValue: SheetContextValue = useMemo(
    () => ({
      open,
      setOpen,
      position,
      closeOnBackdrop,
      maxWidth,
      zIndex,
      onOpenChange,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      overlayRef,
      sheetRef,
      isClosingFromHistory,
    }),
    [
      open,
      setOpen,
      position,
      closeOnBackdrop,
      maxWidth,
      zIndex,
      onOpenChange,
      id,
      overlayRef,
      sheetRef,
      isClosingFromHistory,
    ]
  );

  return (
    <SheetContext.Provider value={contextValue}>
      {children}
    </SheetContext.Provider>
  );
}

// ============================================================================
// Trigger Component
// ============================================================================

interface SheetTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

function SheetTrigger({ children, asChild = false }: SheetTriggerProps) {
  const { open, setOpen, triggerId, contentId } = useSheetContext();

  const handleClick = useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  if (asChild) {
    return (
      <Slot
        id={triggerId}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={handleClick}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      id={triggerId}
      type="button"
      aria-expanded={open}
      aria-controls={contentId}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Portal Component
// ============================================================================

interface SheetPortalProps {
  children: React.ReactNode;
  container?: HTMLElement;
}

function SheetPortal({ children, container }: SheetPortalProps) {
  const { open } = useSheetContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !open) {
    return null;
  }

  return createPortal(children, container || document.body);
}

// ============================================================================
// Overlay Component
// ============================================================================

interface SheetOverlayProps {
  className?: string;
  style?: React.CSSProperties;
}

function SheetOverlay({ className = "", style }: SheetOverlayProps) {
  const { open, setOpen, position, closeOnBackdrop, zIndex, overlayRef } =
    useSheetContext();

  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // closeOnBackdrop 옵션 정규화
  const normalizedOptions =
    typeof closeOnBackdrop === "boolean"
      ? { escapeKey: closeOnBackdrop, clickOutside: closeOnBackdrop }
      : {
          escapeKey: closeOnBackdrop.escapeKey ?? false,
          clickOutside: closeOnBackdrop.clickOutside ?? false,
        };

  // isOpen prop 변경 감지
  useEffect(() => {
    if (open) {
      setShouldRender(true);
    } else if (shouldRender) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender]);

  // Opening animation
  useEffect(() => {
    if (!shouldRender || !open) return;

    const rafId1 = requestAnimationFrame(() => {
      const rafId2 = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(rafId2);
    });

    return () => cancelAnimationFrame(rafId1);
  }, [shouldRender, open]);

  // Overlay 클릭 핸들러
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (normalizedOptions.clickOutside && e.target === overlayRef.current) {
        setOpen(false);
      }
    },
    [normalizedOptions.clickOutside, setOpen, overlayRef]
  );

  if (!shouldRender) {
    return null;
  }

  const overlayStyle: React.CSSProperties = {
    zIndex,
    ...style,
  };

  return (
    <div
      ref={overlayRef}
      className={`motile-sheet__overlay ${
        isVisible ? "motile-sheet__overlay--visible" : ""
      } motile-sheet__overlay--${position} ${className}`}
      style={overlayStyle}
      onClick={handleOverlayClick}
      role="presentation"
    />
  );
}

// ============================================================================
// Content Component
// ============================================================================

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function SheetContent({ children, className = "", style }: SheetContentProps) {
  const {
    open,
    setOpen,
    position,
    closeOnBackdrop,
    maxWidth,
    zIndex,
    contentId,
    sheetRef,
    isClosingFromHistory,
  } = useSheetContext();

  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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
    enabled: open,
    allowedSelectors: [".motile-sheet__body"],
  });

  // 외부 클릭으로 닫기
  useClickOutside({
    refs: [sheetRef],
    handler: () => setOpen(false),
    enabled: open && normalizedOptions.clickOutside,
  });

  // ESC 키로 닫기
  useEscapeKey({
    handler: () => setOpen(false),
    enabled: open && normalizedOptions.escapeKey,
  });

  // isOpen prop 변경 감지
  useEffect(() => {
    if (open) {
      setShouldRender(true);
    } else if (shouldRender) {
      setIsVisible(false);
      const closingDuration = isClosingFromHistory ? 0 : 300;
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, closingDuration);
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender, isClosingFromHistory]);

  // Opening animation
  useEffect(() => {
    if (!shouldRender || !open || isClosingFromHistory) return;

    const rafId1 = requestAnimationFrame(() => {
      const rafId2 = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(rafId2);
    });

    return () => cancelAnimationFrame(rafId1);
  }, [shouldRender, open, isClosingFromHistory]);

  if (!shouldRender) {
    return null;
  }

  const sheetStyle: React.CSSProperties = {
    ...(maxWidth !== "600px" &&
      ({ "--sheet-max-width": maxWidth } as React.CSSProperties)),
    zIndex: zIndex + 1,
    ...style,
  };

  return (
    <div
      ref={sheetRef}
      id={contentId}
      className={`motile-sheet__content motile-sheet__content--${position} ${
        isVisible ? "motile-sheet__content--visible" : ""
      } ${className}`}
      style={sheetStyle}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

// ============================================================================
// Header Component
// ============================================================================

interface SheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function SheetHeader({ children, className = "" }: SheetHeaderProps) {
  return <div className={`motile-sheet__header ${className}`}>{children}</div>;
}

// ============================================================================
// Title Component
// ============================================================================

interface SheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

function SheetTitle({ children, className = "" }: SheetTitleProps) {
  return (
    <h2 id="sheet-title" className={`motile-sheet__title ${className}`}>
      {children}
    </h2>
  );
}

// ============================================================================
// Body Component
// ============================================================================

interface SheetBodyProps {
  children: React.ReactNode;
  className?: string;
}

function SheetBody({ children, className = "" }: SheetBodyProps) {
  return <div className={`motile-sheet__body ${className}`}>{children}</div>;
}

// ============================================================================
// Close Component
// ============================================================================

interface SheetCloseProps {
  children: React.ReactElement;
  asChild?: boolean;
}

function SheetClose({ children, asChild = false }: SheetCloseProps) {
  const { setOpen } = useSheetContext();

  const handleClick = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  if (asChild) {
    return (
      <Slot onClick={handleClick} aria-label="닫기">
        {children}
      </Slot>
    );
  }

  return (
    <button onClick={handleClick} aria-label="닫기" type="button">
      {children}
    </button>
  );
}

// ============================================================================
// Export
// ============================================================================

export const Sheet = {
  Root: SheetRoot,
  Trigger: SheetTrigger,
  Portal: SheetPortal,
  Overlay: SheetOverlay,
  Content: SheetContent,
  Header: SheetHeader,
  Title: SheetTitle,
  Body: SheetBody,
  Close: SheetClose,
};

export type {
  SheetRootProps,
  SheetTriggerProps,
  SheetPortalProps,
  SheetOverlayProps,
  SheetContentProps,
  SheetHeaderProps,
  SheetTitleProps,
  SheetBodyProps,
  SheetCloseProps,
};
