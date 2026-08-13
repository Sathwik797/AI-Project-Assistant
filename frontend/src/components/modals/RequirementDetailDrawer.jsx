import React from 'react';
import { ListCheck, X, CheckCircle2, AlertTriangle, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RequirementDetailDrawer({ requirement, onClose }) {
  if (!requirement) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex justify-end z-50">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 max-w-md w-full h-full p-6 shadow-2xl space-y-5 flex flex-col justify-between text-xs overflow-y-auto">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded">
                {requirement.req_code}
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[220px]">
                {requirement.title}
              </h4>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Priority</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{requirement.priority}</span>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Type</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{requirement.req_type}</span>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{requirement.status}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requirement Specification</span>
            <p className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">
              {requirement.description || 'No detailed description provided for this requirement.'}
            </p>
          </div>

          {/* AI Quality Analysis */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Specification Quality Check</span>
            </div>
            <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/60 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Clearly defined specification structure</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Automated testable acceptance criteria</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Recommendation: Add explicit timeout/expiration policy</span>
              </div>
            </div>
          </div>

          {/* Traceability Linkage */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Traceability Linkage Stream</span>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-blue-600">{requirement.req_code}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-purple-600">US-001</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-emerald-600">3 Engineering Tasks</span>
            </div>
          </div>

          {/* Source Document Citation */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Source Attribution</span>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">requirements.pdf · Chunk #4 (0.94 relevance)</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Close Requirement Details
          </button>
        </div>
      </div>
    </div>
  );
}
