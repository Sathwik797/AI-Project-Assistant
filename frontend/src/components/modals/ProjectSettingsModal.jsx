import React, { useState } from 'react';
import { Sliders, X, Trash2, Loader2, Save, AlertTriangle } from 'lucide-react';
import { projectsApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function ProjectSettingsModal({ activeProject, onClose, onProjectUpdated }) {
  const [name, setName] = useState(activeProject?.name || '');
  const [description, setDescription] = useState(activeProject?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name cannot be empty.');
      return;
    }
    setError('');
    setIsSaving(true);

    try {
      const res = await projectsApi.updateProject(activeProject.id, {
        name: name.trim(),
        description: description.trim() || null,
      });
      onProjectUpdated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update project settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await projectsApi.deleteProject(activeProject.id);
      onClose();
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete project.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Project Workspace Settings</h4>
              <span className="text-[11px] text-slate-400">Manage project metadata & status</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs">
            {error}
          </div>
        )}

        {showConfirmDelete ? (
          /* Delete Confirmation View */
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Confirm Project Deletion</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Are you sure you want to delete <strong>{activeProject.name}</strong>? This action cannot be undone and will delete all associated documents, vector chunks, requirements, and tasks.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 bg-red-600 text-white rounded font-semibold hover:bg-red-700 flex items-center gap-1"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Project Permanently</span>
              </button>
            </div>
          </div>
        ) : (
          /* Settings Edit Form */
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Project Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Project Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none resize-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 font-semibold inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Workspace</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 inline-flex items-center gap-1.5 shadow-2xs"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
