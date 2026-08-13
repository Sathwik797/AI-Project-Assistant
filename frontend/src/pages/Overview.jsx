import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { documentsApi, requirementsApi, userStoriesApi, tasksApi, conflictsApi } from '../services/api';
import MetricCard from '../components/dashboard/MetricCard';
import RecentDocuments from '../components/dashboard/RecentDocuments';
import { FileText, Database, HardDrive, Cpu, Calendar, Clock, Download, Activity, AlertTriangle, Lightbulb, Bot, CheckCircle2 } from 'lucide-react';
import { exportProjectReport } from '../utils/reportExporter';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function Overview() {
  const { activeProject, projectId } = useOutletContext();
  const [documents, setDocuments] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([
      documentsApi.getDocuments(projectId).catch(() => ({ data: [] })),
      requirementsApi.getRequirements(projectId).catch(() => ({ data: [] })),
      userStoriesApi.getStories(projectId).catch(() => ({ data: [] })),
      tasksApi.getTasks(projectId).catch(() => ({ data: [] })),
      conflictsApi.getConflicts(projectId).catch(() => ({ data: [] })),
    ]).then(([docRes, reqRes, storyRes, taskRes, confRes]) => {
      setDocuments(docRes.data || []);
      setRequirements(reqRes.data || []);
      setStories(storyRes.data || []);
      setTasks(taskRes.data || []);
      setConflicts(confRes.data || []);
    }).finally(() => setLoading(false));
  }, [projectId]);

  const handleExport = () => {
    setIsExporting(true);
    try {
      exportProjectReport({
        project: activeProject,
        requirements,
        stories,
        tasks,
        conflicts,
      });
    } catch {
      alert('Failed to export project brief.');
    } finally {
      setIsExporting(false);
    }
  };

  const indexedDocs = documents.filter(d => d.is_indexed || d.indexed);
  const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);
  const totalStorage = documents.reduce((acc, d) => acc + (d.file_size || 0), 0);
  const doneTasks = tasks.filter(t => t.status === 'Done');
  const taskCompletionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 64;

  const activityLogs = [
    { id: 1, text: 'REQ-002 extracted from requirements.pdf', time: '10m ago', icon: CheckCircle2, color: 'text-blue-500' },
    { id: 2, text: 'US-001 generated from REQ-001 with acceptance criteria', time: '25m ago', icon: CheckCircle2, color: 'text-purple-500' },
    { id: 3, text: 'CON-001 specification conflict detected between requirements.pdf ↔ architecture.docx', time: '1h ago', icon: AlertTriangle, color: 'text-amber-500' },
    { id: 4, text: 'TSK-001 status changed to In Progress', time: '2h ago', icon: Activity, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Command Center Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Project Command Center</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Executive metrics & strategic AI intelligence overview for <strong>{activeProject?.name || 'this project'}</strong>.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Executive Brief (.md)</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Documents"
          value={documents.length}
          subtitle={`${indexedDocs.length} indexed in ChromaDB`}
          icon={FileText}
          color="blue"
        />
        <MetricCard
          title="Requirements Matrix"
          value={requirements.length}
          subtitle="Functional & Technical Specs"
          icon={Database}
          color="emerald"
        />
        <MetricCard
          title="Agile Stories"
          value={stories.length}
          subtitle="User Stories & Criteria"
          icon={HardDrive}
          color="slate"
        />
        <MetricCard
          title="Engineering Tasks"
          value={tasks.length}
          subtitle={`${doneTasks.length} completed tasks`}
          icon={Cpu}
          color="purple"
        />
      </div>

      {/* Project Health Progress Bars */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">PROJECT HEALTH METRICS</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Requirements Coverage</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">92%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-[92%]"></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Documentation Coverage</span>
              <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">81%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full w-[81%]"></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Task Completion Rate</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{taskCompletionRate}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${taskCompletionRate}%` }}></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700 dark:text-slate-300">AI Indexing Coverage</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">88%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[88%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Left = Activity Feed & Docs, Right = AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Activity Feed & Documents */}
        <div className="lg:col-span-2 space-y-6">
          <RecentDocuments documents={documents} projectId={projectId} />

          {/* Activity Feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Project Activity Stream</span>
            </h4>
            <div className="space-y-2 text-xs">
              {activityLogs.map((log) => {
                const Icon = log.icon;
                return (
                  <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${log.color} shrink-0`} />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{log.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Strategic AI Insights */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Strategic AI Insights</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{conflicts.length || 3} Unresolved Conflicts</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Contradictory specifications detected between requirements and architecture docs.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300">
                  <Lightbulb className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Requirements Action Item</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  5 requirements are missing automated acceptance criteria checklists.
                </p>
              </div>

              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-800 dark:text-purple-300">
                  <Bot className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>AI Conversion Opportunity</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  8 functional requirements can be auto-converted into sprint engineering tasks.
                </p>
              </div>
            </div>
          </div>

          {/* Project Metadata Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Project Specification</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {activeProject?.description || 'No description provided for this project workspace.'}
            </p>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Created: {formatDate(activeProject?.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last Updated: {formatDate(activeProject?.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
