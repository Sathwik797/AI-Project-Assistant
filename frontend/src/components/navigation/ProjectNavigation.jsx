import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Bot, 
  FileText, 
  LayoutDashboard, 
  ListCheck, 
  UserCheck, 
  Kanban, 
  AlertTriangle 
} from 'lucide-react';

export default function ProjectNavigation({ projectId }) {
  const navItems = [
    { label: 'AI Assistant', path: `/projects/${projectId}/assistant`, icon: Bot },
    { label: 'Documents', path: `/projects/${projectId}/documents`, icon: FileText },
    { label: 'Overview', path: `/projects/${projectId}/overview`, icon: LayoutDashboard },
    { label: 'Requirements', path: `/projects/${projectId}/requirements`, icon: ListCheck },
    { label: 'User Stories', path: `/projects/${projectId}/user-stories`, icon: UserCheck },
    { label: 'Tasks', path: `/projects/${projectId}/tasks`, icon: Kanban },
    { label: 'Conflicts', path: `/projects/${projectId}/conflicts`, icon: AlertTriangle },
  ];

  return (
    <nav className="bg-slate-100/80 px-6 py-2 border-b border-slate-200">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-all shrink-0 ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
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
