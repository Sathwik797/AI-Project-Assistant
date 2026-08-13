import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 
  ListCheck, 
  UserCheck, 
  Kanban, 
  TriangleAlert 
} from 'lucide-react';

export default function WorkspaceNavigation({ projectId }) {
  const navItems = [
    { label: 'Overview', path: `/projects/${projectId}/overview`, icon: LayoutDashboard },
    { label: 'AI Assistant', path: `/projects/${projectId}/assistant`, icon: Bot },
    { label: 'Documents', path: `/projects/${projectId}/documents`, icon: FileText },
    { label: 'Requirements', path: `/projects/${projectId}/requirements`, icon: ListCheck },
    { label: 'User Stories', path: `/projects/${projectId}/user-stories`, icon: UserCheck },
    { label: 'Tasks', path: `/projects/${projectId}/tasks`, icon: Kanban },
    { label: 'Conflicts', path: `/projects/${projectId}/conflicts`, icon: TriangleAlert },
  ];

  return (
    <nav className="bg-slate-100/80 dark:bg-slate-900/80 px-6 pt-1 border-b border-slate-200 dark:border-slate-800 shrink-0 select-none transition-colors">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3.5 py-2.5 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-md shadow-2xs'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-t-md'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
