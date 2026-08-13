import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { tasksApi } from '../services/api';
import AiReviewModal from '../components/modals/AiReviewModal';
import { Kanban, Plus, Sparkles, LayoutList, LayoutGrid, Loader2 } from 'lucide-react';

export default function Tasks() {
  const { activeProject, projectId } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('Unassigned');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To Do');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [aiDraft, setAiDraft] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchTasks = () => {
    if (!projectId) return;
    setLoading(true);
    tasksApi.getTasks(projectId)
      .then((res) => setTasks(res.data || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await tasksApi.createTask(projectId, {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        assignee: assignee.trim() || 'Unassigned',
      });
      setTitle('');
      setDescription('');
      setShowAddModal(false);
      fetchTasks();
    } catch {
      alert('Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksApi.updateTask(projectId, taskId, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch {
      alert('Failed to update task status.');
    }
  };

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await tasksApi.aiGenerate(projectId);
      setAiDraft(res.data.draft_task);
    } catch {
      alert('AI task generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptAiDraft = async (acceptedDraft) => {
    setIsSubmitting(true);
    try {
      const draftObj = typeof acceptedDraft === 'string' ? JSON.parse(acceptedDraft) : acceptedDraft;
      await tasksApi.createTask(projectId, {
        title: draftObj.title,
        description: draftObj.description,
        status: draftObj.status || 'To Do',
        priority: draftObj.priority || 'High',
        assignee: draftObj.assignee || 'Lead Engineer',
        task_code: draftObj.task_code
      });
      setAiDraft(null);
      fetchTasks();
    } catch {
      alert('Failed to save AI task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = ['To Do', 'In Progress', 'Review', 'Done'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Technical Task Workspace</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Engineering implementation tasks & sprint progress for <strong>{activeProject?.name || 'this project'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md flex items-center gap-1 font-semibold cursor-pointer ${viewMode === 'board' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md flex items-center gap-1 font-semibold cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-500'}`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={handleAiGenerate}
            disabled={isGenerating}
            className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Break Down Tasks with AI</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading tasks...</span>
        </div>
      ) : viewMode === 'board' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter(t => t.status === col);
            return (
              <div key={col} className="bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 space-y-3 flex flex-col min-h-[350px]">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{col}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {colTasks.map((t) => (
                    <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3 shadow-2xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-blue-600 font-bold">{t.task_code}</span>
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 outline-none"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Review">Review</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white leading-tight">{t.title}</p>
                      {t.description && <p className="text-[11px] text-slate-400 line-clamp-2">{t.description}</p>}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                        <span>{t.assignee}</span>
                        <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded text-[9px] font-bold">
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View Table */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Task Code</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] text-blue-600 font-bold">{t.task_code}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">{t.title}</td>
                  <td className="px-4 py-3.5">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-300 outline-none"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Done">Done</option>
                    </select>
                  </td>
                  <td className="px-4 py-3.5">{t.priority}</td>
                  <td className="px-4 py-3.5 text-slate-500">{t.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Create Technical Task</h4>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Configure CORS Middleware"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Assignee</label>
                <input
                  type="text"
                  placeholder="e.g. Sathwik Reddy"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows="3"
                  placeholder="Task engineering details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Review Modal */}
      {aiDraft && (
        <AiReviewModal
          title="Generated Task Draft"
          draftContent={aiDraft}
          onAccept={handleAcceptAiDraft}
          onRegenerate={handleAiGenerate}
          onClose={() => setAiDraft(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
