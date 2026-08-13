import React from 'react';
import { Bot, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';
  const { user } = useAuth();

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 max-w-2xl ml-auto select-none">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 text-xs leading-relaxed shadow-2xs">
          {message.text}
        </div>
        <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
          {user?.full_name?.slice(0, 2).toUpperCase() || 'SR'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 max-w-3xl select-none">
      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-800 dark:text-slate-200 space-y-3 leading-relaxed shadow-2xs flex-1 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="font-bold text-slate-900 dark:text-white">AI Assistant</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Grounded via ChromaDB + Gemini</span>
        </div>

        {/* Message Content */}
        <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
          {message.text}
        </div>

        {/* Source Citations */}
        {message.sources && message.sources.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Retrieved Sources ({message.sources.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((src, idx) => (
                <div 
                  key={idx} 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] text-slate-600 dark:text-slate-300 font-medium"
                  title={src.snippet || src.filename}
                >
                  <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>{src.filename || `Doc ID ${src.document_id}`} (Score: {(src.similarity_score || 0).toFixed(2)})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
