import React from 'react';
import { Sparkles, Settings, Search, Sun, Bell, User } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function Header({ activeProject }) {
  return (
    <header className="bg-white border-b border-slate-200/90 px-6 py-3 flex items-center justify-between shadow-2xs shrink-0 select-none">
      {/* Active Project Title & Description */}
      <div className="min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight truncate">
            {activeProject ? activeProject.name : 'No Project Selected'}
          </h2>
        </div>
        <p className="text-[11px] text-slate-500 truncate max-w-md mt-0.5">
          {activeProject?.description || 'Enterprise project intelligence & document analysis workspace.'}
        </p>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-xs mx-4">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, documents, requirements..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Header Actions & Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status="ready" label="● AI Ready" />

        <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="Toggle Theme">
          <Sun className="w-4 h-4" />
        </button>

        <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="Notifications">
          <Bell className="w-4 h-4" />
        </button>

        <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="Settings">
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Avatar Pill */}
        <div className="pl-2 border-l border-slate-200 flex items-center gap-2 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-2xs">
            SR
          </div>
        </div>
      </div>
    </header>
  );
}
