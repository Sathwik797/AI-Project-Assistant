import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

export default function RecentDocuments({ documents = [], projectId }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden flex flex-col h-full transition-colors">
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Recent Project Documents</h4>
        <Link 
          to={`/projects/${projectId}/documents`} 
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="p-4 flex-1">
        {documents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p>No documents uploaded yet for this project.</p>
            <Link
              to={`/projects/${projectId}/documents`}
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              + Upload Document
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-7 h-7 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{doc.filename}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">{doc.file_type} · {(doc.file_size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <StatusBadge 
                    status={doc.indexed ? "indexed" : "pending"} 
                    label={doc.indexed ? `Indexed (${doc.chunk_count} chunks)` : "Pending Index"} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
