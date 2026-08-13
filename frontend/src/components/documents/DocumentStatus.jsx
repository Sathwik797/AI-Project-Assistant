import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function DocumentStatus({ indexed, chunkCount }) {
  if (indexed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
        <span>Indexed ({chunkCount ?? 0} chunks)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
      <span>Pending Index</span>
    </span>
  );
}
