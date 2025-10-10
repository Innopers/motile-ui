import React, { forwardRef } from "react";
import "./Switch.css";

type SwitchVariant = "default";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /**
   * 스위치 모양
   * @default 'default'
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
    {
      variant = "default",
      color,
      className,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const baseClass = "taeri-switch";

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
      ? ({ "--taeri-switch-color": color } as React.CSSProperties)
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
