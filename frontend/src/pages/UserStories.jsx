import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { userStoriesApi } from '../services/api';
import AiReviewModal from '../components/modals/AiReviewModal';
import { UserCheck, Plus, Sparkles, CheckSquare, Loader2, Link2, ArrowRight } from 'lucide-react';

export default function UserStories() {
  const { activeProject, projectId } = useOutletContext();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [userRole, setUserRole] = useState('Product Manager');
  const [goal, setGoal] = useState('');
  const [benefit, setBenefit] = useState('');
  const [criteria, setCriteria] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [aiDraft, setAiDraft] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchStories = () => {
    if (!projectId) return;
    setLoading(true);
    userStoriesApi.getStories(projectId)
      .then((res) => setStories(res.data || []))
      .catch(() => setStories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStories();
  }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !goal.trim()) return;
    setIsSubmitting(true);
    try {
      await userStoriesApi.createStory(projectId, {
        title: title.trim(),
        user_role: userRole.trim(),
        goal: goal.trim(),
        benefit: benefit.trim() || 'Improve workflow efficiency',
        acceptance_criteria: criteria.trim() || null,
        priority: 'High'
      });
      setTitle('');
      setGoal('');
      setBenefit('');
      setCriteria('');
      setShowAddModal(false);
      fetchStories();
    } catch {
      alert('Failed to create user story.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await userStoriesApi.aiGenerate(projectId);
      setAiDraft(res.data.draft_story);
    } catch {
      alert('AI story generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptAiDraft = async (acceptedDraft) => {
    setIsSubmitting(true);
    try {
      const draftObj = typeof acceptedDraft === 'string' ? JSON.parse(acceptedDraft) : acceptedDraft;
      await userStoriesApi.createStory(projectId, {
        title: draftObj.title,
        user_role: draftObj.user_role || 'Product Manager',
        goal: draftObj.goal || 'Query project specifications',
        benefit: draftObj.benefit || 'Accelerate project delivery',
        acceptance_criteria: draftObj.acceptance_criteria,
        priority: draftObj.priority || 'High',
        story_code: draftObj.story_code
      });
      setAiDraft(null);
      fetchStories();
    } catch {
      alert('Failed to save AI user story.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Agile User Stories & Traceability</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Structured user stories & acceptance criteria linked to requirements for <strong>{activeProject?.name || 'this project'}</strong>.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleAiGenerate}
            disabled={isGenerating}
            className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Generate Stories with AI</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New User Story</span>
          </button>
        </div>
      </div>

      {/* User Story Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading user stories...</span>
        </div>
      ) : stories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400 space-y-2">
          <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
          <p>No user stories created yet for this project workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map((s, idx) => (
            <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blue-600 font-bold">{s.story_code}</span>
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded text-[10px] font-bold">
                    {s.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{s.title}</h4>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-xs text-slate-800 dark:text-slate-200 space-y-1">
                  <p><strong>As a</strong> {s.user_role}</p>
                  <p><strong>I want</strong> {s.goal}</p>
                  <p><strong>So that</strong> {s.benefit}</p>
                </div>

                {/* Requirement Linkage Stream */}
                <div className="p-2 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 rounded-md flex items-center justify-between font-mono text-[10px] text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-1 font-bold">
                    <Link2 className="w-3 h-3 text-blue-600" />
                    <span>REQ-00{idx + 1}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-blue-400" />
                  <span className="font-bold">{s.story_code}</span>
                  <ArrowRight className="w-3 h-3 text-blue-400" />
                  <span className="font-bold text-slate-600 dark:text-slate-400">Tasks Linked</span>
                </div>
              </div>

              {s.acceptance_criteria && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <span className="font-bold text-[11px] text-slate-400 uppercase block">Acceptance Criteria</span>
                  <div className="flex items-start gap-1.5 text-[11px] font-mono whitespace-pre-wrap">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{s.acceptance_criteria}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Manual Add User Story Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Create Agile User Story</h4>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Story Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Grounded Document RAG Querying"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">As a [User Role] *</label>
                <input
                  type="text"
                  placeholder="e.g. Product Manager"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">I want [Goal] *</label>
                <textarea
                  rows="2"
                  placeholder="e.g. query project documents using AI..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">So that [Benefit]</label>
                <input
                  type="text"
                  placeholder="e.g. accelerate requirements verification"
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Acceptance Criteria</label>
                <textarea
                  rows="2"
                  placeholder="e.g. 1. Document is indexed. 2. Sources return similarity scores."
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none resize-none font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  Save User Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Review Modal */}
      {aiDraft && (
        <AiReviewModal
          title="Generated User Story Draft"
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
