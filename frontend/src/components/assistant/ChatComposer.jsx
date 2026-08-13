import React from 'react';
import { Send, Loader2, Paperclip } from 'lucide-react';

export default function ChatComposer({ question, setQuestion, onSend, isLoading }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs space-y-2 sticky bottom-0 transition-colors">
      <textarea
        rows="2"
        placeholder="Ask anything about your project documents..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className="w-full text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none bg-transparent"
      />

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <Paperclip className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Grounded Retrieval Context Active</span>
        </div>

        <button
          type="button"
          onClick={onSend}
          disabled={isLoading || !question.trim()}
          className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-xs flex items-center justify-center shadow-2xs transition-colors"
          title="Send message (Enter)"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
