import React from 'react'
import { cn } from '@/lib/utils'

const variantStyles = {
  primary:
    'bg-ocean-700 text-white hover:bg-ocean-800 focus-visible:ring-ocean-500',
  outline:
    'border border-ocean-700 text-ocean-700 hover:bg-ocean-50 focus-visible:ring-ocean-500',
  danger:
    'bg-accent text-white hover:bg-accent-dark focus-visible:ring-accent',
  ghost:
    'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400',
} as const

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
} as const

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-btn font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'

export { Button }
