import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { documentsApi } from '../services/api';
import MetricCard from '../components/dashboard/MetricCard';
import RecentDocuments from '../components/dashboard/RecentDocuments';
import ProjectInsights from '../components/dashboard/ProjectInsights';
import { FileText, Database, HardDrive, Cpu, Calendar, Clock } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    documentsApi.getDocuments(projectId)
      .then((res) => setDocuments(res.data || []))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  const indexedDocs = documents.filter(d => d.indexed);
  const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);
  const totalStorage = documents.reduce((acc, d) => acc + (d.file_size || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Top Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Project Dashboard</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Enterprise intelligence & knowledge base overview for <strong>{activeProject?.name || 'this project'}</strong>.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Documents"
          value={documents.length}
          subtitle="Uploaded knowledge sources"
          icon={FileText}
          color="blue"
        />
        <MetricCard
          title="Indexed Documents"
          value={indexedDocs.length}
          subtitle="Ready for vector QA"
          icon={Database}
          color="emerald"
        />
        <MetricCard
          title="Storage Used"
          value={formatBytes(totalStorage)}
          subtitle="Physical disk storage"
          icon={HardDrive}
          color="slate"
        />
        <MetricCard
          title="Knowledge Chunks"
          value={totalChunks}
          subtitle="Indexed ChromaDB embeddings"
          icon={Cpu}
          color="purple"
        />
      </div>

      {/* Two-Column Workspace Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentDocuments documents={documents} projectId={projectId} />
        </div>
        <div>
          <ProjectInsights project={activeProject} documents={documents} projectId={projectId} />
        </div>
      </div>

      {/* Project Metadata Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3 transition-colors">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Project Specification Summary</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {activeProject?.description || 'No description provided for this project workspace.'}
        </p>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
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
  );
}
