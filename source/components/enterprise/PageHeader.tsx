import React from 'react';

export interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  description,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-2xs ${className}`.trim()}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Icon + Title + Description */}
        <div className="flex items-start gap-3.5">
          {icon && (
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 shrink-0 mt-0.5">
              {icon}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                {title}
              </h2>
              {badge && <div className="shrink-0">{badge}</div>}
            </div>
            {description && (
              <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
