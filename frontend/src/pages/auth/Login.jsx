import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layers, Loader2, AlertCircle, Info, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const noticeMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#FCFCFA] text-[#171717] font-sans p-4 selection:bg-amber-100">
      
      {/* Top Header Link */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#666666] hover:text-[#171717] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to AI Project Assistant</span>
        </Link>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8 max-w-sm w-full shadow-2xs space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-2xs">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-bold text-[#171717] tracking-tight">Sign In to Your Workspace</h2>
          <p className="text-xs text-[#666666]">Access your project intelligence platform</p>
        </div>

        {/* Notice Message Banner from Landing Page CTA */}
        {noticeMessage && !error && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              placeholder="user@enterprise.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FCFCFA] border border-[#E7E5E4] rounded-lg px-3 py-2 text-[#171717] focus:ring-1 focus:ring-amber-500 outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-amber-600 hover:underline font-medium">Forgot password?</Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FCFCFA] border border-[#E7E5E4] rounded-lg px-3 py-2 text-[#171717] focus:ring-1 focus:ring-amber-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        <div className="text-center text-xs text-[#666666] pt-2 border-t border-[#E7E5E4]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-amber-600 hover:underline font-semibold">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
