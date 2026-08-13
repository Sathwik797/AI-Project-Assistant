import React, { useState } from 'react';
import { Sparkles, CheckCircle2, RotateCw, Trash2, Edit3, X } from 'lucide-react';

export default function AiReviewModal({ title, draftContent, onAccept, onRegenerate, onClose, isSubmitting }) {
  const [editedContent, setEditedContent] = useState(draftContent);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onAccept(editedContent);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h4>
                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded text-[10px] font-semibold">
                  AI Generated Draft
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Review, edit, or regenerate before saving to project workspace.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto space-y-3 text-xs">
          {isEditing ? (
            <textarea
              rows="8"
              value={typeof editedContent === 'string' ? editedContent : JSON.stringify(editedContent, null, 2)}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            />
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-slate-200 space-y-2 whitespace-pre-wrap leading-relaxed">
              {typeof editedContent === 'string' ? editedContent : (
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{editedContent.title}</p>
                  {editedContent.description && <p>{editedContent.description}</p>}
                  {editedContent.goal && <p><strong>Goal:</strong> {editedContent.goal}</p>}
                  {editedContent.benefit && <p><strong>Benefit:</strong> {editedContent.benefit}</p>}
                  {editedContent.acceptance_criteria && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <strong>Acceptance Criteria:</strong>
                      <p className="mt-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">{editedContent.acceptance_criteria}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'View Preview' : 'Edit Draft'}</span>
            </button>
            <button
              onClick={onRegenerate}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-lg transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg inline-flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Accept & Save to Project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
