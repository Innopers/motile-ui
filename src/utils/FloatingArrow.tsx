import React from "react";

/**
 * Floating Arrow variant
 * - `filled`: 채워진 스타일
 * - `outlined`: 테두리 스타일
 */
export type FloatingArrowVariant = "filled" | "outlined";

export interface FloatingArrowProps {
  /**
   * Arrow 스타일 variant
   * @default 'filled'
   */
  variant?: FloatingArrowVariant;
  /**
   * Arrow 색상
   * - filled: 배경색
   * - outlined: 테두리색
   */
  color?: string;
  /**
   * 추가 className
   */
  className?: string;
  /**
   * 추가 style
   */
  style?: React.CSSProperties;
  /**
   * Arrow 너비
   * @default 12
   */
  width?: number;
  /**
   * Arrow 높이
   * @default 8
   */
  height?: number;
}

/**
 * Floating 요소용 Arrow SVG 컴포넌트
 * Tooltip, Popover 등에서 공통으로 사용
 */
export const FloatingArrow = React.forwardRef<
  SVGSVGElement,
  FloatingArrowProps
>(
  (
    {
      variant = "filled",
      color,
      className = "",
      style,
      width = 12,
      height = 8,
    },
    ref
  ) => {
    return (
      <svg
        ref={ref}
        className={className}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={
          {
            "--arrow-color": color,
            ...style,
          } as React.CSSProperties
        }
      >
        {variant === "filled" ? (
          <path
            d={`M${width / 2} 1 L${width - 1} ${
              height - 1
            } L${width} ${height} L0 ${height} L1 ${height - 1} Z`}
            fill="var(--arrow-color)"
          />
        ) : (
          <>
            {/* 툴팁 테두리와 겹치는 확장된 베이스 (이음새 없는 연결을 위함) */}
            <path
              d={`M-1 ${height - 1} L-0.5 ${height + 0.5} L${width + 0.5} ${
                height + 0.5
              } L${width + 1} ${height - 1} L${width - 1} ${height - 1} L${
                width / 2
              } 1 L1 ${height - 1} Z`}
              fill="white"
            />
            {/* 보이는 가장자리에만 화살표 외곽선 */}
            <path
              d={`M1 ${height - 1} L${width / 2} 1 L${width - 1} ${height - 1}`}
              fill="none"
              stroke="var(--arrow-color)"
              strokeWidth="1.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    );
  }
);

FloatingArrow.displayName = "FloatingArrow";
