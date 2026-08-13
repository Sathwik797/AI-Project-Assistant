import React, { useState } from 'react';
import { FileText, X, Bot, Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { documentsApi } from '../../services/api';
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
      // Call dedicated Document AI endpoint directly analyzing document raw text
      const res = await documentsApi.chatWithDocument(document.id, {
        question: query
      });

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: res.data.answer || 'No specific answer generated from document content.',
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
      <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-2xl max-w-6xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden text-xs text-[#1F2937]">
        
        {/* Header Bar */}
        <div className="h-14 px-6 border-b border-[#E5E1D8] flex items-center justify-between bg-[#FCFCFA] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C8923E] text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1F2937]">{document.filename}</h3>
              <span className="text-[11px] text-[#6B7280] font-mono uppercase">
                {document.file_type} · {(document.file_size / 1024).toFixed(1)} KB · {document.chunk_count || 0} chunks
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E1D8] overflow-hidden">
          
          {/* Left Pane: Document Text Reader */}
          <div className="flex flex-col h-full overflow-hidden bg-[#FCFCFA]/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-2">
              <span className="font-bold text-[#1F2937] uppercase tracking-wider text-[10px]">
                EXTRACTED DOCUMENT TEXT
              </span>
              <input
                type="text"
                placeholder="Find text in document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-md px-2.5 py-1 text-xs text-[#1F2937] outline-none w-48 focus:ring-1 focus:ring-[#C8923E]"
              />
            </div>

            <div className="flex-1 overflow-y-auto bg-[#FFFFFF] border border-[#E5E1D8] rounded-xl p-4 font-mono text-xs text-[#1F2937] leading-relaxed whitespace-pre-wrap shadow-2xs">
              {searchTerm.trim() ? (
                highlightedText.map((part, i) =>
                  part.toLowerCase() === searchTerm.toLowerCase() ? (
                    <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5 font-bold">
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
          <div className="flex flex-col h-full overflow-hidden bg-[#FFFFFF] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C8923E]" />
                <span className="font-bold text-[#1F2937] uppercase tracking-wider text-[10px]">
                  DOCUMENT AI COPILOT
                </span>
              </div>
              <span className="text-[10px] text-[#C8923E] font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                AI is analyzing this document
              </span>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isLoading && (
                <div className="flex gap-2 text-xs text-[#6B7280] items-center p-2.5 bg-[#FCFCFA] rounded-xl border border-[#E5E1D8]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#C8923E]" />
                  <span>Analyzing document content with Gemini...</span>
                </div>
              )}

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="pt-2 border-t border-[#E5E1D8] flex gap-2">
              <input
                type="text"
                placeholder={`Ask about ${document.filename}...`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 bg-[#FCFCFA] border border-[#E5E1D8] rounded-xl px-3 py-2 text-xs text-[#1F2937] outline-none focus:ring-1 focus:ring-[#C8923E]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="px-4 py-2 bg-[#C8923E] hover:bg-[#b58032] text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
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
