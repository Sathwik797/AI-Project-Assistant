import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { requirementsApi } from '../services/api';
import AiReviewModal from '../components/modals/AiReviewModal';
import { ListCheck, Plus, Sparkles, Filter, Loader2, CheckCircle2 } from 'lucide-react';

export default function Requirements() {
  const { activeProject, projectId } = useOutletContext();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [reqType, setReqType] = useState('Functional');
  const [priority, setPriority] = useState('High');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [aiDraft, setAiDraft] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchRequirements = () => {
    if (!projectId) return;
    setLoading(true);
    requirementsApi.getRequirements(projectId)
      .then((res) => setRequirements(res.data || []))
      .catch(() => setRequirements([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequirements();
  }, [projectId]);

  const filteredRequirements = requirements.filter(r => 
    filterType === 'All' || r.req_type === filterType
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await requirementsApi.createRequirement(projectId, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        req_type: reqType,
      });
      setTitle('');
      setDescription('');
      setShowAddModal(false);
      fetchRequirements();
    } catch {
      alert('Failed to create requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiExtract = async () => {
    setIsGenerating(true);
    try {
      const res = await requirementsApi.aiGenerate(projectId);
      setAiDraft(res.data.draft_requirement);
    } catch {
      alert('AI requirement extraction failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptAiDraft = async (acceptedDraft) => {
    setIsSubmitting(true);
    try {
      const draftObj = typeof acceptedDraft === 'string' ? JSON.parse(acceptedDraft) : acceptedDraft;
      await requirementsApi.createRequirement(projectId, {
        title: draftObj.title,
        description: draftObj.description,
        priority: draftObj.priority || 'High',
        req_type: draftObj.req_type || 'Functional',
        req_code: draftObj.req_code,
      });
      setAiDraft(null);
      fetchRequirements();
    } catch {
      alert('Failed to save AI requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Requirements Matrix</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage functional, technical, and business specifications for <strong>{activeProject?.name || 'this project'}</strong>.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleAiExtract}
            disabled={isGenerating}
            className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Extract Requirements with AI</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Requirement</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-500">Filter:</span>
        {['All', 'Functional', 'Technical', 'Non-functional'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterType === t
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Requirement Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading requirements...</span>
          </div>
        ) : filteredRequirements.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-2">
            <ListCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No requirements found matching current filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-4 py-3">Requirement Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                {filteredRequirements.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-blue-600 font-bold">{r.req_code}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                      <div>{r.title}</div>
                      {r.description && <p className="text-[11px] text-slate-400 font-normal mt-0.5 line-clamp-1">{r.description}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{r.req_type}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded text-[10px] font-bold">
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{r.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Add Requirement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Create Requirement</h4>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Requirement Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Grounded RAG Document Retrieval"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Type</label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none"
                  >
                    <option value="Functional">Functional</option>
                    <option value="Technical">Technical</option>
                    <option value="Non-functional">Non-functional</option>
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
                <label className="font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows="3"
                  placeholder="Detailed requirement specifications..."
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
                  Save Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Review Modal */}
      {aiDraft && (
        <AiReviewModal
          title="Extracted Requirement Draft"
          draftContent={aiDraft}
          onAccept={handleAcceptAiDraft}
          onRegenerate={handleAiExtract}
          onClose={() => setAiDraft(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
