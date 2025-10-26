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
import "./Popover.css";
import { Slot } from "@/utils/Slot";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";

type Placement = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";
type PopoverVariant = "default" | "outlined";

// ============================================================================
// Context
// ============================================================================

interface PopoverContextValue {
  // State
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;

  // Config
  position: Placement;
  align: Align;
  variant: PopoverVariant;
  showArrow: boolean;
  zIndex: number;
  color?: string;
  autoClose: boolean;
  bounceCount: number | "infinite";

  // Callbacks
  onOpenChange?: (open: boolean) => void;
  onClickOutside?: (event: PointerEvent) => void;
  onDismiss?: (event: Event) => void;

  // Refs
  triggerId: string;
  contentId: string;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  wrapperRef: React.MutableRefObject<HTMLDivElement | null>;

  // Position
  isPositioned: boolean;
  popoverStyle: React.CSSProperties;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within Popover.Root");
  }
  return context;
}

// ============================================================================
// Utility: throttle
// ============================================================================

function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastTime = 0;

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastTime = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  } as T;
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

interface PopoverRootProps {
  children: React.ReactNode;

  // Position & Style
  position?: Placement;
  align?: Align;
  variant?: PopoverVariant;
  showArrow?: boolean;
  zIndex?: number;
  color?: string;
  bounceCount?: number | "infinite";

  // State Control
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Event Handlers
  onClickOutside?: (event: PointerEvent) => void;
  onDismiss?: (event: Event) => void;
  autoClose?: boolean;
}

function PopoverRoot({
  children,
  position = "top",
  align = "center",
  variant = "outlined",
  showArrow = false,
  zIndex = 10,
  color,
  bounceCount = 0,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onClickOutside,
  onDismiss,
  autoClose = true,
}: PopoverRootProps) {
  const id = useId().replace(/:/g, "");
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const contextValue: PopoverContextValue = useMemo(
    () => ({
      open,
      setOpen,
      position,
      align,
      variant,
      showArrow,
      zIndex,
      color,
      autoClose,
      bounceCount,
      onOpenChange,
      onClickOutside,
      onDismiss,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      triggerRef,
      contentRef,
      wrapperRef,
      isPositioned: false,
      popoverStyle: {},
    }),
    [
      open,
      setOpen,
      position,
      align,
      variant,
      showArrow,
      zIndex,
      color,
      autoClose,
      bounceCount,
      onOpenChange,
      onClickOutside,
      onDismiss,
      id,
      triggerRef,
      contentRef,
      wrapperRef,
    ]
  );

  return (
    <PopoverContext.Provider value={contextValue}>
      <div ref={wrapperRef} className="motile-popover-wrapper">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

// ============================================================================
// Trigger Component
// ============================================================================

interface PopoverTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

function PopoverTrigger({ children, asChild = false }: PopoverTriggerProps) {
  const { open, setOpen, triggerId, contentId, triggerRef } =
    usePopoverContext();

  const handleClick = useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  if (asChild) {
    return (
      <Slot
        ref={(node: HTMLElement | null) => {
          triggerRef.current = node;
        }}
        id={triggerId}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={handleClick}
      >
        {children}
      </Slot>
    );
  }

  // 기본: button으로 래핑
  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
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
// Content Component
// ============================================================================

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function PopoverContent({
  children,
  className = "",
  style,
}: PopoverContentProps) {
  const {
    open,
    setOpen,
    position,
    align,
    variant,
    showArrow,
    zIndex,
    color,
    autoClose,
    bounceCount,
    onClickOutside,
    onDismiss,
    contentId,
    triggerRef,
    contentRef,
    wrapperRef,
  } = usePopoverContext();

  const [isPositioned, setIsPositioned] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  // 위치 계산 함수
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current || !wrapperRef.current)
      return;

    requestAnimationFrame(() => {
      if (!triggerRef.current || !contentRef.current || !wrapperRef.current)
        return;

      const popoverWidth = contentRef.current.offsetWidth;
      const popoverHeight = contentRef.current.offsetHeight;
      const triggerWidth = triggerRef.current.offsetWidth;
      const triggerHeight = triggerRef.current.offsetHeight;

      const trigger = triggerRef.current.getBoundingClientRect();
      const wrapper = wrapperRef.current.getBoundingClientRect();

      const relativeLeft = trigger.left - wrapper.left;
      const relativeTop = trigger.top - wrapper.top;

      let left = 0;
      let top = 0;
      const gap = 8;

      if (position === "top" || position === "bottom") {
        switch (align) {
          case "start":
            left = relativeLeft;
            break;
          case "center":
            left = relativeLeft + triggerWidth / 2;
            break;
          case "end":
            left = relativeLeft + triggerWidth - popoverWidth;
            break;
        }

        if (position === "top") {
          top = relativeTop - popoverHeight - gap;
        } else {
          top = relativeTop + triggerHeight + gap;
        }
      } else {
        switch (align) {
          case "start":
            top = relativeTop;
            break;
          case "center":
            top = relativeTop + triggerHeight / 2;
            break;
          case "end":
            top = relativeTop + triggerHeight - popoverHeight;
            break;
        }

        if (position === "left") {
          left = relativeLeft - popoverWidth - gap;
        } else {
          left = relativeLeft + triggerWidth + gap;
        }
      }

      setPopoverStyle({
        left: `${Math.round(left)}px`,
        top: `${Math.round(top)}px`,
      });
      setIsPositioned(true);
    });
  }, [position, align, triggerRef, contentRef, wrapperRef]);

  // Throttled resize handler (100ms)
  const handleResize = useMemo(
    () => throttle(updatePosition, 100),
    [updatePosition]
  );

  // Position state 초기화
  useEffect(() => {
    if (!open) {
      setIsPositioned(false);
    }
  }, [open]);

  // ESC 키로 닫기
  useEscapeKey({
    handler: useCallback(
      (e: KeyboardEvent) => {
        if (!autoClose) return;
        onDismiss?.(e);
        if (!e.defaultPrevented) {
          setOpen(false);
        }
      },
      [autoClose, onDismiss, setOpen]
    ),
    enabled: open,
  });

  // 외부 클릭으로 닫기
  useClickOutside({
    refs: [wrapperRef],
    handler: useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (!autoClose) return;
        onClickOutside?.(e as PointerEvent);
        onDismiss?.(e);
        if (!e.defaultPrevented) {
          setOpen(false);
        }
      },
      [autoClose, onClickOutside, onDismiss, setOpen]
    ),
    enabled: open,
  });

  // 위치 계산
  useEffect(() => {
    if (
      !open ||
      !triggerRef.current ||
      !contentRef.current ||
      !wrapperRef.current
    )
      return;

    updatePosition();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [open, updatePosition, handleResize]);

  if (!open) return null;

  const hasBounce = bounceCount !== 0;

  return (
    <div
      ref={contentRef}
      id={contentId}
      role="dialog"
      aria-modal="false"
      className={`motile-popover-content motile-popover-content--${variant} ${className}`}
      data-placement={position}
      data-align={align}
      data-positioned={isPositioned}
      data-bounce={hasBounce ? "true" : "false"}
      style={
        {
          ...popoverStyle,
          zIndex,
          ...(color &&
            ({ "--motile-popover-color": color } as React.CSSProperties)),
          "--bounce-count": bounceCount,
          ...style,
        } as React.CSSProperties
      }
    >
      {showArrow && (
        <div
          className="motile-popover-arrow"
          data-placement={position}
          data-align={align}
        />
      )}
      {children}
    </div>
  );
}

// ============================================================================
// Export
// ============================================================================

export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
};

export type {
  PopoverRootProps,
  PopoverTriggerProps,
  PopoverContentProps,
  Placement,
  Align,
  PopoverVariant,
};
