import React, { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { 
  Zap, 
  Search, 
  Plus, 
  Folder, 
  Database, 
  Cpu, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  LayoutDashboard,
  Bot,
  FileText,
  ListCheck,
  UserCheck,
  Kanban,
  AlertTriangle
} from 'lucide-react';

export default function Sidebar({ 
  projects = [], 
  activeProjectId, 
  loading = false, 
  error = null, 
  onSelectProject, 
  onCreateProject,
  onRetry 
}) {
  const { projectId } = useParams();
  const currentProjectId = parseInt(projectId || activeProjectId, 10) || 1;

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const workspaceNavItems = [
    { label: 'Dashboard', path: `/projects/${currentProjectId}/overview`, icon: LayoutDashboard },
    { label: 'AI Assistant', path: `/projects/${currentProjectId}/assistant`, icon: Bot },
    { label: 'Documents', path: `/projects/${currentProjectId}/documents`, icon: FileText },
    { label: 'Requirements', path: `/projects/${currentProjectId}/requirements`, icon: ListCheck },
    { label: 'User Stories', path: `/projects/${currentProjectId}/user-stories`, icon: UserCheck },
    { label: 'Tasks', path: `/projects/${currentProjectId}/tasks`, icon: Kanban },
    { label: 'Conflicts', path: `/projects/${currentProjectId}/conflicts`, icon: AlertTriangle },
  ];

  const filteredProjects = projects.filter(p => 
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const cleanName = newProjectName.trim();
    if (!cleanName) {
      setFormError('Project name is required.');
      return;
    }
    if (cleanName.length > 100) {
      setFormError('Project name must be 100 characters or fewer.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      await onCreateProject({ 
        name: cleanName, 
        description: newProjectDesc.trim() || null
      });
      setNewProjectName('');
      setNewProjectDesc('');
      setShowNewModal(false);
    } catch (err) {
      const apiMsg = err.response?.data?.detail || 'Failed to create project.';
      setFormError(apiMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="w-64 bg-slate-100/90 border-r border-slate-200/90 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-2xs">
          <Zap className="w-4 h-4 fill-white" />
        </div>
        <div>
          <h1 className="font-bold text-xs text-slate-900 tracking-tight leading-none">AI Project Assistant</h1>
          <span className="text-[10px] font-medium text-slate-500">AI-powered project workspace</span>
        </div>
      </div>

      {/* Main Workspace Navigation */}
      <div className="px-2 py-3 border-b border-slate-200/80 space-y-0.5">
        <span className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
          Workspace Navigation
        </span>
        {workspaceNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Projects Header & Search */}
      <div className="p-3 pb-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Projects</span>
          <button
            onClick={() => {
              setFormError('');
              setShowNewModal(true);
            }}
            className="p-1 hover:bg-slate-200/70 rounded text-slate-500 hover:text-blue-600 transition-colors"
            title="Create New Project"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-md pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Projects List Container */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {loading ? (
          <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Loading projects...</span>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 m-2 space-y-2">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to load projects</span>
            </div>
            <button
              onClick={onRetry}
              className="w-full py-1 bg-red-600 text-white rounded text-[11px] font-medium hover:bg-red-700 flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 italic">
            {searchQuery ? 'No projects match filter.' : 'No projects created yet.'}
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const isActive = proj.id === currentProjectId;
            return (
              <button
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between group transition-all ${
                  isActive
                    ? 'bg-blue-100/70 text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600 fill-blue-100' : 'text-slate-400'}`} />
                  <span className="truncate">{proj.name}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></div>}
              </button>
            );
          })
        )}
      </div>

      {/* New Project Modal Inline */}
      {showNewModal && (
        <div className="p-3 m-2 bg-white rounded-lg border border-slate-200 shadow-sm text-xs space-y-2">
          <div className="font-semibold text-slate-900 flex justify-between items-center">
            <span>New Project</span>
            <button 
              onClick={() => setShowNewModal(false)} 
              className="text-slate-400 hover:text-slate-600"
              disabled={isSubmitting}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {formError && (
            <div className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded text-[11px]">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-2">
            <input
              type="text"
              placeholder="Project name *"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              disabled={isSubmitting}
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              rows="2"
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 flex items-center gap-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fixed System Status Footer */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-100/50 space-y-1 text-[11px]">
        <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">System Status</span>
        <div className="flex items-center justify-between text-slate-600">
          <span>MySQL</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Connected</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Vector Store</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-500" />
            <span>Ready</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Gemini AI</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-500" />
            <span>Ready</span>
          </span>
        </div>
      </div>

      {/* User Profile Area */}
      <div className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
          SR
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 leading-tight truncate">Sathwik Reddy</p>
          <span className="text-[10px] text-slate-400 font-medium block">Lead Developer</span>
        </div>
      </div>
    </aside>
  );
}
