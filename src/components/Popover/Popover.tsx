import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
} from "react";
import "./Popover.css";
import { Slot } from "@/utils/Slot";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { FloatingArrow } from "@/utils/FloatingArrow";

/**
 * Popover 위치
 * - `top`: 위쪽
 * - `bottom`: 아래쪽
 * - `left`: 왼쪽
 * - `right`: 오른쪽
 */
type Placement = "top" | "bottom" | "left" | "right";

/**
 * Popover 정렬 방식
 * - `start`: 시작 (top/bottom일 때 왼쪽, left/right일 때 위)
 * - `center`: 중앙
 * - `end`: 끝 (top/bottom일 때 오른쪽, left/right일 때 아래)
 */
type Align = "start" | "center" | "end";

/**
 * Popover 스타일 variant
 * - `filled`: 채워진 배경 (기본값)
 * - `outlined`: 테두리 스타일
 */
type PopoverVariant = "filled" | "outlined";

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
  const [internalState, setInternalState] = React.useState(defaultValue);
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
  /**
   * Popover 위치
   * @default 'top'
   * @type {'top' | 'bottom' | 'left' | 'right'}
   */
  position?: Placement;
  /**
   * Popover 정렬 방식
   * @default 'center'
   * @type {'start' | 'center' | 'end'}
   */
  align?: Align;
  /**
   * Popover 스타일 variant
   * @default 'filled'
   * @type {'filled' | 'outlined'}
   */
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
  variant = "filled",
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
    contentRef,
    wrapperRef,
  } = usePopoverContext();

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
      data-bounce={hasBounce ? "true" : "false"}
      style={
        {
          zIndex,
          ...(color &&
            ({ "--motile-popover-color": color } as React.CSSProperties)),
          "--bounce-count": bounceCount,
          ...style,
        } as React.CSSProperties
      }
    >
      {showArrow && (
        <FloatingArrow
          className="motile-popover-arrow"
          variant={variant}
          color={
            color ||
            (variant === "filled"
              ? "var(--motile-ui-popover, #3b82f6)"
              : "var(--motile-ui-popover, #e5e7eb)")
          }
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
