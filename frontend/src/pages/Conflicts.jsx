import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { conflictsApi } from '../services/api';
import AiReviewModal from '../components/modals/AiReviewModal';
import { AlertTriangle, Plus, Sparkles, ShieldAlert, FileText, CheckCircle2, Loader2 } from 'lucide-react';

export default function Conflicts() {
  const { activeProject, projectId } = useOutletContext();
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('');
  const [sourceA, setSourceA] = useState('');
  const [sourceB, setSourceB] = useState('');
  const [resolution, setResolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [aiDraft, setAiDraft] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchConflicts = () => {
    if (!projectId) return;
    setLoading(true);
    conflictsApi.getConflicts(projectId)
      .then((res) => setConflicts(res.data || []))
      .catch(() => setConflicts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConflicts();
  }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      await conflictsApi.createConflict(projectId, {
        title: title.trim(),
        severity,
        description: description.trim(),
        source_a: sourceA.trim() || null,
        source_b: sourceB.trim() || null,
        resolution: resolution.trim() || null,
      });
      setTitle('');
      setDescription('');
      setSourceA('');
      setSourceB('');
      setResolution('');
      setShowAddModal(false);
      fetchConflicts();
    } catch {
      alert('Failed to report conflict.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiScan = async () => {
    setIsGenerating(true);
    try {
      const res = await conflictsApi.aiScan(projectId);
      setAiDraft(res.data.draft_conflict);
    } catch {
      alert('AI conflict scanning failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptAiDraft = async (acceptedDraft) => {
    setIsSubmitting(true);
    try {
      const draftObj = typeof acceptedDraft === 'string' ? JSON.parse(acceptedDraft) : acceptedDraft;
      await conflictsApi.createConflict(projectId, {
        title: draftObj.title,
        severity: draftObj.severity || 'Medium',
        description: draftObj.description,
        source_a: draftObj.source_a,
        source_b: draftObj.source_b,
        resolution: draftObj.resolution
      });
      setAiDraft(null);
      fetchConflicts();
    } catch {
      alert('Failed to save AI conflict.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Conflict & Ambiguity Detection</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identify specification contradictions, missing info, and ambiguous requirements for <strong>{activeProject?.name || 'this project'}</strong>.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleAiScan}
            disabled={isGenerating}
            className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            <span>Analyze Project for Conflicts</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Conflict</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading conflicts...</span>
        </div>
      ) : conflicts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400 space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <p>No requirement conflicts or ambiguities detected in this project workspace.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conflicts.map((c) => (
            <div key={c.id} className="bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{c.title}</h4>
                </div>
                <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full text-[10px] font-bold">
                  {c.severity} Severity
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{c.description}</p>

              {(c.source_a || c.source_b) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Specification Source A</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>{c.source_a || 'Document A'}</span>
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Specification Source B</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      <span>{c.source_b || 'Document B'}</span>
                    </p>
                  </div>
                </div>
              )}

              {c.resolution && (
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 rounded-lg text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                  <span className="font-bold text-[10px] uppercase text-emerald-700 dark:text-emerald-400 block">Suggested Resolution</span>
                  <p>{c.resolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Manual Add Conflict Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Report Requirement Conflict</h4>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Conflict Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Specification File Size Discrepancy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Source A</label>
                  <input
                    type="text"
                    placeholder="e.g. spec.docx"
                    value={sourceA}
                    onChange={(e) => setSourceA(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Source B</label>
                  <input
                    type="text"
                    placeholder="e.g. architecture.txt"
                    value={sourceB}
                    onChange={(e) => setSourceB(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Description *</label>
                <textarea
                  rows="3"
                  placeholder="Detailed conflict analysis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Suggested Resolution</label>
                <input
                  type="text"
                  placeholder="e.g. Harmonize file size limit to 15MB"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none"
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
                  Save Conflict
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Review Modal */}
      {aiDraft && (
        <AiReviewModal
          title="Detected Conflict Analysis Draft"
          draftContent={aiDraft}
          onAccept={handleAcceptAiDraft}
          onRegenerate={handleAiScan}
          onClose={() => setAiDraft(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
