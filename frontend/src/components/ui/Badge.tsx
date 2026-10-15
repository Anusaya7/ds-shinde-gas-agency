import React from 'react';
import { OrderStatus, PaymentStatus } from '../../types';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  status?: OrderStatus | PaymentStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = 'md',
  className = '',
}) => {
  // Determine variant and display text based on status if provided
  let determinedVariant = variant || 'neutral';
  let displayText = children;

  if (status) {
    displayText = displayText || status.replace(/_/g, ' ');
    switch (status) {
      case 'PLACED':
      case 'AWAITING_REVIEW':
        determinedVariant = 'warning';
        break;
      case 'ACCEPTED':
      case 'ASSIGNED':
        determinedVariant = 'info';
        break;
      case 'OUT_FOR_DELIVERY':
      case 'ARRIVED':
        determinedVariant = 'primary';
        break;
      case 'DELIVERED':
      case 'PAID':
        determinedVariant = 'success';
        break;
      case 'CANCELLED':
      case 'REJECTED':
      case 'FAILED':
        determinedVariant = 'danger';
        break;
      case 'PENDING':
        determinedVariant = 'warning';
        break;
      case 'REFUNDED':
        determinedVariant = 'neutral';
        break;
      default:
        determinedVariant = 'neutral';
    }
  }

  const variantStyles = {
    primary: 'bg-blue-50 text-primary border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-accent border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[determinedVariant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {displayText}
    </span>
  );
};
