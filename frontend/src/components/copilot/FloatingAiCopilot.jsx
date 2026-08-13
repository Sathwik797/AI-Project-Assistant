import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { copilotApi } from '../../services/api';
import { 
  Sparkles, 
  X, 
  Paperclip, 
  Send, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Loader2, 
  Bot, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function FloatingAiCopilot({ activeProject, projectId }) {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Determine active context based on URL route
  const currentPath = location.pathname;
  let pageContext = 'Overview';
  if (currentPath.includes('/documents')) pageContext = 'Documents';
  else if (currentPath.includes('/requirements')) pageContext = 'Requirements';
  else if (currentPath.includes('/user-stories')) pageContext = 'User Stories';
  else if (currentPath.includes('/tasks')) pageContext = 'Tasks';
  else if (currentPath.includes('/conflicts')) pageContext = 'Conflicts';

  // Role-aware context suggestions
  const getContextSuggestions = () => {
    const role = user?.role || 'Developer';
    switch (pageContext) {
      case 'Documents':
        return [
          'How do I upload and index a project document?',
          'What is the difference between Document AI and Project RAG?',
          'Extract compliance rules from specs'
        ];
      case 'Requirements':
        return [
          'How do I create a requirement in this app?',
          'What is the difference between functional and non-functional requirements?',
          role === 'Lead Architect' ? 'Analyze technical requirements' : 'Explain this requirement'
        ];
      case 'User Stories':
        return [
          'What is an agile user story?',
          'How to format user stories with role, goal, and benefit?',
          'How do I link user stories to requirement codes?'
        ];
      case 'Tasks':
        return [
          'How should I break a requirement into technical tasks?',
          'How to assign tasks to sprint team members?',
          'Explain implementation steps for a task'
        ];
      case 'Conflicts':
        return [
          'How does the conflict detector work?',
          'How to resolve specification contradictions?',
          'What causes requirement conflicts?'
        ];
      default:
        return [
          'What does AI Project Assistant do?',
          'How do I navigate between project modules?',
          'Summarize this project status'
        ];
    }
  };

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments = files.map((file) => {
      const isImage = file.type.startsWith('image/');
      return {
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: isImage ? 'image' : 'document',
        previewUrl: isImage ? URL.createObjectURL(file) : null
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query && attachments.length === 0) return;
    if (loading) return;

    const targetProjId = projectId || activeProject?.id;
    if (!targetProjId) {
      setError('Please select a project workspace to use AI Copilot.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      attachments: [...attachments],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    const currentAttachments = [...attachments];
    setAttachments([]);
    setLoading(true);
    setError(null);

    try {
      // Call dedicated Main Copilot service API endpoint
      const res = await copilotApi.chat({
        project_id: targetProjId,
        message: query || 'How does AI Project Assistant work?',
        page_context: pageContext,
        user_role: user?.role || 'Developer'
      });
      const apiData = res.data || {};

      let responseText = apiData.answer || apiData.error;
      
      if (!responseText) {
        responseText = "I'm your AI Copilot. How can I assist you with this application or project?";
      }

      if (currentAttachments.some(a => a.type === 'image')) {
        responseText += `\n\n[Note: Received ${currentAttachments.filter(a => a.type === 'image').length} image attachment(s).]`;
      }

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        sources: apiData.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI Copilot Error:', err);
      const userFriendlyError = err.response?.data?.detail 
        || (err.response?.status === 404 ? 'Project workspace not found.' : null)
        || (err.response?.status === 401 ? 'Session expired. Please sign in again.' : null)
        || 'Unable to reach the AI assistant. Please try again.';
      
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING AI COPILOT BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#C8923E] hover:bg-[#b58032] text-white flex items-center justify-center shadow-lg border border-amber-300/40 hover:scale-105 transition-all duration-200 cursor-pointer relative group"
          title="AI Copilot"
        >
          {isOpen ? <X className="w-6 h-6 stroke-[2.2]" /> : <Sparkles className="w-6 h-6 stroke-[2.2]" />}
          
          {!isOpen && (
            <span className="absolute right-16 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
              AI Copilot
            </span>
          )}
        </button>
      </div>

      {/* OPEN AI COPILOT PANEL */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[92vw] sm:w-[460px] h-[620px] max-h-[82vh] bg-white border border-[#E8E1D7] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden text-xs selection:bg-amber-100 transition-all duration-200">
          
          {/* COPILOT HEADER */}
          <div className="p-4 bg-[#FCFBF8] border-b border-[#E8E1D7] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C8923E] text-white flex items-center justify-center shadow-2xs">
                <Bot className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#171717]">AI Copilot</h3>
                  <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Ready</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#666666]">
                  {activeProject?.name || 'Project Intelligence Workspace'} · <span className="font-semibold text-amber-700">{pageContext} Mode</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Clear Conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FCFBF8]/40">
            {messages.length === 0 ? (
              <div className="space-y-4 text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-[#C8923E] flex items-center justify-center mx-auto shadow-2xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#171717]">How can I help with this project?</h4>
                  <p className="text-[#666666] text-[11px] max-w-xs mx-auto">
                    Ask questions grounded in project documents, extract specifications, or analyze requirements.
                  </p>
                </div>

                {/* SUGGESTIONS */}
                <div className="pt-2 text-left space-y-2 max-w-sm mx-auto">
                  <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block font-bold">
                    Try asking in {pageContext}:
                  </span>
                  <div className="space-y-1.5">
                    {getContextSuggestions().map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sug)}
                        className="w-full text-left p-2.5 bg-white border border-[#E8E1D7] hover:border-[#C8923E] rounded-xl text-[11px] text-[#171717] font-medium transition-colors shadow-2xs cursor-pointer flex items-center justify-between group"
                      >
                        <span>{sug}</span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C8923E] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-lg bg-[#C8923E] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    
                    {/* User Attachments Preview */}
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-end mb-1">
                        {m.attachments.map((att) => (
                          <div key={att.id} className="p-1.5 bg-white border border-[#E8E1D7] rounded-lg text-[10px] flex items-center gap-1.5">
                            {att.type === 'image' ? (
                              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            <span className="font-mono text-slate-700 truncate max-w-[120px]">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      m.sender === 'user'
                        ? 'bg-[#C8923E] text-white font-medium rounded-tr-none'
                        : 'bg-white border border-[#E8E1D7] text-[#171717] rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>

                      {/* RAG SOURCES CITATION CARDS */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-[#E8E1D7] space-y-1.5 text-[11px]">
                          <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider font-bold block">
                            GROUNDED SOURCES
                          </span>
                          <div className="space-y-1">
                            {m.sources.map((src, sIdx) => {
                              const matchScore = src.distance !== undefined 
                                ? Math.max(10, Math.min(99, Math.round((1 - (src.distance / 2.0)) * 100))) 
                                : 92;
                              return (
                                <div
                                  key={sIdx}
                                  className="p-2 bg-[#FCFBF8] border border-[#E8E1D7] rounded-lg flex items-center justify-between text-slate-800 font-mono text-[10px]"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <FileText className="w-3.5 h-3.5 text-[#C8923E] shrink-0" />
                                    <span className="font-bold truncate">{src.filename || 'Document'}</span>
                                    <span className="text-[#666666]">· Chunk #{src.chunk_index ?? sIdx}</span>
                                  </div>
                                  <span className="font-bold text-emerald-600 shrink-0">
                                    {matchScore}% match
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <span className="text-[9px] font-mono text-[#666666] block px-1">
                      {m.timestamp}
                    </span>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {user?.full_name?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-[#666666]">
                <div className="w-7 h-7 rounded-lg bg-[#C8923E] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white border border-[#E8E1D7] rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#C8923E]" />
                  <span>Searching project knowledge & RAG vector store...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* ATTACHMENT PREVIEW BEFORE SENDING */}
          {attachments.length > 0 && (
            <div className="p-2.5 bg-[#FCFBF8] border-t border-[#E8E1D7] space-y-1.5 shrink-0">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#666666]">
                <span className="font-bold uppercase">Chat Attachments ({attachments.length})</span>
                <span>Temporary Conversational Context</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {attachments.map((att) => (
                  <div key={att.id} className="p-1.5 bg-white border border-[#E8E1D7] rounded-lg text-[10px] flex items-center gap-2 shadow-2xs">
                    {att.type === 'image' ? (
                      <div className="w-6 h-6 rounded bg-slate-100 overflow-hidden shrink-0">
                        <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-mono text-slate-800 truncate max-w-[120px] font-bold">{att.name}</p>
                      <span className="text-[9px] text-[#666666]">{att.size}</span>
                    </div>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHATGPT-LIKE COMPOSER INPUT */}
          <div className="p-3 bg-white border-t border-[#E8E1D7] shrink-0 space-y-2">
            <div className="relative flex items-center gap-2">
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-[#C8923E] hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                title="Attach Document or Image (PDF, DOCX, TXT, PNG, JPG)"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                className="hidden"
              />

              <input
                type="text"
                placeholder={`Ask about ${activeProject?.name || 'project knowledge'}...`}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 bg-[#FCFBF8] border border-[#E8E1D7] rounded-xl px-3 py-2 text-xs text-[#171717] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#C8923E]"
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={(!inputQuery.trim() && attachments.length === 0) || loading}
                className="p-2 bg-[#C8923E] hover:bg-[#b58032] text-white rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
