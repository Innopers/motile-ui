import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Slot } from "@/utils/Slot";
import { FloatingArrow } from "@/utils/FloatingArrow";
import "./Tooltip.css";

/**
 * 툴팁 스타일 variant
 * - `filled`: 채워진 배경 (기본값)
 * - `outlined`: 테두리 스타일
 */
type TooltipVariant = "filled" | "outlined";

/**
 * 툴팁 위치
 * - `top`: 위쪽
 * - `bottom`: 아래쪽
 * - `left`: 왼쪽
 * - `right`: 오른쪽
 */
type TooltipPosition = "top" | "bottom" | "left" | "right";

/**
 * 툴팁 정렬 방식
 * - `start`: 시작 (top/bottom일 때 왼쪽, left/right일 때 위)
 * - `center`: 중앙
 * - `end`: 끝 (top/bottom일 때 오른쪽, left/right일 때 아래)
 */
type TooltipAlign = "start" | "center" | "end";

// ============================================================================
// Context
// ============================================================================

interface TooltipContextValue {
  // State
  open: boolean;
  setOpen: (value: boolean, delay?: number) => void;

  // Config
  position: TooltipPosition;
  align: TooltipAlign;
  variant: TooltipVariant;
  showArrow: boolean;
  color?: string;
  keepOpen: boolean;

  // Refs
  tooltipId: string;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;

  // Position
  style: React.CSSProperties;
  placement: TooltipPosition;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within Tooltip.Root");
  }
  return context;
}

// ============================================================================
// Root Component
// ============================================================================

interface TooltipRootProps {
  children: React.ReactNode;
  /**
   * 툴팁 위치
   * @default 'top'
   * @type {'top' | 'bottom' | 'left' | 'right'}
   */
  position?: TooltipPosition;
  /**
   * 툴팁 정렬 방식
   * - top/bottom일 때: start(왼쪽), center(중앙), end(오른쪽)
   * - left/right일 때: start(위), center(중앙), end(아래)
   * @default 'center'
   * @type {'start' | 'center' | 'end'}
   */
  align?: TooltipAlign;
  /**
   * 툴팁 스타일 variant
   * @default 'filled'
   * @type {'filled' | 'outlined'}
   */
  variant?: TooltipVariant;
  /**
   * 툴팁 배경 색상 (우선순위 1)
   * @example '#3b82f6'
   */
  color?: string;
  /**
   * 화살표 표시 여부
   * @default false
   */
  showArrow?: boolean;
  /**
   * Content에 hover해도 툴팁이 닫히지 않도록 유지 (버튼 클릭 등 인터랙션 가능)
   * @default false
   */
  keepOpen?: boolean;
  /**
   * 툴팁과 트리거 사이의 간격 (px)
   * - number: 모든 방향 동일하게 적용
   * - object: 방향별 개별 설정 가능
   * @default top: 7, bottom: 6, left: 6, right: 6
   * @example
   * offset={8}
   * offset={{ top: 7, bottom: 6, left: 6, right: 6 }}
   */
  offset?:
    | number
    | {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
      };
}

const MARGIN = 8;

// ============================================================================
// Positioning Helper Functions
// ============================================================================

/**
 * 툴팁 offset 값 타입
 */
interface OffsetValue {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * 특정 위치에 툴팁을 배치할 공간이 충분한지 확인
 * @param position - 확인할 위치 (top, bottom, left, right)
 * @param trigger - 트리거 요소의 위치 정보
 * @param tooltipWidth - 툴팁 너비
 * @param tooltipHeight - 툴팁 높이
 * @param offset - 툴팁과 트리거 사이의 간격
 * @param viewportWidth - 뷰포트 너비
 * @param viewportHeight - 뷰포트 높이
 * @returns 공간이 충분하면 true, 부족하면 false
 */
function hasSpace(
  position: TooltipPosition,
  trigger: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  offset: OffsetValue,
  viewportWidth: number,
  viewportHeight: number
): boolean {
  switch (position) {
    case "top":
      return trigger.top - offset.top - tooltipHeight >= MARGIN;
    case "bottom":
      return (
        trigger.bottom + offset.bottom + tooltipHeight <=
        viewportHeight - MARGIN
      );
    case "left":
      return trigger.left - offset.left - tooltipWidth >= MARGIN;
    case "right":
      return (
        trigger.right + offset.right + tooltipWidth <= viewportWidth - MARGIN
      );
  }
}

/**
 * 데스크톱 환경에서의 fallback 위치 결정 (반대편 우선)
 * @param preferred - 선호하는 위치
 * @returns fallback 위치 배열
 */
function getDesktopFallbacks(preferred: TooltipPosition): TooltipPosition[] {
  const opposites: Record<TooltipPosition, TooltipPosition> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };

  return [opposites[preferred]];
}

/**
 * 스마트 fallback 위치 결정 (뷰포트 크기와 트리거 위치 고려)
 * @param preferred - 선호하는 위치
 * @param trigger - 트리거 요소의 위치 정보
 * @param viewportWidth - 뷰포트 너비
 * @param viewportHeight - 뷰포트 높이
 * @returns 시도할 fallback 위치 배열 (우선순위 순서)
 */
function getSmartFallbacks(
  preferred: TooltipPosition,
  trigger: DOMRect,
  viewportWidth: number,
  viewportHeight: number
): TooltipPosition[] {
  // 모바일 여부 판단 (768px 미만)
  const isMobile = viewportWidth < 768;

  // 데스크톱: 기존 로직 유지 (반대편만 시도)
  if (!isMobile) {
    return getDesktopFallbacks(preferred);
  }

  // 모바일: 축 전환 우선
  // 트리거가 화면 상단/하단 중 어디에 가까운지 판단
  const triggerCenterY = trigger.top + trigger.height / 2;
  const isUpperHalf = triggerCenterY < viewportHeight / 2;

  if (preferred === "left" || preferred === "right") {
    // 수평 위치 → 수직 위치로 전환 (모바일에서 수직이 더 안전)
    const verticalPreferred = isUpperHalf ? "bottom" : "top";
    const verticalAlternative = isUpperHalf ? "top" : "bottom";
    const horizontalOpposite = preferred === "left" ? "right" : "left";

    // 우선순위: 1) 공간 많은 수직 2) 다른 수직 3) 반대편 수평 (최후의 수단)
    return [verticalPreferred, verticalAlternative, horizontalOpposite];
  }

  if (preferred === "top" || preferred === "bottom") {
    // 수직 위치 → 반대편 수직 시도 (모바일에서도 수직이 안전)
    const opposite = preferred === "top" ? "bottom" : "top";
    return [opposite];
  }

  return [];
}

/**
 * 모든 위치가 맞지 않을 때 가장 큰 공간을 가진 위치 선택
 * @param trigger - 트리거 요소의 위치 정보
 * @param offset - 툴팁과 트리거 사이의 간격
 * @param viewportWidth - 뷰포트 너비
 * @param viewportHeight - 뷰포트 높이
 * @returns 가장 많은 공간이 있는 위치
 */
function getBestFitPosition(
  trigger: DOMRect,
  offset: OffsetValue,
  viewportWidth: number,
  viewportHeight: number
): TooltipPosition {
  // 각 방향의 사용 가능한 공간 계산
  const spaces = {
    top: trigger.top - offset.top - MARGIN,
    bottom: viewportHeight - trigger.bottom - offset.bottom - MARGIN,
    left: trigger.left - offset.left - MARGIN,
    right: viewportWidth - trigger.right - offset.right - MARGIN,
  };

  // 가장 큰 공간을 가진 위치 선택
  let bestPosition: TooltipPosition = "bottom";
  let maxSpace = spaces.bottom;

  for (const [pos, space] of Object.entries(spaces)) {
    if (space > maxSpace) {
      maxSpace = space;
      bestPosition = pos as TooltipPosition;
    }
  }

  return bestPosition;
}

function TooltipRoot({
  children,
  position = "top",
  align = "center",
  variant = "filled",
  color,
  showArrow = false,
  keepOpen = false,
  offset,
}: TooltipRootProps) {
  // offset 정규화 (number → object 변환)
  const offsetValue =
    offset === undefined
      ? { top: 7, bottom: 6, left: 6, right: 6 } // 기본값: top은 7, left는 6px (화살표에 더 가깝게)
      : typeof offset === "number"
      ? { top: offset, bottom: offset, left: offset, right: offset }
      : {
          top: offset.top ?? 7,
          bottom: offset.bottom ?? 6,
          left: offset.left ?? 6,
          right: offset.right ?? 6,
        };

  const id = useId().replace(/:/g, "");
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<number>();

  const [open, setOpenState] = useState(false);
  const [placement, setPlacement] = useState(position);
  const [style, setStyle] = useState<React.CSSProperties>({});

  // rAF 스로틀링을 위한 ref
  const rafIdRef = useRef<number | null>(null);

  // setOpen with optional delay
  const setOpen = useCallback((value: boolean, delay: number = 0) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = undefined;
    }

    if (!value && delay > 0) {
      closeTimeoutRef.current = window.setTimeout(
        () => setOpenState(false),
        delay
      );
    } else {
      setOpenState(value);
    }
  }, []);

  // 위치 계산 및 업데이트 (paint 전에 실행하여 튐 방지)
  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return;

      const trigger = triggerRef.current.getBoundingClientRect();
      const bubble = contentRef.current;

      // 임시로 보이지 않게 해서 자연스러운 크기 측정
      bubble.classList.add("measuring");

      // 측정 전 레이아웃 플러시 강제 실행
      bubble.offsetHeight;

      // 정확한 크기 측정을 위해 getComputedStyle 사용
      const computedStyle = window.getComputedStyle(bubble);
      const originalWidth = parseFloat(computedStyle.width);
      const originalHeight = parseFloat(computedStyle.height);

      let bw = originalWidth;
      let bh = originalHeight;

      bubble.classList.remove("measuring");

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // NaN 방어 (JSDOM 등 테스트 환경에서 발생 가능)
      if (isNaN(bw) || bw <= 0) bw = 100;
      if (isNaN(bh) || bh <= 0) bh = 50;

      // 뷰포트보다 크면 제한
      const maxW = vw - MARGIN * 2;
      const maxH = vh - MARGIN * 2;
      if (bw > maxW) bw = maxW;
      if (bh > maxH) bh = maxH;

      // 위치 자동 조정 (스마트 fallback)
      let finalPlacement: TooltipPosition = position;

      // 테스트 환경 감지: trigger 크기가 0이면 fallback 로직 스킵
      const isTestEnvironment = trigger.width === 0 && trigger.height === 0;

      // 1단계: 선호하는 위치에 공간이 있는지 확인
      if (
        isTestEnvironment ||
        hasSpace(position, trigger, bw, bh, offsetValue, vw, vh)
      ) {
        finalPlacement = position;
      } else {
        // 2단계: 스마트 fallback 시도 (모바일/데스크톱 자동 감지)
        const fallbacks = getSmartFallbacks(position, trigger, vw, vh);
        let found = false;

        for (const fallbackPosition of fallbacks) {
          if (
            hasSpace(fallbackPosition, trigger, bw, bh, offsetValue, vw, vh)
          ) {
            finalPlacement = fallbackPosition;
            found = true;
            break; // 첫 번째 적합한 위치에서 조기 종료
          }
        }

        // 3단계: 모든 fallback 실패 시 가장 큰 공간을 가진 위치 선택
        if (!found) {
          finalPlacement = getBestFitPosition(trigger, offsetValue, vw, vh);
        }
      }

      // 좌표 계산
      let left = 0;
      let top = 0;

      if (finalPlacement === "top" || finalPlacement === "bottom") {
        // 수평: align에 따른 정렬
        switch (align) {
          case "start":
            left = trigger.left;
            break;
          case "center":
            left = trigger.left + trigger.width / 2 - bw / 2;
            break;
          case "end":
            left = trigger.right - bw;
            break;
        }
        left = Math.max(MARGIN, Math.min(left, vw - MARGIN - bw));

        // 수직: 트리거 위/아래 배치
        top =
          finalPlacement === "top"
            ? trigger.top - offsetValue.top - bh
            : trigger.bottom + offsetValue.bottom;
        top = Math.max(MARGIN, Math.min(top, vh - MARGIN - bh));
      } else {
        // left/right placement
        // 수직: align에 따른 정렬
        switch (align) {
          case "start":
            top = trigger.top;
            break;
          case "center":
            top = trigger.top + trigger.height / 2 - bh / 2;
            break;
          case "end":
            top = trigger.bottom - bh;
            break;
        }
        top = Math.max(MARGIN, Math.min(top, vh - MARGIN - bh));

        // 수평: 트리거 좌/우 배치 (width 조정으로 여백 확보)
        if (finalPlacement === "left") {
          left = trigger.left - offsetValue.left - bw;
          // 왼쪽 여백 부족 시 width 줄이기
          if (left < MARGIN) {
            bw = trigger.left - offsetValue.left - MARGIN;
            left = MARGIN;
          }
        } else {
          // right
          left = trigger.right + offsetValue.right;
          // 오른쪽 여백 부족 시 width 줄이기
          if (left + bw > vw - MARGIN) {
            bw = vw - MARGIN - left;
          }
        }
      }

      // Arrow 위치 계산 (trigger 기준)
      let arrowOffset = 0;
      const ARROW_SIZE = 12; // arrow width/height
      const MIN_ARROW_OFFSET = 16; // tooltip 가장자리에서 최소 거리

      if (finalPlacement === "left" || finalPlacement === "right") {
        // 수평 위치: arrow의 top 계산
        switch (align) {
          case "start":
            arrowOffset = trigger.top - top + ARROW_SIZE;
            break;
          case "center":
            arrowOffset = trigger.top + trigger.height / 2 - top;
            break;
          case "end":
            arrowOffset = trigger.bottom - top - ARROW_SIZE;
            break;
        }
        // 경계 처리: tooltip 안에 유지
        const maxOffsetY = Math.max(MIN_ARROW_OFFSET, bh - MIN_ARROW_OFFSET);
        arrowOffset = Math.max(
          MIN_ARROW_OFFSET,
          Math.min(arrowOffset, maxOffsetY)
        );
      } else {
        // 수직 위치: arrow의 left 계산
        switch (align) {
          case "start":
            arrowOffset = trigger.left - left + ARROW_SIZE;
            break;
          case "center":
            arrowOffset = trigger.left + trigger.width / 2 - left;
            break;
          case "end":
            arrowOffset = trigger.right - left - ARROW_SIZE;
            break;
        }
        // 경계 처리: tooltip 안에 유지
        const maxOffsetX = Math.max(MIN_ARROW_OFFSET, bw - MIN_ARROW_OFFSET);
        arrowOffset = Math.max(
          MIN_ARROW_OFFSET,
          Math.min(arrowOffset, maxOffsetX)
        );
      }

      // NaN 방어 (JSDOM 등 테스트 환경에서 발생 가능)
      if (isNaN(arrowOffset)) {
        arrowOffset = MIN_ARROW_OFFSET;
      }

      // 상태 업데이트
      setPlacement(finalPlacement);
      setStyle({
        left: Math.round(left),
        top: Math.round(top),
        ...(bw !== originalWidth && { maxWidth: bw }),
        ...(bh !== originalHeight && { maxHeight: maxH }),
        "--arrow-offset": `${Math.round(arrowOffset)}px`,
        ...(color && { "--motile-tooltip-color": color }),
      } as React.CSSProperties);
    };

    // rAF 스로틀링: 한 프레임에 1회만 실행
    const scheduleUpdate = () => {
      if (rafIdRef.current !== null) return; // 이미 예약됨

      rafIdRef.current = requestAnimationFrame(() => {
        updatePosition();
        rafIdRef.current = null; // 다시 예약 가능
      });
    };

    // 초기 위치 계산
    updatePosition();

    // 스크롤/리사이즈 시 위치 재계산 (스로틀링 적용)
    // capture: true로 모든 스크롤 컨테이너 (모달, 내부 스크롤) 감지
    window.addEventListener("scroll", scheduleUpdate, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    // trigger 크기 변경 감지 (스로틀링 적용)
    const ro = new ResizeObserver(scheduleUpdate);
    if (triggerRef.current) ro.observe(triggerRef.current);

    return () => {
      // cleanup: 예약된 rAF 취소
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      window.removeEventListener("scroll", scheduleUpdate, { capture: true });
      window.removeEventListener("resize", scheduleUpdate);
      ro.disconnect();
    };
  }, [open, position, align, color, offset]); // position, align, offset 변경 시에도 위치 재계산 필요

  // 스크롤 시 tooltip 자동 닫기
  useEffect(() => {
    if (!open) return;

    const handleScroll = () => {
      setOpen(false, 0);
    };

    // capture: true로 모든 스크롤 감지
    window.addEventListener("scroll", handleScroll, { capture: true });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [open, setOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const contextValue: TooltipContextValue = {
    open,
    setOpen,
    position,
    align,
    variant,
    showArrow,
    color,
    keepOpen,
    tooltipId: `${id}-tooltip`,
    triggerRef,
    contentRef,
    style,
    placement,
  };

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  );
}

// ============================================================================
// Trigger Component
// ============================================================================

interface TooltipTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

function TooltipTrigger({ children, asChild = false }: TooltipTriggerProps) {
  const { open, setOpen, tooltipId, triggerRef, keepOpen } =
    useTooltipContext();

  // keepOpen 모드 hover 핸들러
  const handleTriggerEnter = useCallback(() => {
    setOpen(true, 0);
  }, [setOpen]);

  const handleTriggerLeave = useCallback(() => {
    if (keepOpen) {
      // keepOpen 모드: 100ms 딜레이 후 닫기 (tooltip으로 이동할 시간)
      setOpen(false, 100);
    } else {
      // 일반 모드: 즉시 닫기
      setOpen(false, 0);
    }
  }, [setOpen, keepOpen]);

  const handleFocus = useCallback(() => {
    setOpen(true, 0);
  }, [setOpen]);

  const handleBlur = useCallback(() => {
    setOpen(false, 0);
  }, [setOpen]);

  const handleClick = useCallback(() => {
    setOpen(!open, 0);
  }, [setOpen, open]);

  if (asChild) {
    return (
      <Slot
        ref={(node: HTMLElement | null) => {
          triggerRef.current = node;
        }}
        className="motile-tooltip-trigger"
        aria-describedby={open ? tooltipId : undefined}
        tabIndex={0}
        onMouseEnter={handleTriggerEnter}
        onMouseLeave={handleTriggerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
      >
        {children}
      </Slot>
    );
  }

  return React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;

      const childRef =
        children.props.ref ||
        (children as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;

      if (childRef) {
        if (typeof childRef === "function") {
          childRef(node);
        } else if (typeof childRef === "object" && childRef !== null) {
          (childRef as React.MutableRefObject<HTMLElement | null>).current =
            node;
        }
      }
    },
    className: `motile-tooltip-trigger ${
      children.props.className || ""
    }`.trim(),
    "aria-describedby": open ? tooltipId : undefined,
    tabIndex: children.props.tabIndex ?? 0,
    onMouseEnter: handleTriggerEnter,
    onMouseLeave: handleTriggerLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onClick: handleClick,
  });
}

// ============================================================================
// Content Component
// ============================================================================

interface TooltipContentProps {
  children: React.ReactNode;
}

function TooltipContent({ children }: TooltipContentProps) {
  const {
    open,
    setOpen,
    tooltipId,
    contentRef,
    variant,
    showArrow,
    keepOpen,
    align,
    style,
    placement,
  } = useTooltipContext();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  // 애니메이션을 위해 DOM 렌더링 후 다음 프레임에 visible 상태 변경
  useEffect(() => {
    if (open) {
      // DOM에 먼저 렌더링 (초기 상태)
      requestAnimationFrame(() => {
        setVisible(true); // 다음 프레임에 애니메이션 시작
      });
    } else {
      setVisible(false);
    }
  }, [open]);

  const handleBubbleEnter = useCallback(() => {
    if (keepOpen) {
      setOpen(true, 0);
    }
  }, [keepOpen, setOpen]);

  const handleBubbleLeave = useCallback(() => {
    if (keepOpen) {
      setOpen(false, 0);
    }
  }, [keepOpen, setOpen]);

  // Arrow 색상 CSS 변수로 전달
  const arrowColor =
    ((style as Record<string, unknown>)["--motile-tooltip-color"] as
      | string
      | undefined) ||
    (variant === "filled"
      ? "var(--motile-ui-tooltip, rgba(0, 0, 0, 0.9))"
      : "var(--motile-ui-tooltip, #3b82f6)");

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={contentRef}
      id={tooltipId}
      role="tooltip"
      className={`motile-tooltip-bubble motile-tooltip-bubble--${variant}`}
      data-open={visible || undefined}
      data-placement={placement}
      data-align={align}
      data-show-arrow={showArrow || undefined}
      data-keep-open={keepOpen || undefined}
      style={style}
      aria-hidden={!open}
      onMouseEnter={handleBubbleEnter}
      onMouseLeave={handleBubbleLeave}
    >
      {children}
      {showArrow && (
        <FloatingArrow
          className="motile-tooltip-arrow"
          variant={variant}
          color={arrowColor}
        />
      )}
    </div>,
    document.body
  );
}

// ============================================================================
// Export
// ============================================================================

export const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
};

export type {
  TooltipRootProps,
  TooltipTriggerProps,
  TooltipContentProps,
  TooltipVariant,
  TooltipPosition,
  TooltipAlign,
};
