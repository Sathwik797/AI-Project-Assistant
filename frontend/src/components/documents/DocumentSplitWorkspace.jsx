import React, { useState } from 'react';
import { FileText, X, Bot, Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { ragApi } from '../../services/api';
import ChatMessage from '../assistant/ChatMessage';

export default function DocumentSplitWorkspace({ document, projectId, onClose }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Focused Document Assistant active for "${document.filename}". Ask any specific question about this document's text or specifications.`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim() || isLoading) return;

    const query = question.trim();
    setQuestion('');
    setError('');

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await ragApi.askQuestion(projectId, {
        question: `[Document: ${document.filename}] ${query}`,
        top_k: 5,
      });

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: res.data.answer || 'No specific answer generated.',
        sources: res.data.sources || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to query document content.');
    } finally {
      setIsLoading(false);
    }
  };

  const rawText = document.raw_text || 'No extracted text content available for this document.';
  const highlightedText = searchTerm.trim() 
    ? rawText.split(new RegExp(`(${searchTerm})`, 'gi'))
    : [rawText];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-6xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden text-xs">
        
        {/* Header Bar */}
        <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{document.filename}</h3>
              <span className="text-[11px] text-slate-400 font-mono uppercase">
                {document.file_type} · {(document.file_size / 1024).toFixed(1)} KB · {document.chunk_count || 0} chunks
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden">
          
          {/* Left Pane: Document Text Reader */}
          <div className="flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                EXTRACTED DOCUMENT TEXT
              </span>
              <input
                type="text"
                placeholder="Find text in document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 outline-none w-48 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap shadow-2xs">
              {searchTerm.trim() ? (
                highlightedText.map((part, i) =>
                  part.toLowerCase() === searchTerm.toLowerCase() ? (
                    <mark key={i} className="bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 rounded px-0.5 font-bold">
                      {part}
                    </mark>
                  ) : (
                    part
                  )
                )
              ) : (
                rawText
              )}
            </div>
          </div>

          {/* Right Pane: Document AI Copilot */}
          <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  DOCUMENT AI COPILOT
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Grounded RAG</span>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isLoading && (
                <div className="flex gap-2 text-xs text-slate-400 items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Searching document chunks with Gemini...</span>
                </div>
              )}

              {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder={`Ask about ${document.filename}...`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
