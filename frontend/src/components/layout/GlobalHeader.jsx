import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layers, Search, Bell } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import GlobalSearchModal from '../modals/GlobalSearchModal';
import NotificationDrawer from '../modals/NotificationDrawer';

export default function GlobalHeader({ activeProject }) {
  const { user } = useAuth();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="h-14 bg-white border-b border-[#E7E5E4] px-6 flex items-center justify-between shadow-2xs shrink-0 select-none transition-colors">
        {/* Application Brand / Compact Breadcrumb Context */}
        <div className="flex items-center gap-2.5 min-w-0 pr-4">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Layers className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 truncate">
            <span className="font-bold text-slate-900">AI Project Assistant</span>
            {activeProject && (
              <>
                <span className="text-slate-400">/</span>
                <span className="text-slate-500 truncate">{activeProject.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Global Search Bar Trigger */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full bg-[#FCFCFA] border border-[#E7E5E4] rounded-md pl-3 pr-3 py-1.5 text-xs text-slate-400 hover:border-amber-500 flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search projects, documents, requirements...</span>
            </div>
            <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-mono">⌘K</kbd>
          </button>
        </div>

        {/* Header Actions & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status="ready" label="AI Ready" />

          <button
            onClick={() => setShowNotifications(true)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-amber-600 absolute top-1 right-1"></span>
          </button>

          {/* User Avatar Pill */}
          <div className="pl-2 border-l border-slate-200 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              {user?.full_name?.slice(0, 2).toUpperCase() || 'SR'}
            </div>
          </div>
        </div>
      </header>

      {showSearchModal && <GlobalSearchModal onClose={() => setShowSearchModal(false)} />}
      {showNotifications && <NotificationDrawer onClose={() => setShowNotifications(false)} />}
    </>
  );
}
