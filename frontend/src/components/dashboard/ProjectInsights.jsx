import React from 'react';
import { Sparkles, Database, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectInsights({ project, documents = [], projectId }) {
  const indexedCount = documents.filter(d => d.is_indexed).length;
  const totalDocs = documents.length;
  const isReady = indexedCount > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between h-full transition-colors">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Project Insights</span>
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Knowledge Readiness Status</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          Project intelligence engine uses persistent ChromaDB vector storage for grounded Gemini AI retrieval.
        </p>

        <div className="mt-4 space-y-2 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Requirements Indexing Status</span>
            <span className="font-semibold text-slate-900 dark:text-white">{indexedCount} of {totalDocs} Documents Indexed</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Vector Store Partition</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              <span>Isolated (ID: {projectId})</span>
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        {isReady ? (
          <Link
            to={`/projects/${projectId}/assistant`}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Bot className="w-4 h-4" />
            <span>Launch AI Assistant</span>
          </Link>
        ) : (
          <Link
            to={`/projects/${projectId}/documents`}
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Upload Documents to Enable RAG</span>
          </Link>
        )}
      </div>
    </div>
  );
}
