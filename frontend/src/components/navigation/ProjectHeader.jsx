import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import ProjectSettingsModal from '../modals/ProjectSettingsModal';

export default function ProjectHeader({ activeProject, onProjectUpdated }) {
  const [showSettings, setShowSettings] = useState(false);

  if (!activeProject) return null;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-2xs select-none transition-colors">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {activeProject.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {activeProject.description || 'Product intelligence & specification analysis workspace.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Project Settings</span>
          </button>
        </div>
      </div>

      {showSettings && (
        <ProjectSettingsModal
          activeProject={activeProject}
          onClose={() => setShowSettings(false)}
          onProjectUpdated={onProjectUpdated}
        />
      )}
    </>
  );
}
