import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import GlobalHeader from '../components/layout/GlobalHeader';
import ProjectHeader from '../components/navigation/ProjectHeader';
import ProjectNavigation from '../components/navigation/WorkspaceNavigation';
import FloatingAiCopilot from '../components/copilot/FloatingAiCopilot';
import { projectsApi } from '../services/api';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function WorkspaceLayout() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const currentProjectId = parseInt(projectId, 10);

  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!currentProjectId || isNaN(currentProjectId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setNotFound(false);

    projectsApi.getProject(currentProjectId)
      .then((res) => {
        if (isMounted) {
          setActiveProject(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (err.response && err.response.status === 404) {
            setNotFound(true);
          } else {
            setError(err.response?.data?.detail || 'Unable to load project workspace.');
          }
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentProjectId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FCFBF8] text-slate-500 text-xs gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#C8923E]" />
        <span>Loading project workspace...</span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FCFBF8] p-6 text-center">
        <div className="bg-white border border-[#E8E1D7] rounded-xl p-8 max-w-md shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-[#C8923E] mx-auto flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#171717]">Project Not Found</h3>
          <p className="text-xs text-[#666666]">
            The requested project (ID: {projectId}) could not be found or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-3.5 py-1.5 bg-[#C8923E] hover:bg-[#b58032] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FCFBF8] p-6 text-center">
        <div className="bg-white border border-[#E8E1D7] rounded-xl p-8 max-w-md shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#171717]">Connection Error</h3>
          <p className="text-xs text-[#666666]">{error}</p>
          <button
            onClick={() => navigate(0)}
            className="px-3.5 py-1.5 bg-[#C8923E] hover:bg-[#b58032] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FCFBF8] transition-colors relative">
      <GlobalHeader activeProject={activeProject} />
      <ProjectHeader
        activeProject={activeProject}
        onProjectUpdated={(updated) => setActiveProject(updated)}
      />
      <ProjectNavigation projectId={currentProjectId} />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <Outlet context={{ activeProject, projectId: currentProjectId }} />
        </div>
      </main>

      {/* Global Floating AI Copilot */}
      <FloatingAiCopilot activeProject={activeProject} projectId={currentProjectId} />
    </div>
  );
}
