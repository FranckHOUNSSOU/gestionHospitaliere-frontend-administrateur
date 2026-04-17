import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'cyan' | 'slate';
  trend?: { value: string; up: boolean };
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500',
    text: 'text-blue-600',
    trend: 'text-blue-500',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-500',
    text: 'text-emerald-600',
    trend: 'text-emerald-500',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-500',
    text: 'text-amber-600',
    trend: 'text-amber-500',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-500',
    text: 'text-red-600',
    trend: 'text-red-500',
  },
  cyan: {
    bg: 'bg-cyan-50',
    icon: 'bg-cyan-500',
    text: 'text-cyan-600',
    trend: 'text-cyan-500',
  },
  slate: {
    bg: 'bg-slate-100',
    icon: 'bg-slate-500',
    text: 'text-slate-600',
    trend: 'text-slate-500',
  },
};

export default function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${c.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium mt-1 ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.up ? '▲' : '▼'} {trend.value}
            </p>
          )}
        </div>
        <div className={`${c.icon} p-2.5 rounded-xl text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
