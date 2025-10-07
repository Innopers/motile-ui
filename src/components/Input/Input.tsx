import React, { forwardRef, useEffect, useRef } from 'react'
import './Input.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * 자동 포커스 여부
   * @default false
   */
  autoFocus?: boolean

  /**
   * 자동 텍스트 선택 여부 (autoFocus와 함께 사용)
   * @default false
   */
  autoSelect?: boolean

  /**
   * Input 스타일 variant
   * @default 'default'
   */
  variant?: 'default'

  /**
   * 에러 상태
   * @default false
   */
  isError?: boolean

  /**
   * Clear 버튼 클릭 핸들러
   */
  onClear?: () => void

  /**
   * 왼쪽 아이콘
   */
  leftIcon?: React.ReactNode

  /**
   * 오른쪽 아이콘
   */
  rightIcon?: React.ReactNode

  /**
   * Input 테두리/포커스 색상 (우선순위 1)
   * @example '#10b981'
   */
  color?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      autoFocus = false,
      autoSelect = false,
      variant = 'default',
      isError = false,
      onClear,
      leftIcon,
      rightIcon,
      className,
      value,
      color,
      style,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null)
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef

    // autoFocus & autoSelect 처리
    useEffect(() => {
      if (autoFocus && inputRef.current) {
        const timer = setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus()
            if (autoSelect) {
              inputRef.current.select()
            }
          }
        }, 50)

        return () => clearTimeout(timer)
      }
    }, [autoFocus, autoSelect, inputRef])

    const baseClass = 'taeri-input'
    const showClearButton = onClear && value
    const hasLeftIcon = !!leftIcon
    const hasRightContent = showClearButton || rightIcon

    const inputClasses = [
      baseClass,
      `${baseClass}--${variant}`,
      isError && `${baseClass}--error`,
      isError && `${baseClass}--shake`,
      hasLeftIcon && `${baseClass}--with-left-icon`,
      hasRightContent && `${baseClass}--with-right-content`,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const customStyle = {
      ...style,
      ...(color && { '--taeri-input-color': color } as React.CSSProperties),
    }

    return (
      <div className={`${baseClass}-wrapper`}>
        {leftIcon && <div className={`${baseClass}__left-icon`}>{leftIcon}</div>}

        <input
          ref={inputRef}
          className={inputClasses}
          value={value}
          style={customStyle}
          {...props}
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
    )
  }
)

Input.displayName = 'Input'
