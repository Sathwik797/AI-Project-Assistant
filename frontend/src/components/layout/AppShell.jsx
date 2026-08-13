import React from 'react';
import GlobalSidebar from './GlobalSidebar';

export default function AppShell({ 
  projects, 
  activeProjectId, 
  loading, 
  error, 
  onSelectProject, 
  onCreateProject, 
  onRetry, 
  children 
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <GlobalSidebar
        projects={projects}
        activeProjectId={activeProjectId}
        loading={loading}
        error={error}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
        onRetry={onRetry}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
