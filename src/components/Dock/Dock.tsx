import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  forwardRef,
} from "react";
import { Tooltip } from "@/components/Tooltip/Tooltip";
import "./Dock.css";

// ============================================================================
// Types
// ============================================================================

/**
 * Dock 위치
 * - `top`: 화면 상단
 * - `bottom`: 화면 하단 (기본값)
 * - `left`: 화면 왼쪽
 * - `right`: 화면 오른쪽
 */
export type DockPosition = "top" | "bottom" | "left" | "right";

/**
 * Dock Context 값
 */
interface DockContextValue {
  magnification: number;
  mouseX: number | null;
  mouseY: number | null;
  position: DockPosition;
  color?: string;
}

/**
 * Dock Root Props
 */
export interface DockRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 자식 요소
   */
  children: React.ReactNode;

  /**
   * Dock 위치
   * @default "bottom"
   * @type {'top' | 'bottom' | 'left' | 'right'}
   */
  position?: DockPosition;

  /**
   * z-index 값
   * @default 1000
   */
  zIndex?: number;

  /**
   * Glow effect 기본 색상 (모든 Item에 적용)
   * 우선순위: Item.color > Root.color > --motile-ui-dock > --motile-theme > #3b82f6
   * @example '#3b82f6'
   */
  color?: string;
}

/**
 * Dock Item Props
 */
export interface DockItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 아이콘 (ReactNode)
   */
  icon?: React.ReactNode;

  /**
   * 라벨 (툴팁)
   */
  label?: string;

  /**
   * 커스텀 자식 요소 사용
   */
  asChild?: boolean;

  /**
   * Glow effect 개별 색상 (Root.color를 override)
   * 우선순위: Item.color > Root.color > --motile-ui-dock > --motile-theme > #3b82f6
   * @example '#3b82f6'
   */
  color?: string;
}

// ============================================================================
// Context
// ============================================================================

const DockContext = createContext<DockContextValue | null>(null);

const useDockContext = () => {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error("Dock compound components must be used within Dock.Root");
  }
  return context;
};

// ============================================================================
// Dock.Root - Main Container
// ============================================================================

export const DockRoot = forwardRef<HTMLDivElement, DockRootProps>(
  (
    {
      position = "bottom",
      zIndex = 1000,
      color,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const [mouseX, setMouseX] = useState<number | null>(null);
    const [mouseY, setMouseY] = useState<number | null>(null);
    const dockRef = useRef<HTMLDivElement>(null);

    // magnification 고정값 1.7
    const magnification = 1.7;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    const handleMouseLeave = () => {
      setMouseX(null);
      setMouseY(null);
    };

    const contextValue = React.useMemo(
      () => ({
        magnification,
        mouseX,
        mouseY,
        position,
        color,
      }),
      [magnification, mouseX, mouseY, position, color]
    );

    return (
      <DockContext.Provider value={contextValue}>
        <div
          ref={(node) => {
            // Handle both refs
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            (dockRef as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          }}
          className={`motile-dock ${className || ""}`}
          data-position={position}
          style={{ ...style, zIndex }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          {children}
        </div>
      </DockContext.Provider>
    );
  }
);

DockRoot.displayName = "Dock.Root";

// ============================================================================
// Dock.Item - Individual Dock Item
// ============================================================================

export const DockItem = forwardRef<HTMLButtonElement, DockItemProps>(
  (
    { icon, label, asChild, color, className, children, style, ...props },
    ref
  ) => {
    const {
      magnification,
      mouseX,
      mouseY,
      position,
      color: rootColor,
    } = useDockContext();
    const itemRef = useRef<HTMLButtonElement>(null);
    const rafRef = useRef<number>();

    // 우선순위: Item color > Root color
    const finalColor = color || rootColor;

    useEffect(() => {
      if (!itemRef.current) return;

      // 터치 기기에서는 magnification 비활성화
      const isTouchDevice = window.matchMedia(
        "(hover: none) and (pointer: coarse)"
      ).matches;
      if (isTouchDevice) return;

      const updateScale = () => {
        if (!itemRef.current) return;

        if (mouseX !== null && mouseY !== null) {
          const rect = itemRef.current.getBoundingClientRect();

          // position에 따라 거리 계산 방향 변경
          let distance: number;
          if (position === "top" || position === "bottom") {
            // top, bottom: X축 거리 (가로 배치)
            const itemCenterX = rect.left + rect.width / 2;
            distance = Math.abs(mouseX - itemCenterX);
          } else {
            // left, right: Y축 거리 (세로 배치)
            const itemCenterY = rect.top + rect.height / 2;
            distance = Math.abs(mouseY - itemCenterY);
          }

          // 거리에 따른 scale 계산 (exponential falloff)
          const maxDistance = 100; // 영향 범위 축소
          const distanceRatio = Math.max(0, 1 - distance / maxDistance);
          // 제곱을 적용하여 falloff를 더 급격하게
          const exponentialRatio = distanceRatio * distanceRatio;
          const scaleValue = 1 + (magnification - 1) * exponentialRatio;

          // DOM 직접 조작 - React 리렌더링 우회
          itemRef.current.style.transform = `scale(${scaleValue})`;
        } else {
          // 마우스가 Dock 밖으로 나감
          itemRef.current.style.transform = "scale(1)";
        }
      };

      // 마우스 이동 시 RAF 한 번만 호출
      rafRef.current = requestAnimationFrame(updateScale);

      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }, [mouseX, mouseY, magnification, position]);

    // position에 따라 tooltip 방향 결정
    const tooltipPosition =
      position === "top"
        ? "bottom"
        : position === "bottom"
        ? "top"
        : position === "left"
        ? "right"
        : "left";

    // CSS 변수로 색상 전달
    const customStyle = {
      ...style,
      ...(finalColor &&
        ({ "--motile-dock-color": finalColor } as React.CSSProperties)),
    };

    // asChild 패턴 처리
    if (asChild && React.isValidElement(children)) {
      const element = React.cloneElement(children as React.ReactElement, {
        ref: (node: HTMLElement | null) => {
          if (typeof ref === "function") {
            ref(node as HTMLButtonElement);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
              node as HTMLButtonElement;
          }
          (
            itemRef as React.MutableRefObject<HTMLButtonElement | null>
          ).current = node as HTMLButtonElement;
        },
        className: `motile-dock__item ${className || ""}`,
        style: customStyle,
        "aria-label": label,
      });

      // label이 있으면 Tooltip으로 감싸기
      if (label) {
        return (
          <Tooltip.Root position={tooltipPosition} showArrow={true}>
            <Tooltip.Trigger>{element}</Tooltip.Trigger>
            <Tooltip.Content>{label}</Tooltip.Content>
          </Tooltip.Root>
        );
      }

      return element;
    }

    // 일반 button 렌더링
    const button = (
      <button
        ref={(node) => {
          // Handle both refs
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          (
            itemRef as React.MutableRefObject<HTMLButtonElement | null>
          ).current = node;
        }}
        type="button"
        className={`motile-dock__item ${className || ""}`}
        style={customStyle}
        aria-label={label}
        {...props}
      >
        {icon || children}
      </button>
    );

    // label이 있으면 Tooltip으로 감싸기
    if (label) {
      return (
        <Tooltip.Root position={tooltipPosition} showArrow={true}>
          <Tooltip.Trigger>{button}</Tooltip.Trigger>
          <Tooltip.Content>{label}</Tooltip.Content>
        </Tooltip.Root>
      );
    }

    return button;
  }
);

DockItem.displayName = "Dock.Item";

// ============================================================================
// Dock.Separator - Divider between items
// ============================================================================

export interface DockSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DockSeparator = forwardRef<HTMLDivElement, DockSeparatorProps>(
  ({ className, ...props }, ref) => {
    const { position } = useDockContext();

    return (
      <div
        ref={ref}
        className={`motile-dock__separator ${className || ""}`}
        data-position={position}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

DockSeparator.displayName = "Dock.Separator";

// ============================================================================
// Compound Component Export
// ============================================================================

export const Dock = {
  Root: DockRoot,
  Item: DockItem,
  Separator: DockSeparator,
};
