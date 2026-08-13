import React from 'react';

export default function StatusBadge({ status = 'ready', label = 'AI Ready', className = '' }) {
  // Strip any duplicate leading bullet characters if present in label string
  const cleanLabel = (label || '').replace(/^[●○•\s]+/, '').trim() || 'AI Ready';

  const variants = {
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    connected: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    indexed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    processing: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
  };

  const isHealthy = status === 'healthy' || status === 'ready' || status === 'connected' || status === 'indexed' || status === true;
  const currentKey = isHealthy ? 'ready' : (variants[status] ? status : 'pending');

  const dotColors = {
    ready: 'bg-emerald-500',
    pending: 'bg-amber-500',
    processing: 'bg-blue-500 animate-pulse',
    error: 'bg-red-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${variants[currentKey] || variants.ready} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[currentKey] || 'bg-emerald-500'}`}></span>
      <span>{cleanLabel}</span>
    </span>
  );
}
