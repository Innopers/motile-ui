import React, { forwardRef, useEffect, useRef } from "react";
import "./Textarea.css";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
   * 에러 상태
   * @default false
   */
  isError?: boolean;

  /**
   * 에러 메시지 (isError가 명시되지 않으면 에러 상태로 표시)
   */
  errorMessage?: string;

  /**
   * Textarea 테두리/포커스 색상 (우선순위 1)
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

  /**
   * 기본 행(줄) 수
   * @default 3
   */
  rows?: number;

  /**
   * Resize 제어
   * @default 'none'
   */
  resize?: "none" | "vertical" | "horizontal" | "both";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      autoFocus = false,
      autoSelect = false,
      isError,
      errorMessage,
      className,
      value,
      color,
      style,
      maxLength,
      label,
      placeholder,
      rows = 3,
      resize = "none",
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // isError가 명시되지 않으면 errorMessage로 판단
    const hasError = isError ?? !!errorMessage;

    // autoFocus & autoSelect 처리
    useEffect(() => {
      if (autoFocus && textareaRef.current) {
        const timer = setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            if (autoSelect) {
              textareaRef.current.select();
            }
          }
        }, 50);

        return () => clearTimeout(timer);
      }
    }, [autoFocus, autoSelect]);

    const baseClass = "taeri-textarea";

    const textareaClasses = [
      baseClass,
      hasError && `${baseClass}--error`,
      hasError && `${baseClass}--shake`,
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
      ? ({ "--taeri-textarea-color": color } as React.CSSProperties)
      : undefined;

    const textareaStyle = {
      ...style,
      resize,
    };

    const currentLength = value ? String(value).length : 0;
    const showCounter = maxLength !== undefined;

    // aria-describedby 병합 (외부 값 + 내부 에러 ID)
    const ariaDescribedBy = [
      props["aria-describedby"],
      errorMessage ? `${baseClass}-error` : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <>
        <div className={wrapperClasses} style={wrapperStyle}>
          {label && <label className={labelClasses}>{label}</label>}

          <textarea
            {...{ ...props, "aria-describedby": ariaDescribedBy }}
            ref={textareaRef}
            className={textareaClasses}
            value={value}
            maxLength={maxLength}
            rows={rows}
            style={textareaStyle}
            placeholder={label ? (placeholder || " ") : placeholder}
          />
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
                id={`${baseClass}-error`}
                className={`${baseClass}__error-message`}
                role="alert"
              >
                {errorMessage}
              </span>
            )}
            {showCounter && (
              <span className={`${baseClass}__counter`}>
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
      </>
    );
  }
);

Textarea.displayName = "Textarea";
