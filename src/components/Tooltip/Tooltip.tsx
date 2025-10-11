import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Tooltip.css";

type TooltipVariant = "default" | "outlined";

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
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
}

const OFFSET = 8;
const MARGIN = 8;

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  variant = "default",
  color,
}) => {
  const id = useId().replace(/:/g, "");
  const triggerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [placement, setPlacement] = useState(position);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => setMounted(true), []);

  // 위치 계산 및 업데이트
  useEffect(() => {
    if (!open || !triggerRef.current || !bubbleRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !bubbleRef.current) return;

      const trigger = triggerRef.current.getBoundingClientRect();
      const bubble = bubbleRef.current;

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
        // 수평: 트리거 중앙 정렬
        left = trigger.left + trigger.width / 2 - bw / 2;
        left = Math.max(MARGIN, Math.min(left, vw - MARGIN - bw));

        // 수직: 트리거 위/아래 배치
        top =
          finalPlacement === "top"
            ? trigger.top - OFFSET - bh
            : trigger.bottom + OFFSET;
        top = Math.max(MARGIN, Math.min(top, vh - MARGIN - bh));
      } else {
        // 수직: 트리거 중앙 정렬
        top = trigger.top + trigger.height / 2 - bh / 2;
        top = Math.max(MARGIN, Math.min(top, vh - MARGIN - bh));

        // 수평: 트리거 좌/우 배치
        left =
          finalPlacement === "left"
            ? trigger.left - OFFSET - bw
            : trigger.right + OFFSET;
        left = Math.max(MARGIN, Math.min(left, vw - MARGIN - bw));
      }

      // 상태 업데이트
      setPlacement(finalPlacement);
      setStyle({
        left: Math.round(left),
        top: Math.round(top),
        maxWidth: bw !== rect.width ? maxW : undefined,
        maxHeight: bh !== rect.height ? maxH : undefined,
        ...(color && { "--taeri-tooltip-color": color } as React.CSSProperties),
      });
    };

    updatePosition();

    // 스크롤/리사이즈 시 위치 재계산
    // capture: true로 모든 스크롤 컨테이너 (모달, 내부 스크롤) 감지
    window.addEventListener("scroll", updatePosition, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", updatePosition, { passive: true });

    // trigger 크기 변경 감지
    const ro = new ResizeObserver(updatePosition);
    ro.observe(triggerRef.current);

    return () => {
      window.removeEventListener("scroll", updatePosition, { capture: true });
      window.removeEventListener("resize", updatePosition);
      ro.disconnect();
    };
  }, [open, position]); // position 변경 시에도 위치 재계산 필요

  return (
    <>
      <span
        ref={triggerRef}
        className="taeri-tooltip-trigger"
        aria-describedby={open ? id : undefined}
        tabIndex={0}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
      >
        {children}
      </span>

      {mounted &&
        createPortal(
          <div
            ref={bubbleRef}
            id={id}
            role="tooltip"
            className={`taeri-tooltip-bubble taeri-tooltip-bubble--${variant}`}
            data-open={open || undefined}
            data-placement={placement}
            style={style}
            aria-hidden={!open}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
};
