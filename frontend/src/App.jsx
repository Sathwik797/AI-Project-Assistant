import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppShell from './components/layout/AppShell';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import { projectsApi } from './services/api';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import Profile from './pages/auth/Profile';

import Overview from './pages/Overview';
import Assistant from './pages/Assistant';
import Documents from './pages/Documents';
import Requirements from './pages/Requirements';
import UserStories from './pages/UserStories';
import Tasks from './pages/Tasks';
import Conflicts from './pages/Conflicts';

import { Loader2, AlertCircle, RefreshCw, Zap, FolderKanban, Activity as ActivityIcon } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
    navigate(`/projects/${id}/assistant`);
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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
              <Navigate to={`/projects/${projects[0].id}/assistant`} replace />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-md shadow-2xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 mx-auto flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">No Projects Found</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Get started by creating your first project workspace.
                  </p>
                </div>
              </div>
            )
          }
        />

        <Route
          path="/projects"
          element={
            <div className="p-6 max-w-4xl mx-auto space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-blue-600" />
                <span>My Projects ({projects.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-xl p-5 shadow-2xs cursor-pointer transition-all space-y-2"
                  >
                    <h4 className="font-bold text-slate-900 dark:text-white">{p.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.description || 'No description provided.'}</p>
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ActivityIcon className="w-5 h-5 text-blue-600" />
                <span>Global Activity Log</span>
              </h3>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <p>✓ All project actions, RAG indexing triggers, and requirements analyses are tracked securely in MySQL.</p>
              </div>
            </div>
          }
        />

        <Route path="/profile" element={<Profile />} />

        <Route path="/projects/:projectId" element={<WorkspaceLayout />}>
          <Route index element={<Navigate to="assistant" replace />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="documents" element={<Documents />} />
          <Route path="overview" element={<Overview />} />
          <Route path="requirements" element={<Requirements />} />
          <Route path="user-stories" element={<UserStories />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="conflicts" element={<Conflicts />} />
        </Route>

        <Route
          path="*"
          element={
            projects.length > 0 ? (
              <Navigate to={`/projects/${projects[0].id}/assistant`} replace />
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/*"
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
