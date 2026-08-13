import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppShell from './components/layout/AppShell';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import { projectsApi } from './services/api';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import Profile from './pages/auth/Profile';

import Overview from './pages/Overview';
import Documents from './pages/Documents';
import Requirements from './pages/Requirements';
import UserStories from './pages/UserStories';
import Tasks from './pages/Tasks';
import Conflicts from './pages/Conflicts';

import { Loader2, Zap, FolderKanban, Activity as ActivityIcon } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FCFBF8] text-slate-500 text-xs gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#C8923E]" />
        <span>Authenticating...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function MainAppContent() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const match = location.pathname.match(/\/projects\/(\d+)/);
  const activeProjectId = match ? parseInt(match[1], 10) : null;

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.getProjects();
      setProjects(res.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to connect to FastAPI backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSelectProject = (id) => {
    navigate(`/projects/${id}/overview`);
  };

  const handleCreateProject = async ({ name, description }) => {
    const res = await projectsApi.createProject({ name, description });
    const newProj = res.data;
    setProjects([newProj, ...projects]);
    navigate(`/projects/${newProj.id}/overview`);
    return newProj;
  };

  if (loading && projects.length === 0 && !error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FCFBF8] text-slate-500 text-xs gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#C8923E]" />
        <span>Connecting to AI Project Assistant backend...</span>
      </div>
    );
  }

  return (
    <AppShell
      projects={projects}
      activeProjectId={activeProjectId}
      loading={loading}
      error={error}
      onSelectProject={handleSelectProject}
      onCreateProject={handleCreateProject}
      onRetry={fetchProjects}
    >
      <Routes>
        <Route
          path="/"
          element={
            projects.length > 0 ? (
              <Navigate to={`/projects/${projects[0].id}/overview`} replace />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#FCFBF8] p-6 text-center">
                <div className="bg-white border border-[#E8E1D7] rounded-xl p-8 max-w-md shadow-2xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-[#C8923E] mx-auto flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#171717]">No Projects Found</h3>
                  <p className="text-xs text-[#666666]">
                    Get started by creating your first project workspace.
                  </p>
                </div>
              </div>
            )
          }
        />

        <Route
          path="/list"
          element={
            <div className="p-6 max-w-4xl mx-auto space-y-4">
              <h3 className="text-lg font-bold text-[#171717] flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#C8923E]" />
                <span>My Projects ({projects.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="bg-white border border-[#E8E1D7] hover:border-[#C8923E] rounded-xl p-5 shadow-2xs cursor-pointer transition-all space-y-2"
                  >
                    <h4 className="font-bold text-[#171717]">{p.name}</h4>
                    <p className="text-xs text-[#666666] line-clamp-2">{p.description || 'No description provided.'}</p>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        <Route
          path="/activity"
          element={
            <div className="p-6 max-w-4xl mx-auto space-y-4">
              <h3 className="text-lg font-bold text-[#171717] flex items-center gap-2">
                <ActivityIcon className="w-5 h-5 text-[#C8923E]" />
                <span>Global Activity Log</span>
              </h3>
              <div className="bg-white border border-[#E8E1D7] rounded-xl p-6 text-xs text-[#666666] space-y-2">
                <p>✓ All project actions, RAG indexing triggers, and requirements analyses are tracked securely in MySQL.</p>
              </div>
            </div>
          }
        />

        <Route path="/profile" element={<Profile />} />

        <Route path="/:projectId" element={<WorkspaceLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="documents" element={<Documents />} />
          <Route path="requirements" element={<Requirements />} />
          <Route path="user-stories" element={<UserStories />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="conflicts" element={<Conflicts />} />
        </Route>

        <Route
          path="*"
          element={
            projects.length > 0 ? (
              <Navigate to={`/projects/${projects[0].id}/overview`} replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page Route */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Application & Workspace Routes */}
            <Route
              path="/projects/*"
              element={
                <ProtectedRoute>
                  <MainAppContent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <MainAppContent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainAppContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
