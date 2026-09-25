import React from 'react';

export type BadgeVariant = 'critical' | 'warning' | 'healthy' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<BadgeVariant, { container: string; dot: string }> = {
  critical: {
    container: 'bg-red-50 text-red-800 border-red-200',
    dot: 'bg-red-500',
  },
  warning: {
    container: 'bg-amber-50 text-amber-900 border-amber-300',
    dot: 'bg-amber-500',
  },
  healthy: {
    container: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  info: {
    container: 'bg-sky-50 text-sky-900 border-sky-200',
    dot: 'bg-sky-500',
  },
  neutral: {
    container: 'bg-slate-100 text-slate-800 border-slate-200',
    dot: 'bg-slate-400',
  },
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs font-semibold rounded',
  md: 'px-2.5 py-1 text-xs font-semibold rounded-md',
  lg: 'px-3 py-1.5 text-sm font-semibold rounded-lg',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  dot = false,
  pulse = false,
  icon,
  className = '',
  children,
  ...props
}) => {
  const { container, dot: dotBg } = VARIANT_CLASSES[variant];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border leading-none select-none tracking-wide ${container} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotBg} ${pulse ? 'animate-pulse' : ''}`}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
