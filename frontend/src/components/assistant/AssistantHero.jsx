import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AssistantHero() {
  return (
    <div className="space-y-1 select-none">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>AI PROJECT INTELLIGENCE</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        Understand your project with AI
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
        Ask questions, analyze requirements, generate project artifacts, and detect conflicts using your project knowledge base.
      </p>
    </div>
  );
}
