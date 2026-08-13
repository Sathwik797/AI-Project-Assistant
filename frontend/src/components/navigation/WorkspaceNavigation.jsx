import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  ListCheck, 
  UserCheck, 
  Kanban, 
  TriangleAlert 
} from 'lucide-react';

export default function WorkspaceNavigation({ projectId }) {
  const navItems = [
    { label: 'Overview', path: `/projects/${projectId}/overview`, icon: LayoutDashboard },
    { label: 'Documents', path: `/projects/${projectId}/documents`, icon: FileText },
    { label: 'Requirements', path: `/projects/${projectId}/requirements`, icon: ListCheck },
    { label: 'User Stories', path: `/projects/${projectId}/user-stories`, icon: UserCheck },
    { label: 'Tasks', path: `/projects/${projectId}/tasks`, icon: Kanban },
    { label: 'Conflicts', path: `/projects/${projectId}/conflicts`, icon: TriangleAlert },
  ];

  return (
    <nav className="bg-[#F5F5F3] px-6 pt-1 border-b border-[#E8E1D7] shrink-0 select-none transition-colors">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3.5 py-2.5 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-[#C8923E] text-[#C8923E] bg-white rounded-t-md shadow-2xs font-bold'
                    : 'border-transparent text-[#666666] hover:text-[#171717] hover:bg-[#E8E1D7]/50 rounded-t-md'
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
