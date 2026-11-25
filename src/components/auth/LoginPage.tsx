import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, Sparkles, UserCheck, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsRole } = useAuth();
  const [email, setEmail] = useState('admin@trusttrack.bank');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const ok = await login(email, password);
      if (!ok) setError('Invalid credentials. Please verify your email or use 1-click demo sign-in.');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient warm orange/amber radial backdrops matching reference Image 1 */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FF5B26]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#FF8A00]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="ambient-mesh" />

      {/* Main Glassmorphic Auth Card */}
      <div className="w-full max-w-md glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-white/[0.1] relative z-10 shadow-2xl backdrop-blur-2xl animate-fadeIn">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF5B26] to-[#FF8A00] flex items-center justify-center shadow-xl shadow-orange-500/30 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TrustTrack</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            AI Loan Decision Monitoring & Accountability Platform
          </p>
        </div>

        {/* 1-Click Fast Demonstration Roles */}
        <div className="mb-6 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" /> 1-Click Role Access
            </span>
            <span className="text-[10px] text-slate-400">Instant Demo</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => loginAsRole('admin')}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] hover:bg-[#FF5B26]/20 border border-white/[0.08] hover:border-[#FF5B26]/40 transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FF5B26]/20 text-[#FF7A00] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-[#FF8A00]">Admin</p>
                <p className="text-[9px] text-slate-400">Risk & Policies</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => loginAsRole('reviewer')}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] hover:bg-emerald-500/20 border border-white/[0.08] hover:border-emerald-500/40 transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-emerald-400">Reviewer</p>
                <p className="text-[9px] text-slate-400">Underwriting Desk</p>
              </div>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="compliance.officer@bank.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <button 
                type="button" 
                onClick={() => alert('For demonstration, any password or the 1-click role buttons log you into the verified session.')}
                className="text-[11px] text-[#FF7A00] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl glass-input text-slate-100 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Warm Orange Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl btn-primary-orange text-xs uppercase tracking-wider font-bold mt-2 shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Sign In to Platform</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[#111118] text-slate-400 text-[11px]">Or continue with</span>
          </div>
        </div>

        {/* Social Buttons (matching Image 1) */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => loginAsRole('admin')}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-medium text-slate-200 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => loginAsRole('reviewer')}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-medium text-slate-200 transition-all"
          >
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.92-1 .04-2.17.65-2.82 1.42-.58.67-.99 1.76-.85 2.81 1.11.09 2.1-.55 2.73-1.31z" />
            </svg>
            <span>Sign in with Bank SSO</span>
          </button>
        </div>
      </div>

      {/* Footer Store badges (matching Image 1) */}
      <div className="mt-8 flex items-center gap-3 z-10 opacity-70 hover:opacity-100 transition-opacity">
        <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2 text-[10px] text-slate-400">
          <span className="font-semibold text-slate-300">Enterprise Certified</span>
          <span>•</span>
          <span>ISO 27001 / SOC 2 Type II</span>
        </div>
      </div>
    </div>
  );
};
