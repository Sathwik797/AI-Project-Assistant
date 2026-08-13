import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layers, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Developer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Guard against double-submits

    if (!email || !password || !fullName) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signup(email, password, fullName, role);
      navigate('/projects');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail) && detail[0]?.msg) {
        setError(detail[0].msg);
      } else if (!err.response) {
        setError('Network error: Unable to connect to backend server. Please try again.');
      } else {
        setError('Failed to create account. Please check your information and try again.');
      }
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
          <h2 className="text-xl font-bold text-[#171717] tracking-tight">Create Your Account</h2>
          <p className="text-xs text-[#666666]">Join AI Project Assistant</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Full Name</label>
            <input
              type="text"
              placeholder="Sathwik Reddy"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#FCFCFA] border border-[#E7E5E4] rounded-lg px-3 py-2 text-[#171717] focus:ring-1 focus:ring-amber-500 outline-none"
              required
            />
          </div>

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
            <label className="font-semibold text-slate-700">Role / Position</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#FCFCFA] border border-[#E7E5E4] rounded-lg px-3 py-2 text-[#171717] focus:ring-1 focus:ring-amber-500 outline-none"
            >
              <option value="Product Manager">Product Manager</option>
              <option value="Lead Architect">Lead Architect</option>
              <option value="Developer">Developer</option>
              <option value="QA Engineer">QA Engineer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Password</label>
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
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
          </button>
        </form>

        <div className="text-center text-xs text-[#666666] pt-2 border-t border-[#E7E5E4]">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-600 hover:underline font-semibold">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
