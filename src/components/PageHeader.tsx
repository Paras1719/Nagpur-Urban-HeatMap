import type { FC, ReactNode } from 'react';

interface PageHeaderProps {
  code?: string;        // ← optional now
  title: string;
  subtitle?: string;
  action?: ReactNode;   // ← optional now
}

export const PageHeader: FC<PageHeaderProps> = ({
  code,
  title,
  subtitle,
  action,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        {code && (
          <div className="font-mono-tech text-[11px] tracking-wider text-slate-500 uppercase mb-1">
            {code}
          </div>
        )}
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};