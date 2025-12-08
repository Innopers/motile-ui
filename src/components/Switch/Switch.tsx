import React, { forwardRef } from "react";

import "./Switch.css";

/**
 * 스위치 애니메이션 variant
 * - `smooth`: 부드러운 전환 (기본값)
 * - `elastic`: 탄성 효과
 * - `bounce`: 바운스 효과
 */
type SwitchVariant = "smooth" | "elastic" | "bounce";

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /**
   * 스위치 모양
   * @default 'smooth'
   * @type {'smooth' | 'elastic' | 'bounce'}
   */
  variant?: SwitchVariant;

  /**
   * 스위치 활성화 색상
   * @example '#10b981'
   */
  color?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    { variant = "smooth", color, className, disabled, style, ...props },
    ref
  ) => {
    const baseClass = "motile-switch";

    const containerClasses = [
      `${baseClass}-container`,
      `${baseClass}-container--${variant}`,
      disabled && `${baseClass}-container--disabled`,
    ]
      .filter(Boolean)
      .join(" ");

    const switchClasses = [baseClass, `${baseClass}--${variant}`, className]
      .filter(Boolean)
      .join(" ");

    // CSS 변수로 색상 전달
    const containerStyle = color
      ? ({ "--motile-switch-color": color } as React.CSSProperties)
      : undefined;

    return (
      <div className={containerClasses} style={containerStyle}>
        <label className={`${baseClass}-wrapper`}>
          <input
            {...props}
            ref={ref}
            type="checkbox"
            className={switchClasses}
            disabled={disabled}
            style={style}
            role="switch"
          />
          <span className={`${baseClass}__track`}>
            <span className={`${baseClass}__thumb`} />
          </span>
        </label>
      </div>
    );
  }
);

Switch.displayName = "Switch";
