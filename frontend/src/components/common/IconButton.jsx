import React from 'react';

export default function IconButton({ icon: Icon, title, onClick, variant = 'default', className = '', disabled = false }) {
  const variants = {
    default: 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-transparent',
    primary: 'text-blue-600 hover:bg-blue-50 border-blue-200',
    danger: 'text-slate-400 hover:text-red-600 hover:bg-red-50 border-transparent',
  };

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-md border text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.default} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
