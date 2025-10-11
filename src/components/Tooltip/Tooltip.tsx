import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Tooltip.css";

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

const OFFSET = 8;
const MARGIN = 8;

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
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
        // 가운데 정렬 시도
        left = trigger.left + trigger.width / 2 - bw / 2;
        // 화면 밖으로 나가지 않게 조정
        left = Math.max(MARGIN, Math.min(left, vw - MARGIN - bw));

        top =
          finalPlacement === "top"
            ? trigger.top - OFFSET - bh
            : trigger.bottom + OFFSET;
      } else {
        // 세로 중앙 정렬 시도
        top = trigger.top + trigger.height / 2 - bh / 2;
        // 화면 밖으로 나가지 않게 조정
        top = Math.max(MARGIN, Math.min(top, vh - MARGIN - bh));

        left =
          finalPlacement === "left"
            ? trigger.left - OFFSET - bw
            : trigger.right + OFFSET;
      }

      // 상태 업데이트
      setPlacement(finalPlacement);
      setStyle({
        left: Math.round(left),
        top: Math.round(top),
        maxWidth: bw !== rect.width ? maxW : undefined,
        maxHeight: bh !== rect.height ? maxH : undefined,
      });
    };

    updatePosition();

    // 스크롤/리사이즈 시 위치 재계산
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });

    // trigger 크기 변경 감지
    const ro = new ResizeObserver(updatePosition);
    ro.observe(triggerRef.current);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      ro.disconnect();
    };
  }, [open, position]);

  const isTouch =
    typeof window !== "undefined" && matchMedia("(hover: none)").matches;

  return (
    <>
      <span
        ref={triggerRef}
        className="taeri-tooltip-trigger"
        aria-describedby={open ? id : undefined}
        tabIndex={0}
        onMouseEnter={isTouch ? undefined : () => setOpen(true)}
        onMouseLeave={isTouch ? undefined : () => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={isTouch ? () => setOpen((o) => !o) : undefined}
      >
        {children}
      </span>

      {mounted &&
        createPortal(
          <div
            ref={bubbleRef}
            id={id}
            role="tooltip"
            className="taeri-tooltip-bubble"
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
