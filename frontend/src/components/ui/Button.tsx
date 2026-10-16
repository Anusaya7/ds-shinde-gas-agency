import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-sm px-5 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-base px-7 py-3.5 gap-2.5 min-h-[52px]',
  };

  const variantStyles = {
    primary:
      'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary/40 shadow-soft hover:shadow-card-hover',
    secondary:
      'bg-white text-primary border border-primary/30 hover:bg-primary/5 hover:border-primary/50 focus:ring-primary/40 shadow-soft',
    accent:
      'bg-accent text-white hover:bg-accent-dark focus:ring-accent/40 shadow-soft hover:shadow-card-hover',
    outline:
      'border-2 border-secondary text-secondary hover:bg-secondary hover:text-white focus:ring-secondary/40 bg-transparent shadow-none',
    ghost:
      'text-text-secondary hover:bg-background-tertiary hover:text-text-primary focus:ring-background-tertiary bg-transparent shadow-none',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/40 shadow-soft',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};