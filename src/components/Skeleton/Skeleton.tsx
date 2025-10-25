import React from 'react'
import './Skeleton.css'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Skeleton 너비
   * @default '100%'
   * @example '200px', '50%', 200
   */
  width?: string | number

  /**
   * Skeleton 높이
   * @default '1rem'
   * @example '40px', '3rem', 40
   */
  height?: string | number

  /**
   * Skeleton border radius
   * @default '4px'
   * @example '8px', '50%', 12, 0
   */
  borderRadius?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '4px',
  className,
  style,
  ...props
}) => {
  const baseClass = 'motile-skeleton'

  const classes = [baseClass, className].filter(Boolean).join(' ')

  // width, height, borderRadius 값을 string으로 변환 (number인 경우 px 추가)
  const formatSize = (size: string | number | undefined, defaultValue: string): string => {
    if (size === undefined) return defaultValue
    return typeof size === 'number' ? `${size}px` : size
  }

  const customStyle = {
    ...style,
    width: formatSize(width, '100%'),
    height: formatSize(height, '1rem'),
    borderRadius: formatSize(borderRadius, '4px'),
  }

  return (
    <div
      className={classes}
      style={customStyle}
      aria-busy="true"
      aria-live="polite"
      {...props}
    />
  )
}
