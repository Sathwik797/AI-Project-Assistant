import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const iconColors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800',
    slate: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-start justify-between transition-colors">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">{title}</span>
        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{value}</div>
        {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className={`p-2.5 rounded-lg border ${iconColors[color] || iconColors.blue}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}
