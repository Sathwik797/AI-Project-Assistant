import React from 'react';
import { FileText, Eye, RotateCw, Trash2, Loader2, BookOpen } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function DocumentTable({ documents = [], onView, onIndex, onDelete, indexingId, deletingId }) {
  if (documents.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2 select-none">
        <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
        <p>No documents uploaded yet for this project workspace.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden select-none transition-colors">
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Document Knowledge Base ({documents.length})</h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="px-5 py-3">Document</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Chunks</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
            {documents.map((doc) => {
              const isIndexing = indexingId === doc.id;
              const isDeleting = deletingId === doc.id;

              return (
                <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate max-w-xs">{doc.filename}</span>
                  </td>
                  <td className="px-4 py-3 uppercase text-[11px] text-slate-500 dark:text-slate-400 font-bold">{doc.file_type}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatBytes(doc.file_size)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={doc.is_indexed ? "indexed" : "pending"}
                      label={doc.is_indexed ? "Indexed" : "Pending Index"}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold">{doc.chunk_count || 0}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(doc.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onView(doc)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Open Document Split Reader & AI Copilot Workspace"
                      >
                        <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>Open Reader</span>
                      </button>

                      <button
                        onClick={() => onIndex(doc.id)}
                        disabled={isIndexing}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-[11px] font-semibold inline-flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        title="Index Document into ChromaDB Vector Store"
                      >
                        {isIndexing ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Indexing...</span>
                          </>
                        ) : (
                          <>
                            <RotateCw className="w-3 h-3" />
                            <span>Index / Re-index</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onDelete(doc.id)}
                        disabled={isDeleting}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete Document & Vectors"
                      >
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
