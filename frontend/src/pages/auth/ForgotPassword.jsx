import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise Password Recovery</p>
        </div>

        {submitted ? (
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center space-y-3 text-xs">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Password Reset Architecture
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Email delivery infrastructure pending SMTP integration. Please contact your system administrator to reset credentials.
            </p>
            <Link to="/login" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                placeholder="user@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              Submit Reset Request
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link to="/login" className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
