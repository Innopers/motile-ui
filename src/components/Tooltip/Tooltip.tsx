import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "./Tooltip.css";

type TooltipVariant = "default" | "outlined";
type TooltipPosition = "top" | "bottom" | "left" | "right";
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
  position?: TooltipPosition;
  /**
   * 툴팁 정렬 방식
   * - top/bottom일 때: start(왼쪽), center(중앙), end(오른쪽)
   * - left/right일 때: start(위), center(중앙), end(아래)
   * @default 'center'
   */
  align?: TooltipAlign;
  /**
   * 툴팁 스타일 variant
   * @default 'default'
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
}

const OFFSET = 8;
const MARGIN = 8;

function TooltipRoot({
  children,
  position = "top",
  align = "center",
  variant = "default",
  color,
  showArrow = false,
  keepOpen = false,
}: TooltipRootProps) {
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

  // 위치 계산 및 업데이트
  useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return;

      const trigger = triggerRef.current.getBoundingClientRect();
      const bubble = contentRef.current;

      // 임시로 보이지 않게 해서 자연스러운 크기 측정
      bubble.classList.add("measuring");
      const rect = bubble.getBoundingClientRect();
      bubble.classList.remove("measuring");

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let bw = rect.width;
      let bh = rect.height;

      // 뷰포트보다 크면 제한
      const maxW = vw - MARGIN * 2;
      const maxH = vh - MARGIN * 2;
      if (bw > maxW) bw = maxW;
      if (bh > maxH) bh = maxH;

      // 위치 자동 조정 (flip)
      let finalPlacement = position;
      if (position === "top" && trigger.top - OFFSET - bh < MARGIN) {
        finalPlacement = "bottom";
      } else if (
        position === "bottom" &&
        trigger.bottom + OFFSET + bh > vh - MARGIN
      ) {
        finalPlacement = "top";
      } else if (position === "left" && trigger.left - OFFSET - bw < MARGIN) {
        finalPlacement = "right";
      } else if (
        position === "right" &&
        trigger.right + OFFSET + bw > vw - MARGIN
      ) {
        finalPlacement = "left";
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
            ? trigger.top - OFFSET - bh
            : trigger.bottom + OFFSET;
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
          left = trigger.left - OFFSET - bw;
          // 왼쪽 여백 부족 시 width 줄이기
          if (left < MARGIN) {
            bw = trigger.left - OFFSET - MARGIN;
            left = MARGIN;
          }
        } else {
          // right
          left = trigger.right + OFFSET;
          // 오른쪽 여백 부족 시 width 줄이기
          if (left + bw > vw - MARGIN) {
            bw = vw - MARGIN - left;
          }
        }
      }

      // 화살표 위치 계산 (children 중앙 기준)
      const arrowLeft =
        finalPlacement === "top" || finalPlacement === "bottom"
          ? trigger.left + trigger.width / 2 - left
          : undefined;
      const arrowTop =
        finalPlacement === "left" || finalPlacement === "right"
          ? trigger.top + trigger.height / 2 - top
          : undefined;

      // 상태 업데이트
      setPlacement(finalPlacement);
      setStyle({
        left: Math.round(left),
        top: Math.round(top),
        ...(bw !== rect.width && { maxWidth: bw }),
        ...(bh !== rect.height && { maxHeight: maxH }),
        ...(color &&
          ({ "--taeri-tooltip-color": color } as React.CSSProperties)),
        ...(arrowLeft !== undefined &&
          ({ "--arrow-left": `${arrowLeft}px` } as React.CSSProperties)),
        ...(arrowTop !== undefined &&
          ({ "--arrow-top": `${arrowTop}px` } as React.CSSProperties)),
      });
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
  }, [open, position, align, color]); // position, align 변경 시에도 위치 재계산 필요

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
}

function TooltipTrigger({ children }: TooltipTriggerProps) {
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

  return React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;

      const childRef = (
        children as React.ReactElement & { ref?: React.Ref<HTMLElement> }
      ).ref;

      if (childRef) {
        if (typeof childRef === "function") {
          childRef(node);
        } else if (typeof childRef === "object" && childRef !== null) {
          (childRef as React.MutableRefObject<HTMLElement | null>).current =
            node;
        }
      }
    },
    className: `taeri-tooltip-trigger ${children.props.className || ""}`.trim(),
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

  useEffect(() => setMounted(true), []);

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

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={contentRef}
      id={tooltipId}
      role="tooltip"
      className={`taeri-tooltip-bubble taeri-tooltip-bubble--${variant}`}
      data-open={open || undefined}
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
