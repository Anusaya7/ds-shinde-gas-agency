import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  footer,
  children,
  className = '',
  noPadding = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-end">
          {footer}
        </div>
      )}
    </div>
  );
};
