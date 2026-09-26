import type { FC } from 'react';

interface MetricBlockProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  subtext?: string;
  highlight?: boolean;
  thermalColor?: boolean;
  status?: string;
}

export const MetricBlock: FC<MetricBlockProps> = ({
  label,
  value,
  unit = '',
  change,
  subtext,
  highlight = false,
  thermalColor = false,
  status,
}) => {
  return (
    <div
      className={`p-4 bg-white border rounded-lg transition-all shadow-sm font-sans ${
        highlight
          ? 'border-blue-300 ring-2 ring-blue-100'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
        <span>{label}</span>
        {status && <span className="text-[10px] font-mono-tech text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{status}</span>}
      </div>

      <div className="flex items-baseline space-x-1.5 mt-0.5">
        <span
          className={`text-2xl font-bold tracking-tight ${
            thermalColor ? 'text-red-600' : highlight ? 'text-blue-600' : 'text-slate-900'
          }`}
        >
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
        {change && (
          <span className={`text-xs font-semibold ml-auto ${change.startsWith('+') ? 'text-red-600' : 'text-emerald-600'}`}>
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <div className="text-xs text-slate-500 mt-1 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
