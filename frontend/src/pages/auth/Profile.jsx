import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">User Account Profile</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your credentials, team role, and security settings.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {user?.full_name?.slice(0, 2).toUpperCase() || 'SR'}
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">{user?.full_name || 'Sathwik Reddy'}</h4>
            <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full text-[11px] font-semibold">
              {user?.role || 'Lead Developer'}
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Email Address</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">{user?.email || 'user@enterprise.com'}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Authentication Status</span>
            </div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">JWT Token Active</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Account ID</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">USR-{user?.id || 1}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
