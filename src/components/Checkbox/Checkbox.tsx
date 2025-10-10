import React, { forwardRef } from "react";
import "./Checkbox.css";

type CheckboxVariant = "default";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /**
   * 체크박스 스타일 variant
   * @default 'default'
   */
  variant?: CheckboxVariant;

  /**
   * 체크박스 옆 라벨
   */
  label?: string;

  /**
   * 체크박스 색상
   * @example '#10b981'
   */
  color?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      variant = "default",
      label,
      color,
      className,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const baseClass = "taeri-checkbox";

    const containerClasses = [
      `${baseClass}-container`,
      `${baseClass}-container--${variant}`,
      disabled && `${baseClass}-container--disabled`,
    ]
      .filter(Boolean)
      .join(" ");

    const checkboxClasses = [
      baseClass,
      `${baseClass}--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const labelClasses = [
      `${baseClass}__label`,
      disabled && `${baseClass}__label--disabled`,
    ]
      .filter(Boolean)
      .join(" ");

    // CSS 변수로 색상 전달
    const containerStyle = color
      ? ({ "--taeri-checkbox-color": color } as React.CSSProperties)
      : undefined;

    return (
      <div className={containerClasses} style={containerStyle}>
        <label className={`${baseClass}-wrapper`}>
          <input
            {...props}
            ref={ref}
            type="checkbox"
            className={checkboxClasses}
            disabled={disabled}
            style={style}
          />
          <span className={`${baseClass}__mark`}>
            <svg
              className={`${baseClass}__check-icon`}
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M13.5 4L6 11.5L2.5 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {label && <span className={labelClasses}>{label}</span>}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
