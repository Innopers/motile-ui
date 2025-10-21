import React from "react";
import "./Badge.css";

type BadgeVariant = "primary" | "secondary" | "outlined" | "dot";
type BadgeSize = "large" | "medium" | "small";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge 스타일 variant
   */
  variant?: BadgeVariant;

  /**
   * Badge 크기
   * @default 'medium'
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
    const baseClass = "taeri-badge";

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
      ...(color && ({ "--taeri-badge-color": color } as React.CSSProperties)),
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
