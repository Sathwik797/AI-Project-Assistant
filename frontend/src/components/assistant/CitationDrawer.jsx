import React from 'react';
import { FileText, X, Database, Sparkles } from 'lucide-react';

export default function CitationDrawer({ citation, onClose }) {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex justify-end z-50">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 max-w-md w-full h-full p-6 shadow-2xl space-y-4 flex flex-col justify-between text-xs">
        <div className="space-y-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Source Citation Preview</h4>
                <span className="text-[11px] text-slate-400">{citation.filename || `Document ID: ${citation.document_id}`}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Relevance Score</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {(citation.similarity_score || citation.distance || 0.92).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Chunk Index</span>
              <span className="font-mono text-slate-900 dark:text-white">Chunk #{citation.chunk_index || 0}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Retrieved Vector Snippet</span>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {citation.chunk_text || citation.snippet || 'No text snippet available.'}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
