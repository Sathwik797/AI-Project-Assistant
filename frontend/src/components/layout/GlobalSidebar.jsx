import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Zap, 
  Search, 
  Plus, 
  Folder, 
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  Home,
  FolderKanban,
  Activity,
  User as UserIcon,
  Moon,
  Sun,
  LogOut,
  ChevronDown
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function GlobalSidebar({ 
  projects = [], 
  activeProjectId, 
  loading = false, 
  error = null, 
  onSelectProject, 
  onCreateProject,
  onRetry 
}) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const globalNavItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'My Projects', path: '/projects', icon: FolderKanban },
    { label: 'All Activity', path: '/activity', icon: Activity },
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
    <aside className="w-64 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 select-none transition-colors">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-2xs">
          <Zap className="w-4 h-4 fill-white" />
        </div>
        <div>
          <h1 className="font-bold text-xs text-slate-900 dark:text-white tracking-tight leading-none">AI Project Assistant</h1>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Enterprise AI workspace</span>
        </div>
      </div>

      {/* Global Navigation */}
      <div className="px-2 py-3 border-b border-slate-200 dark:border-slate-800 space-y-0.5">
        <span className="px-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">
          GLOBAL NAVIGATION
        </span>
        {globalNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Projects Section Header & Search */}
      <div className="p-3 pb-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">PROJECTS</span>
          <button
            onClick={() => {
              setFormError('');
              setShowNewModal(true);
            }}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-blue-600 transition-colors"
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
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-8 pr-3 py-1 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Real Projects List Container */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {loading ? (
          <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Loading projects...</span>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400 m-2 space-y-2">
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
          <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 italic">
            {searchQuery ? 'No projects match filter.' : 'No projects created yet.'}
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            return (
              <button
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between group transition-all ${
                  isActive
                    ? 'bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span className="truncate">{proj.name}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0"></div>}
              </button>
            );
          })
        )}
      </div>

      {/* Inline New Project Modal */}
      {showNewModal && (
        <div className="p-3 m-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg text-xs space-y-2">
          <div className="font-semibold text-slate-900 dark:text-white flex justify-between items-center">
            <span>New Project</span>
            <button 
              onClick={() => setShowNewModal(false)} 
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              disabled={isSubmitting}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {formError && (
            <div className="p-1.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded text-[11px]">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-2">
            <input
              type="text"
              placeholder="Project name *"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
              disabled={isSubmitting}
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              rows="2"
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200"
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
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 space-y-1.5 text-[11px]">
        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block text-[10px]">SYSTEM STATUS</span>
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>MySQL</span>
          <StatusBadge status="connected" label="Connected" />
        </div>
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>Vector Store</span>
          <StatusBadge status="ready" label="Ready" />
        </div>
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>Gemini AI</span>
          <StatusBadge status="ready" label="Ready" />
        </div>
      </div>

      {/* User Profile Footer & Popover Dropdown */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
        {showUserMenu && (
          <div className="absolute bottom-16 left-3 right-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 space-y-1 text-xs z-50">
            <button
              onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
              className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>User Profile</span>
            </button>
            <button
              onClick={() => { toggleTheme(); }}
              className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full text-left px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-2 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center justify-between text-left p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {user?.full_name?.slice(0, 2).toUpperCase() || 'SR'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate">
                {user?.full_name || 'Sathwik Reddy'}
              </p>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block truncate">
                {user?.role || 'Developer'}
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </aside>
  );
}
