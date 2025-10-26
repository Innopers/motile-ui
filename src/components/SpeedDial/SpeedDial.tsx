import React, {
  createContext,
  useContext,
  useRef,
  useId,
  forwardRef,
} from "react";
import { Slot } from "@/utils/Slot";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import "./SpeedDial.css";

// ============================================================================
// Types
// ============================================================================

/**
 * SpeedDial 방향
 */
export type SpeedDialDirection = "up" | "down" | "left" | "right";

/**
 * SpeedDial Context 값
 */
interface SpeedDialContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: SpeedDialDirection;
  triggerId: string;
}

/**
 * SpeedDial Root Props
 */
export interface SpeedDialRootProps {
  /**
   * SpeedDial 열림/닫힘 상태
   */
  open: boolean;

  /**
   * SpeedDial 상태 변경 핸들러
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Actions가 나타나는 방향
   * @default "up"
   */
  direction?: SpeedDialDirection;

  /**
   * Trigger 버튼 배경 색상 (우선순위 1)
   * @example '#10b981'
   */
  color?: string;

  /**
   * 외부 클릭 시 자동으로 닫기
   * @default true
   */
  closeOnClickOutside?: boolean;

  /**
   * ESC 키로 닫기
   * @default true
   */
  closeOnEscapeKey?: boolean;

  /**
   * 자식 요소
   */
  children: React.ReactNode;
}

/**
 * SpeedDial Trigger Props
 */
export interface SpeedDialTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 자식 요소
   */
  children: React.ReactNode;

  /**
   * Slot 패턴 활성화 (자식을 루트 요소로 렌더링)
   * @default false
   */
  asChild?: boolean;
}

/**
 * SpeedDial Actions Props
 */
export interface SpeedDialActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 자식 요소
   */
  children: React.ReactNode;
}

/**
 * SpeedDial Action Props
 */
export interface SpeedDialActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 자식 요소
   */
  children: React.ReactNode;

  /**
   * Slot 패턴 활성화 (자식을 루트 요소로 렌더링)
   * @default false
   */
  asChild?: boolean;
}

// ============================================================================
// Context
// ============================================================================

const SpeedDialContext = createContext<SpeedDialContextValue | null>(null);

const useSpeedDialContext = () => {
  const context = useContext(SpeedDialContext);
  if (!context) {
    throw new Error(
      "SpeedDial compound components must be used within SpeedDial.Root"
    );
  }
  return context;
};

// ============================================================================
// SpeedDial.Root - Context Provider
// ============================================================================

export const SpeedDialRoot: React.FC<SpeedDialRootProps> = ({
  open,
  onOpenChange,
  direction = "up",
  color,
  closeOnClickOutside = true,
  closeOnEscapeKey = true,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();

  // 외부 클릭 감지
  useClickOutside({
    refs: [containerRef],
    handler: () => {
      if (closeOnClickOutside) {
        onOpenChange(false);
      }
    },
    enabled: open,
  });

  // ESC 키로 닫기
  useEscapeKey({
    handler: () => {
      if (closeOnEscapeKey) {
        onOpenChange(false);
      }
    },
    enabled: open,
  });

  const contextValue = React.useMemo(
    () => ({
      open,
      onOpenChange,
      direction,
      triggerId,
    }),
    [open, onOpenChange, direction, triggerId]
  );

  // CSS 변수로 색상 전달
  const containerStyle = color
    ? ({ "--motile-speeddial-color": color } as React.CSSProperties)
    : undefined;

  return (
    <SpeedDialContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className="motile-speed-dial"
        style={containerStyle}
      >
        {children}
      </div>
    </SpeedDialContext.Provider>
  );
};

// ============================================================================
// SpeedDial.Trigger - 메인 버튼
// ============================================================================

export const SpeedDialTrigger = forwardRef<
  HTMLButtonElement,
  SpeedDialTriggerProps
>(({ className, onClick, children, asChild = false, ...props }, ref) => {
  const { open, onOpenChange, triggerId } = useSpeedDialContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      onOpenChange(!open);
    }
  };

  if (asChild) {
    return (
      <Slot
        ref={ref}
        id={triggerId}
        className={
          className
            ? `motile-speed-dial__trigger ${className}`
            : "motile-speed-dial__trigger"
        }
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={handleClick}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      id={triggerId}
      className={
        className
          ? `motile-speed-dial__trigger ${className}`
          : "motile-speed-dial__trigger"
      }
      aria-expanded={open}
      aria-haspopup="menu"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});

SpeedDialTrigger.displayName = "SpeedDial.Trigger";

// ============================================================================
// SpeedDial.Actions - Actions 컨테이너
// ============================================================================

export const SpeedDialActions = forwardRef<
  HTMLDivElement,
  SpeedDialActionsProps
>(({ className, children, ...props }, ref) => {
  const { open, direction, triggerId } = useSpeedDialContext();

  if (!open) return null;

  // children에 --action-index CSS variable 주입
  const childrenWithIndex = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        style: {
          "--action-index": index,
          ...((child.props as any).style || {}),
        } as React.CSSProperties,
      });
    }
    return child;
  });

  return (
    <div
      ref={ref}
      role="menu"
      aria-labelledby={triggerId}
      className={
        className
          ? `motile-speed-dial__actions ${className}`
          : "motile-speed-dial__actions"
      }
      data-direction={direction}
      {...props}
    >
      {childrenWithIndex}
    </div>
  );
});

SpeedDialActions.displayName = "SpeedDial.Actions";

// ============================================================================
// SpeedDial.Action - 개별 Action 버튼
// ============================================================================

export const SpeedDialAction = forwardRef<
  HTMLButtonElement,
  SpeedDialActionProps
>(({ className, onClick, children, asChild = false, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
  };

  if (asChild) {
    return (
      <Slot
        ref={ref}
        role="menuitem"
        className={
          className
            ? `motile-speed-dial__action ${className}`
            : "motile-speed-dial__action"
        }
        onClick={handleClick}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      className={
        className
          ? `motile-speed-dial__action ${className}`
          : "motile-speed-dial__action"
      }
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});

SpeedDialAction.displayName = "SpeedDial.Action";

// ============================================================================
// Compound Component Export
// ============================================================================

export const SpeedDial = {
  Root: SpeedDialRoot,
  Trigger: SpeedDialTrigger,
  Actions: SpeedDialActions,
  Action: SpeedDialAction,
};
