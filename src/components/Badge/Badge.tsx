import React from "react";

import "./Badge.css";

/**
 * Badge 스타일 variant
 * - `primary`: 채워진 배경 (기본값)
 * - `secondary`: 연한 배경
 * - `outlined`: 테두리 스타일
 * - `dot`: 점 + 텍스트
 * - `shimmer`: 반짝이는 효과
 */
type BadgeVariant = "primary" | "secondary" | "outlined" | "dot" | "shimmer";

/**
 * Badge 크기
 * - `large`: 큰 크기
 * - `medium`: 중간 크기 (기본값)
 * - `small`: 작은 크기
 */
type BadgeSize = "large" | "medium" | "small";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge 스타일 variant
   * @default 'primary'
   * @type {'primary' | 'secondary' | 'outlined' | 'dot' | 'shimmer'}
   */
  variant?: BadgeVariant;

  /**
   * Badge 크기
   * @default 'medium'
   * @type {'large' | 'medium' | 'small'}
   */
  size?: BadgeSize;

  /**
   * Badge 배경 색상 (우선순위 1)
   * @example '#10b981'
   */
  color?: string;

  /**
   * Badge 내용
   */
  children?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { variant, size = "medium", color, className, children, style, ...props },
    ref
  ) => {
    const baseClass = "motile-badge";

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      variant && `${baseClass}--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const customStyle = {
      ...style,
      ...(color && ({ "--motile-badge-color": color } as React.CSSProperties)),
    };

    // dot variant일 때는 구조가 다름
    if (variant === "dot") {
      return (
        <span ref={ref} className={classes} style={customStyle} {...props}>
          <span className={`${baseClass}__dot`} />
          <span className={`${baseClass}__text`}>{children}</span>
        </span>
      );
    }

    return (
      <span ref={ref} className={classes} style={customStyle} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
