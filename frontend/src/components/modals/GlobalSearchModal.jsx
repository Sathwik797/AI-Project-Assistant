import React, { useState } from 'react';
import { Search, X, Folder, FileText, ListCheck, UserCheck, Kanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-start justify-center pt-20 p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden space-y-0">
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search projects, documents, requirements..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-3 text-xs">
          {!query ? (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500">
              Type to search across projects, knowledge documents, requirements, and tasks...
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Projects
                </span>
                <button
                  onClick={() => handleSelect('/projects/1/overview')}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-200"
                >
                  <Folder className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold">E-Commerce Platform</span>
                </button>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Documents
                </span>
                <button
                  onClick={() => handleSelect('/projects/1/documents')}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-200"
                >
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>requirements_spec.pdf</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between">
          <span>Press ESC to exit</span>
          <span>Global Search Engine</span>
        </div>
      </div>
    </div>
  );
}
