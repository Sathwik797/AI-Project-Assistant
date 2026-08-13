import React from 'react';
import { Clock } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, description, badgeText = 'Coming soon', previewContent }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-10 text-center shadow-2xs space-y-4">
      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border border-blue-100 shadow-2xs">
        <Icon className="w-6 h-6" />
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 text-slate-600 border border-slate-200/80 rounded-full text-[11px] font-semibold">
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        <span>{badgeText}</span>
      </div>

      {previewContent && (
        <div className="mt-6 pt-6 border-t border-slate-100 max-w-xl mx-auto text-left opacity-75">
          {previewContent}
        </div>
      )}
    </div>
  );
}
