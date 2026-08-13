import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ragApi } from '../services/api';
import AssistantHero from '../components/assistant/AssistantHero';
import SuggestedActions from '../components/assistant/SuggestedActions';
import ChatMessage from '../components/assistant/ChatMessage';
import ChatComposer from '../components/assistant/ChatComposer';
import { Bot, AlertCircle } from 'lucide-react';

export default function Assistant() {
  const { activeProject, projectId } = useOutletContext();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello! Ask me anything about your project documents for ${activeProject?.name || 'this project'}. I can answer questions, extract requirements, generate user stories, and detect specification conflicts.`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        text: res.data.answer || 'No answer generated.',
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

  return (
    <div className="space-y-4 flex flex-col min-h-[calc(100vh-180px)] max-w-5xl mx-auto">
      {/* Eyebrow & Hero Title */}
      <AssistantHero />

      {/* Suggested Intelligence Actions */}
      <SuggestedActions onSelectAction={(prompt) => handleSend(prompt)} />

      {/* Primary Conversation Stream */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs overflow-y-auto space-y-4 min-h-[350px] transition-colors">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <span>Searching ChromaDB vector store & generating response with Gemini...</span>
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

      {/* Sticky Integrated AI Composer */}
      <ChatComposer
        question={question}
        setQuestion={setQuestion}
        onSend={() => handleSend()}
        isLoading={isLoading}
      />
    </div>
  );
}
