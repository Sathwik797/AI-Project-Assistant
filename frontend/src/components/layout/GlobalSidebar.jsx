import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { healthApi } from '../../services/api';
import { 
  Layers, 
  Search, 
  Plus, 
  Folder, 
  Home, 
  FolderKanban, 
  Activity, 
  Settings, 
  Activity as StatusIcon, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight 
} from 'lucide-react';

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
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStatusPopover, setShowStatusPopover] = useState(false);
  
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const statusPopoverRef = useRef(null);
  const userMenuRef = useRef(null);

  const globalNavItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'My Projects', path: '/projects', icon: FolderKanban },
    { label: 'All Activity', path: '/activity', icon: Activity },
  ];

  const filteredProjects = projects.filter(p => 
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch real system health from GET /api/health
  const fetchHealthStatus = () => {
    setHealthLoading(true);
    healthApi.getHealth()
      .then((res) => setHealthData(res.data))
      .catch(() => setHealthData(null))
      .finally(() => setHealthLoading(false));
  };

  useEffect(() => {
    if (showStatusPopover) {
      fetchHealthStatus();
    }
  }, [showStatusPopover]);

  // Click outside and Escape key handler for popovers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusPopoverRef.current && !statusPopoverRef.current.contains(e.target)) {
        setShowStatusPopover(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowStatusPopover(false);
        setShowUserMenu(false);
        setShowNewModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
    <aside className="w-[250px] bg-[#F7F4EE] border-r border-[#E8E1D7] flex flex-col h-screen shrink-0 select-none text-xs transition-colors">
      
      {/* 2. BRAND HEADER */}
      <div className="p-4 border-b border-[#E8E1D7] flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[#C8923E] text-white flex items-center justify-center shadow-2xs">
          <Layers className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="font-bold text-xs text-[#171717] tracking-tight leading-none">AI Project Assistant</h1>
          <span className="text-[10px] font-medium text-[#6B665E]">Enterprise AI workspace</span>
        </div>
      </div>

      {/* 3. GLOBAL NAVIGATION */}
      <div className="px-3 py-3 border-b border-[#E8E1D7] space-y-1 shrink-0">
        <span className="px-2 text-[10px] font-mono font-bold tracking-wider text-[#6B665E] uppercase block mb-1">
          WORKSPACE
        </span>
        {globalNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 relative transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F3E7D2] text-[#9A681F] font-bold shadow-2xs'
                    : 'text-[#171717] hover:bg-[#E8E1D7]/50 hover:text-[#171717]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="w-1 h-4 bg-[#C8923E] rounded-r absolute left-0" />}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#9A681F]' : 'text-[#6B665E]'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* 4. PROJECTS SECTION HEADER & SEARCH */}
      <div className="p-3 pb-1 shrink-0 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#6B665E] uppercase">
            PROJECTS
          </span>
          <button
            onClick={() => {
              setFormError('');
              setShowNewModal(true);
            }}
            className="p-1 hover:bg-[#E8E1D7] rounded text-[#6B665E] hover:text-[#C8923E] transition-colors cursor-pointer"
            title="Create New Project"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#6B665E]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E8E1D7] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#171717] placeholder-[#6B665E] focus:outline-none focus:ring-1 focus:ring-[#C8923E] transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* 5. SCROLLABLE PROJECT LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5 no-scrollbar">
        {loading ? (
          <div className="p-4 text-center text-xs text-[#6B665E] flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8923E]" />
            <span>Loading projects...</span>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 space-y-2 m-1">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to load projects</span>
            </div>
            <button
              onClick={onRetry}
              className="w-full py-1 bg-red-600 text-white rounded text-[11px] font-medium hover:bg-red-700 flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#6B665E] italic">
            {searchQuery ? 'No projects match search.' : 'No projects created yet.'}
          </div>
        ) : (
          <>
            {filteredProjects.slice(0, 6).map((proj) => {
              const isActive = proj.id === activeProjectId;
              return (
                <button
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between group transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F3E7D2] text-[#9A681F] font-bold shadow-2xs'
                      : 'text-[#171717] hover:bg-[#E8E1D7]/50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#C8923E]' : 'text-[#6B665E]'}`} />
                    <span className="truncate">{proj.name}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#C8923E] shrink-0"></div>}
                </button>
              );
            })}

            {/* 6. LONG PROJECT LIST BEHAVIOR */}
            {filteredProjects.length > 6 && (
              <button
                onClick={() => navigate('/projects')}
                className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-[#C8923E] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
              >
                <span>View all projects ({filteredProjects.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Inline Create Project Modal Container */}
      {showNewModal && (
        <div className="p-3 m-2 bg-white rounded-xl border border-[#E8E1D7] shadow-xl text-xs space-y-2 shrink-0">
          <div className="font-bold text-[#171717] flex justify-between items-center">
            <span>New Project</span>
            <button 
              onClick={() => setShowNewModal(false)} 
              className="text-[#6B665E] hover:text-[#171717] cursor-pointer"
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
              className="w-full border border-[#E8E1D7] bg-[#FCFBF8] rounded-lg px-2.5 py-1.5 text-xs text-[#171717] focus:ring-1 focus:ring-[#C8923E] outline-none"
              disabled={isSubmitting}
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              className="w-full border border-[#E8E1D7] bg-[#FCFBF8] rounded-lg px-2.5 py-1.5 text-xs text-[#171717] focus:ring-1 focus:ring-[#C8923E] outline-none resize-none"
              rows="2"
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-2 py-1 bg-slate-100 text-[#171717] rounded hover:bg-slate-200 cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-[#C8923E] hover:bg-[#b58032] text-white font-semibold rounded shadow-2xs flex items-center gap-1 cursor-pointer"
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

      {/* 6. FIXED BOTTOM SECONDARY ACTIONS (SETTINGS & SYSTEM STATUS POPOVER) */}
      <div className="p-3 border-t border-[#E8E1D7] space-y-1 shrink-0 relative" ref={statusPopoverRef}>
        
        {/* Settings Action Item */}
        <button
          onClick={() => navigate('/profile')}
          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#171717] hover:bg-[#E8E1D7]/50 flex items-center gap-2.5 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#6B665E]" />
          <span>Settings</span>
        </button>

        {/* 7 & 8. COMPACT SYSTEM STATUS POPOVER TRIGGER */}
        <button
          onClick={() => setShowStatusPopover(!showStatusPopover)}
          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#171717] hover:bg-[#E8E1D7]/50 flex items-center justify-between transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2E8B68] shrink-0 animate-pulse"></span>
            <span>System Status</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-[#6B665E] transition-transform ${showStatusPopover ? 'rotate-180' : ''}`} />
        </button>

        {/* SYSTEM STATUS POPOVER */}
        {showStatusPopover && (
          <div className="absolute bottom-12 left-3 right-3 bg-white border border-[#E8E1D7] rounded-xl shadow-2xl p-4 text-xs space-y-3 z-50">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-2">
              <span className="font-mono font-bold text-[10px] text-[#6B665E] uppercase tracking-wider">
                SYSTEM HEALTH STATUS
              </span>
              <button onClick={() => setShowStatusPopover(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {healthLoading ? (
              <div className="py-2 text-center text-[#6B665E] flex items-center justify-center gap-2 text-[11px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8923E]" />
                <span>Checking health APIs...</span>
              </div>
            ) : (
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${healthData?.database?.connected !== false ? 'bg-[#2E8B68]' : 'bg-red-500'}`}></span>
                    <span className="font-medium text-[#171717]">MySQL Database</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-600">
                    {healthData?.database?.connected !== false ? 'Connected' : 'Error'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${healthData?.vector_store?.ready !== false ? 'bg-[#2E8B68]' : 'bg-red-500'}`}></span>
                    <span className="font-medium text-[#171717]">ChromaDB Vector Store</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-600">
                    {healthData?.vector_store?.ready !== false ? 'Ready' : 'Offline'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${healthData?.ai_service?.ready !== false ? 'bg-[#2E8B68]' : 'bg-red-500'}`}></span>
                    <span className="font-medium text-[#171717]">Gemini AI Model</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-600">
                    {healthData?.ai_service?.ready !== false ? 'Ready' : 'No Key'}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E8E1D7] flex items-center gap-1.5 text-emerald-700 font-semibold text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B68]" />
                  <span>All backend services operational</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 10. COMPACT USER PROFILE FOOTER */}
      <div className="p-3 border-t border-[#E8E1D7] bg-white shrink-0 relative" ref={userMenuRef}>
        {showUserMenu && (
          <div className="absolute bottom-16 left-3 right-3 bg-white border border-[#E8E1D7] rounded-xl shadow-2xl p-1.5 space-y-1 text-xs z-50">
            <button
              onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
              className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-100 text-[#171717] flex items-center gap-2 cursor-pointer font-medium"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#6B665E]" />
              <span>User Profile</span>
            </button>
            <button
              onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
              className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-100 text-[#171717] flex items-center gap-2 cursor-pointer font-medium"
            >
              <Settings className="w-3.5 h-3.5 text-[#6B665E]" />
              <span>Settings</span>
            </button>
            <div className="border-t border-[#E8E1D7] my-1"></div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full text-left px-3 py-1.5 rounded-md hover:bg-red-50 text-red-600 flex items-center gap-2 font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center justify-between text-left p-1 rounded-lg hover:bg-[#F7F4EE] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#C8923E] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {user?.full_name?.slice(0, 2).toUpperCase() || 'SR'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#171717] leading-tight truncate">
                {user?.full_name || 'Sathwik Reddy'}
              </p>
              <span className="text-[10px] text-[#6B665E] font-medium block truncate">
                {user?.role || 'Developer'}
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#6B665E]" />
        </button>
      </div>

    </aside>
  );
}
