import React from 'react';
import { Bell, X, CheckCircle2, Database, ShieldCheck, Cpu } from 'lucide-react';

export default function NotificationDrawer({ onClose }) {
  const notifications = [
    {
      id: 1,
      title: 'Vector Store Ready',
      desc: 'ChromaDB partition active for current project workspace.',
      time: 'Just now',
      icon: Database,
      color: 'text-emerald-500'
    },
    {
      id: 2,
      title: 'Gemini LLM Connected',
      desc: 'Grounding RAG engine active with gemini-2.5-flash.',
      time: '2m ago',
      icon: Cpu,
      color: 'text-blue-500'
    },
    {
      id: 3,
      title: 'JWT Session Active',
      desc: 'Authenticated bearer token renewed securely.',
      time: '15m ago',
      icon: ShieldCheck,
      color: 'text-purple-500'
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex justify-end z-50">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-80 h-full p-5 shadow-2xl space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">System Notifications</h4>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <Icon className={`w-3.5 h-3.5 ${n.color}`} />
                      <span>{n.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{n.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      </div>
    </div>
  );
}
