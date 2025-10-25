import React from "react";
import "./Button.css";

type ButtonVariant = "primary" | "secondary" | "default";
type ButtonSize = "large" | "medium" | "small";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 버튼 스타일 variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * 버튼 크기
   * @default 'large'
   */
  size?: ButtonSize;

  /**
   * 전체 너비 사용 여부
   * @default size === "large" ? true : false
   */
  fullWidth?: boolean;

  /**
   * 버튼 배경 색상 (우선순위 1)
   * @example '#10b981'
   */
  color?: string;

  /**
   * 터치 디바이스에서도 hover 효과 활성화 여부
   * @default false
   */
  hoverOnTouch?: boolean;

  /**
   * 로딩 상태 (로딩 중일 때 버튼 비활성화)
   * @default false
   */
  isLoading?: boolean;

  /**
   * 버튼 내용
   */
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "large",
      fullWidth,
      color,
      hoverOnTouch = false,
      isLoading = false,
      children,
      className,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const baseClass = "motile-btn";

    // fullWidth 기본값: large는 true, 나머지는 false
    const actualFullWidth = fullWidth ?? size === "large";

    const classes = [
      baseClass,
      `${baseClass}--${variant}`,
      `${baseClass}--${size}`,
      actualFullWidth && `${baseClass}--full-width`,
      (disabled || isLoading) && `${baseClass}--disabled`,
      isLoading && `${baseClass}--loading`,
      hoverOnTouch && `${baseClass}--hover-on-touch`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const customStyle = {
      ...style,
      ...(color && ({ "--motile-btn-color": color } as React.CSSProperties)),
    };

    return (
      <button
        ref={ref}
        type="button"
        className={classes}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        style={customStyle}
        {...props}
      >
        <span className={`${baseClass}__wrapper`}>
          <span
            className={`${baseClass}__content`}
            style={{ opacity: isLoading ? 0 : 1 }}
          >
            {children}
          </span>
          {isLoading && (
            <span
              className={`${baseClass}__loading`}
              role="status"
              aria-label="Loading"
            >
              <span className={`${baseClass}__dots`}>
                <span className={`${baseClass}__dot`}></span>
                <span className={`${baseClass}__dot`}></span>
                <span className={`${baseClass}__dot`}></span>
              </span>
            </span>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
