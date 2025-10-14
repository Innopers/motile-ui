import React, { useEffect, useId, useRef, useState } from "react";
import "./Popover.css";

type Placement = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

export interface PopoverProps {
  children: React.ReactElement;
  content: React.ReactNode;
  position?: Placement;
  align?: Align;
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  content,
  position = "top",
  align = "center",
}) => {
  const id = useId().replace(/:/g, "");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  // 트리거에 ref/aria만 주입
  const triggerElement = React.cloneElement(children, {
    ref: (node: HTMLElement) => {
      const prevRef: any = (children as any).ref;
      if (typeof prevRef === "function") prevRef(node);
      else if (prevRef && typeof prevRef === "object") prevRef.current = node;
      (triggerRef as any).current = node;
    },
    "aria-describedby": open ? id : undefined,
    "aria-expanded": open,
    onClick: (e: React.MouseEvent) => {
      children.props?.onClick?.(e);
      setOpen((v) => !v);
    },
  });

  // ESC / 바깥 클릭으로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(t) &&
        contentRef.current &&
        !contentRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open]);

  // triggerRef 기준으로 Popover 위치 계산 (wrapper가 아닌 실제 children 기준)
  useEffect(() => {
    if (
      !open ||
      !triggerRef.current ||
      !contentRef.current ||
      !wrapperRef.current
    )
      return;

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current || !wrapperRef.current)
        return;

      // DOM이 완전히 렌더링된 후 측정하기 위해 이중 RAF 사용
      // 첫 번째 RAF: 브라우저가 DOM을 렌더링하도록 함
      // 두 번째 RAF: CSS max-content 계산이 완료된 후 측정
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!triggerRef.current || !contentRef.current || !wrapperRef.current)
            return;

          // transform 영향을 받지 않는 원본 크기 사용
          // offsetWidth/Height는 CSS transform 무시하고 실제 렌더링된 크기 반환
          const popoverWidth = contentRef.current.offsetWidth;
          const popoverHeight = contentRef.current.offsetHeight;

          // children 요소가 CSS transform(scale, translateY 등)을 사용할 경우를 대비하여
          // offsetWidth/Height 사용 (transform 영향 제거)
          const triggerWidth = triggerRef.current.offsetWidth;
          const triggerHeight = triggerRef.current.offsetHeight;

          const trigger = triggerRef.current.getBoundingClientRect();
          const wrapper = wrapperRef.current.getBoundingClientRect();

          // wrapper 기준 상대 위치 계산
          const relativeLeft = trigger.left - wrapper.left;
          const relativeTop = trigger.top - wrapper.top;

          let left = 0;
          let top = 0;
          const gap = 8; // children과 Popover 사이 간격

          // position에 따른 위치 설정
          if (position === "top" || position === "bottom") {
            // 수평 정렬
            switch (align) {
              case "start":
                left = relativeLeft;
                break;
              case "center":
                // CSS translateX(-50%)가 처리하므로 trigger 중앙만 맞춤
                left = relativeLeft + triggerWidth / 2;
                break;
              case "end":
                left = relativeLeft + triggerWidth - popoverWidth;
                break;
            }

            // 수직 위치
            if (position === "top") {
              top = relativeTop - popoverHeight - gap;
            } else {
              top = relativeTop + triggerHeight + gap;
            }
          } else {
            // 수직 정렬
            switch (align) {
              case "start":
                top = relativeTop;
                break;
              case "center":
                // CSS translateY(-50%)가 처리하므로 trigger 중앙만 맞춤
                top = relativeTop + triggerHeight / 2;
                break;
              case "end":
                top = relativeTop + triggerHeight - popoverHeight;
                break;
            }

            // 수평 위치
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
        });
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, position, align]);

  return (
    <div
      ref={wrapperRef}
      className="taeri-popover-wrapper"
      style={{
        position: "relative",
        display: "block",
      }}
    >
      {triggerElement}

      {open && (
        <div
          ref={contentRef}
          id={id}
          role="dialog"
          aria-modal="false"
          className="taeri-popover-content"
          data-placement={position}
          data-align={align}
          style={popoverStyle}
        >
          <button
            className="taeri-popover-close"
            onClick={() => setOpen(false)}
            aria-label="Close popover"
            type="button"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {content}
        </div>
      )}
    </div>
  );
};
