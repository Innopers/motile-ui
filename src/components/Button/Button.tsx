import React from 'react'
import './Button.css'

type ButtonVariant = 'primary' | 'secondary' | 'default'
type ButtonSize = 'large'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 버튼 스타일 variant
   * @default 'primary'
   */
  variant?: ButtonVariant

  /**
   * 버튼 크기
   * @default 'large'
   */
  size?: ButtonSize

  /**
   * 전체 너비 사용 여부
   * @default true
   */
  fullWidth?: boolean

  /**
   * 버튼 배경 색상 (우선순위 1)
   * @example '#10b981'
   */
  color?: string

  /**
   * 터치 디바이스에서도 hover 효과 활성화 여부
   * @default false
   */
  hoverOnTouch?: boolean

  /**
   * 버튼 내용
   */
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'large',
  fullWidth = true,
  color,
  hoverOnTouch = false,
  children,
  className,
  disabled,
  style,
  ...props
}) => {
  const baseClass = 'taeri-btn'
  const classes = [
    baseClass,
    `${baseClass}--${variant}`,
    `${baseClass}--${size}`,
    fullWidth && `${baseClass}--full-width`,
    disabled && `${baseClass}--disabled`,
    hoverOnTouch && `${baseClass}--hover-on-touch`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const customStyle = {
    ...style,
    ...(color && { '--btn-color': color } as React.CSSProperties),
  }

  return (
    <button
      className={classes}
      disabled={disabled}
      style={customStyle}
      {...props}
    >
      {children}
    </button>
  )
}
