import React, { forwardRef } from "react";
import "./Checkbox.css";

type CheckboxVariant = "standard" | "rounded" | "square";
type CheckboxSize = "large" | "medium" | "small";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /**
   * 체크박스 스타일 variant
   * @default 'standard'
   */
  variant?: CheckboxVariant;

  /**
   * 체크박스 크기
   * @default 'medium'
   */
  size?: CheckboxSize;

  /**
   * 체크박스 옆 라벨
   */
  label?: string;

  /**
   * 체크박스 색상
   * @example '#10b981'
   */
  color?: string;

  /**
   * 체크 아이콘을 항상 표시 (회색 배경 → 색상 배경)
   * @default false
   */
  filled?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      variant = "standard",
      size = "medium",
      label,
      color,
      filled = false,
      className,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const baseClass = "motile-checkbox";

    const containerClasses = [
      `${baseClass}-container`,
      `${baseClass}-container--${variant}`,
      `${baseClass}-container--${size}`,
      disabled && `${baseClass}-container--disabled`,
      filled && `${baseClass}-container--filled`,
    ]
      .filter(Boolean)
      .join(" ");

    const checkboxClasses = [
      baseClass,
      `${baseClass}--${variant}`,
      `${baseClass}--${size}`,
      filled && `${baseClass}--filled`,
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
      ? ({ "--motile-checkbox-color": color } as React.CSSProperties)
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
