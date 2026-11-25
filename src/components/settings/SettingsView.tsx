import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Bell, 
  Key, 
  Database, 
  RefreshCw, 
  Check,
  Lock
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, role, loginAsRole, updateProfile } = useAuth();
  const { geminiApiKey, setGeminiApiKey, resetToInitialDemo } = useApp();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [isSaved, setIsSaved] = useState(false);

  // Notification toggles
  const [notifyMismatch, setNotifyMismatch] = useState(true);
  const [notifyHighRisk, setNotifyHighRisk] = useState(true);
  const [notifyReviewAssigned, setNotifyReviewAssigned] = useState(true);
  const [notifyEvidenceSubmitted, setNotifyEvidenceSubmitted] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ full_name: fullName, department });
    setGeminiApiKey(apiKeyInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDemo = () => {
    if (confirm('Reset database to clean initial demonstration state with all 10 verified loan applicant scenarios?')) {
      resetToInitialDemo();
      alert('Demonstration database reset successfully.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#FF7A00]" />
          <h1 className="text-2xl font-bold text-white tracking-tight">System Settings & Preferences</h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure authenticated user profile, active underwriting role, notification channels, and Gemini AI credentials.
        </p>
      </div>

      {isSaved && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* User Profile Form */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-[#FF7A00]" />
          <span>User Profile & Role Authorization</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Email Address (Authenticated)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.02] border border-white/[0.05] text-slate-400 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl glass-input text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Active Authorization Role
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loginAsRole('admin')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    role === 'admin'
                      ? 'bg-[#FF5B26] text-white border-[#FF5B26] shadow-md shadow-orange-500/25'
                      : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  Compliance Admin
                </button>
                <button
                  type="button"
                  onClick={() => loginAsRole('reviewer')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    role === 'reviewer'
                      ? 'bg-[#FF5B26] text-white border-[#FF5B26] shadow-md shadow-orange-500/25'
                      : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  Human Reviewer
                </button>
              </div>
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="pt-2">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>Google Gemini API Key</span>
            </label>
            <input
              type="password"
              placeholder="AIzaSy... (Leave blank to use verified loan underwriting simulation)"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl glass-input text-slate-100 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Your API key is used strictly for server-side evaluation calls and is never exposed or logged.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl btn-primary-orange text-xs font-semibold shadow-md shadow-orange-500/25"
            >
              Save Profile & Credentials
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#FF7A00]" />
          <span>Real-time Event Notifications</span>
        </h3>

        <div className="space-y-3 text-xs">
          {[
            { label: 'Potential AI-Policy Mismatches', desc: 'Trigger an alert whenever AI rejects an applicant who passes all configured policies.', state: notifyMismatch, set: setNotifyMismatch },
            { label: 'High-Severity Risk Flags', desc: 'Notify immediately when severe DTI or credit threshold breaches are detected.', state: notifyHighRisk, set: setNotifyHighRisk },
            { label: 'Human Review Assignments', desc: 'Notify when a new case enters the credit review desk.', state: notifyReviewAssigned, set: setNotifyReviewAssigned },
            { label: 'Additional Evidence Submissions', desc: 'Notify when applicant documents or ITR filings are received.', state: notifyEvidenceSubmitted, set: setNotifyEvidenceSubmitted },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <p className="font-semibold text-white">{item.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={item.state}
                onChange={(e) => item.set(e.target.checked)}
                className="w-4 h-4 accent-[#FF5B26] cursor-pointer rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Database Management & Reset */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-white/[0.08] space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Demonstration Data Reset</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Reset all loan applications, AI decisions, policy verification checks, and SHA-256 hash chains back to the initial 10 comprehensive demonstration scenarios (covering compliant applicants, low credit scores, high DTI, missing documentation, AI mismatches, and inconclusive cases).
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleResetDemo}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/[0.08] hover:border-rose-500/40 text-slate-200 hover:text-rose-300 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Database (10 Initial Scenarios)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
