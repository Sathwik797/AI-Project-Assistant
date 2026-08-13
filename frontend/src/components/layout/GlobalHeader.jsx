import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, Search, Sun, Moon, Bell } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import GlobalSearchModal from '../modals/GlobalSearchModal';

export default function GlobalHeader({ activeProject }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showSearchModal, setShowSearchModal] = useState(false);

  return (
    <>
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shadow-2xs shrink-0 select-none transition-colors">
        {/* Application Brand / Compact Breadcrumb Context */}
        <div className="flex items-center gap-2.5 min-w-0 pr-4">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
            <span className="font-bold text-slate-900 dark:text-white">AI Project Assistant</span>
            {activeProject && (
              <>
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <span className="text-slate-500 dark:text-slate-400 truncate">{activeProject.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Global Search Bar Trigger */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md pl-3 pr-3 py-1.5 text-xs text-slate-400 dark:text-slate-400 hover:border-blue-500 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search projects, documents, requirements...</span>
            </div>
            <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] font-mono">⌘K</kbd>
          </button>
        </div>

        {/* Header Actions & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status="ready" label="AI Ready" />

          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User Avatar Pill */}
          <div className="pl-2 border-l border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              {user?.full_name?.slice(0, 2).toUpperCase() || 'SR'}
            </div>
          </div>
        </div>
      </header>

      {showSearchModal && <GlobalSearchModal onClose={() => setShowSearchModal(false)} />}
    </>
  );
}
