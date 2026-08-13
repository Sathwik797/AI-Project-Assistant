import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ragApi, documentsApi } from '../services/api';
import ChatMessage from '../components/assistant/ChatMessage';
import ChatComposer from '../components/assistant/ChatComposer';
import { 
  Bot, 
  Sparkles, 
  FileText, 
  Database, 
  Cpu, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ListCheck, 
  FileSearch, 
  TriangleAlert 
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';

export default function Assistant() {
  const { activeProject, projectId } = useOutletContext();
  const [question, setQuestion] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello! I am your AI Project Copilot for ${activeProject?.name || 'this project'}. I have indexed your project documentation and am ready to answer technical queries, extract requirements, and detect specification conflicts.`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    setLoadingDocs(true);
    documentsApi.getDocuments(projectId)
      .then((res) => setDocuments(res.data || []))
      .catch(() => setDocuments([]))
      .finally(() => setLoadingDocs(false));
  }, [projectId]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || question;
    if (!textToSend.trim() || isLoading) return;

    setError('');
    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setQuestion('');
    setIsLoading(true);

    try {
      const res = await ragApi.askQuestion(projectId, {
        question: textToSend,
        top_k: 5,
      });

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: res.data.answer || 'No grounded answer generated.',
        sources: res.data.sources || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to generate response. Please ensure project documents are uploaded & indexed.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const indexedDocs = documents.filter(d => d.is_indexed);
  const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Flagship Intelligence Hero */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-2xs text-[11px] font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI PROJECT INTELLIGENCE</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Understand, analyze and build your project with AI</h2>
            <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
              Ask grounded queries across <strong>{indexedDocs.length} indexed documents</strong> ({totalChunks} vector chunks).
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => handleSend("Analyze and extract the key functional and technical requirements from the uploaded project documents.")}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-2xs border border-white/20 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ListCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Analyze Requirements</span>
            </button>
            <button
              onClick={() => handleSend("Provide a comprehensive summary of all uploaded project specification documents.")}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-2xs border border-white/20 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSearch className="w-3.5 h-3.5 text-blue-300" />
              <span>Summarize Specs</span>
            </button>
            <button
              onClick={() => handleSend("Scan the project documentation to detect contradictory specifications, missing rules, and ambiguities.")}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-2xs border border-white/20 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <TriangleAlert className="w-3.5 h-3.5 text-red-300" />
              <span>Scan Conflicts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Left = Knowledge Base, Right = AI Copilot Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Project Knowledge Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                PROJECT KNOWLEDGE
              </span>
              <StatusBadge status="ready" label="ChromaDB Active" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                <span className="block font-bold text-lg text-slate-900 dark:text-white">{documents.length}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Documents</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                <span className="block font-bold text-lg text-purple-600 dark:text-purple-400">{totalChunks}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Chunks</span>
              </div>
            </div>

            {/* Document Sources List */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Indexed Sources</span>
              {loadingDocs ? (
                <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Loading sources...</span>
                </div>
              ) : documents.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  No documents uploaded yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {documents.map((d) => (
                    <div
                      key={d.id}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="truncate font-semibold text-slate-800 dark:text-slate-200">{d.filename}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                        d.is_indexed ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                      }`}>
                        {d.is_indexed ? `${d.chunk_count} Chunks` : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Copilot Stream */}
        <div className="lg:col-span-2 space-y-4 flex flex-col min-h-[480px]">
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs overflow-y-auto space-y-4 min-h-[380px]">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                  <span>Retrieving vector embeddings & prompting Gemini LLM...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Sticky Chat Composer */}
          <ChatComposer
            question={question}
            setQuestion={setQuestion}
            onSend={() => handleSend()}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
