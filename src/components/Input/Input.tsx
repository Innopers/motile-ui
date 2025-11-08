import React, { forwardRef, useEffect, useId, useRef } from "react";
import "./Input.css";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * 자동 포커스 여부
   * @default false
   */
  autoFocus?: boolean;

  /**
   * 자동 텍스트 선택 여부 (autoFocus와 함께 사용)
   * @default false
   */
  autoSelect?: boolean;

  /**
   * Input 스타일 variant
   * @default 'default'
   */
  variant?: "default" | "underline";

  /**
   * 에러 상태
   * @default false
   */
  isError?: boolean;

  /**
   * 에러 메시지 (isError가 명시되지 않으면 에러 상태로 표시)
   */
  errorMessage?: string;

  /**
   * Clear 버튼 클릭 핸들러
   */
  onClear?: () => void;

  /**
   * 왼쪽 아이콘
   */
  leftIcon?: React.ReactNode;

  /**
   * 오른쪽 아이콘
   */
  rightIcon?: React.ReactNode;

  /**
   * Input 테두리/포커스 색상 (우선순위 1)
   * @example '#10b981'
   */
  color?: string;

  /**
   * 최대 글자수 (설정 시 자동으로 글자수 카운터 표시)
   */
  maxLength?: number;

  /**
   * Floating label (focus 전에는 placeholder 위치, focus/값 있을 때 위로 이동)
   */
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id: idProp,
      autoFocus = false,
      autoSelect = false,
      variant = "default",
      isError,
      errorMessage,
      onClear,
      leftIcon,
      rightIcon,
      className,
      value,
      color,
      style,
      maxLength,
      label,
      placeholder,
      ...props
    },
    ref
  ) => {
    const generatedId = useId().replace(/:/g, "");
    const id = idProp ?? `motile-input-${generatedId}`;

    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    // isError가 명시되지 않으면 errorMessage로 판단
    const hasError = isError ?? !!errorMessage;

    // autoFocus & autoSelect 처리
    useEffect(() => {
      if (autoFocus && inputRef.current) {
        const timer = setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            if (autoSelect) {
              inputRef.current.select();
            }
          }
        }, 50);

        return () => clearTimeout(timer);
      }
    }, [autoFocus, autoSelect]);

    const baseClass = "motile-input";
    const showClearButton = onClear && value;
    const hasLeftIcon = !!leftIcon;
    const hasRightContent = showClearButton || rightIcon;

    const inputClasses = [
      baseClass,
      `${baseClass}--${variant}`,
      hasError && `${baseClass}--error`,
      hasError && `${baseClass}--shake`,
      hasLeftIcon && `${baseClass}--with-left-icon`,
      hasRightContent && `${baseClass}--with-right-content`,
      label && `${baseClass}--with-label`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const wrapperClasses = [
      `${baseClass}-wrapper`,
      label && `${baseClass}-wrapper--with-label`,
    ]
      .filter(Boolean)
      .join(" ");

    const labelClasses = [
      `${baseClass}__label`,
      hasError && `${baseClass}__label--error`,
    ]
      .filter(Boolean)
      .join(" ");

    const wrapperStyle = color
      ? ({ "--motile-input-color": color } as React.CSSProperties)
      : undefined;

    const inputStyle = {
      ...style,
    };

    const currentLength = value ? String(value).length : 0;
    const showCounter = maxLength !== undefined;

    // aria-describedby 병합 (외부 값 + 에러 + 카운터)
    const describedBy =
      [
        props["aria-describedby"],
        errorMessage ? `${id}-error` : undefined,
        showCounter ? `${id}-counter` : undefined,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className={`${baseClass}-root`}>
        <div className={wrapperClasses} style={wrapperStyle}>
          {label && (
            <label className={labelClasses} htmlFor={id}>
              {label}
            </label>
          )}

          {leftIcon && (
            <div className={`${baseClass}__left-icon`}>{leftIcon}</div>
          )}

          <input
            id={id}
            {...{ ...props, "aria-describedby": describedBy }}
            aria-invalid={hasError || undefined}
            ref={inputRef}
            className={inputClasses}
            value={value}
            maxLength={maxLength}
            style={inputStyle}
            placeholder={label ? placeholder || " " : placeholder}
          />

          {rightIcon && !showClearButton && (
            <div className={`${baseClass}__right-icon`}>{rightIcon}</div>
          )}

          {showClearButton && (
            <button
              type="button"
              onClick={onClear}
              className={`${baseClass}__clear-button`}
              aria-label="지우기"
            >
              <svg
                className={`${baseClass}__clear-icon`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>

        {(errorMessage || showCounter) && (
          <div
            className={`${baseClass}__helper-text ${
              errorMessage && showCounter
                ? `${baseClass}__helper-text--both`
                : errorMessage
                ? `${baseClass}__helper-text--error-only`
                : `${baseClass}__helper-text--counter-only`
            }`}
          >
            {errorMessage && (
              <span
                id={`${id}-error`}
                className={`${baseClass}__error-message`}
                role="alert"
              >
                {errorMessage}
              </span>
            )}
            {showCounter && (
              <span id={`${id}-counter`} className={`${baseClass}__counter`}>
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
