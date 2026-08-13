import React from 'react';
import { ListCheck, UserCheck, CheckSquare, TriangleAlert, Kanban, FileText } from 'lucide-react';

export default function SuggestedActions({ onSelectAction }) {
  const actions = [
    { label: 'Analyze Requirements', icon: ListCheck, prompt: 'Analyze and summarize the core requirements from the project documents.' },
    { label: 'Generate User Stories', icon: UserCheck, prompt: 'Generate structured user stories with acceptance criteria based on the requirements.' },
    { label: 'Acceptance Criteria', icon: CheckSquare, prompt: 'List clear acceptance criteria for the primary features described in the documentation.' },
    { label: 'Find Conflicts', icon: TriangleAlert, prompt: 'Identify any conflicting, missing, or ambiguous requirements in the project files.' },
    { label: 'Generate Tasks', icon: Kanban, prompt: 'Break down the project specifications into actionable development tasks.' },
    { label: 'Summarize Project', icon: FileText, prompt: 'Provide an executive summary of this project workspace.' },
  ];

  return (
    <div className="space-y-1.5 select-none">
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
        Suggested Intelligence Actions
      </span>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.label}
              onClick={() => onSelectAction(act.prompt)}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl text-left transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {act.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
