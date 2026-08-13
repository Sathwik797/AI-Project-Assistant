import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Clock, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#FCFCFA] text-[#171717] font-sans p-4 selection:bg-amber-100">
      
      {/* Top Header Link */}
      <div className="mb-6">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-[#666666] hover:text-[#171717] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8 max-w-sm w-full shadow-2xs space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-2xs">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-bold text-[#171717] tracking-tight">Reset Password</h2>
          <p className="text-xs text-[#666666]">Enterprise Account Recovery</p>
        </div>

        {submitted ? (
          <div className="bg-[#FCFCFA] border border-[#E7E5E4] rounded-xl p-4 text-center space-y-3 text-xs">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <p className="font-semibold text-[#171717]">
              Password Reset Requested
            </p>
            <p className="text-[#666666] text-[11px] leading-relaxed">
              Email delivery infrastructure pending SMTP integration. Please contact your workspace administrator to reset credentials.
            </p>
            <Link to="/login" className="inline-flex items-center gap-1 text-amber-600 hover:underline font-semibold pt-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Submit Reset Request
            </button>
          </form>
        )}

        <div className="text-center text-xs text-[#666666] pt-2 border-t border-[#E7E5E4]">
          <Link to="/login" className="text-amber-600 hover:underline font-semibold inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
