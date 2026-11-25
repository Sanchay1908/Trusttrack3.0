import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  Search, 
  Filter, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  FileQuestion,
  TrendingDown
} from 'lucide-react';

export const RiskEngineView: React.FC<{ onNavigate: (tab: string, param?: string) => void }> = ({ onNavigate }) => {
  const { applications, aiDecisions, policyResults, riskFlags, policies } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Dashboard Metrics
  const totalChecked = applications.length;
  const mismatches = riskFlags.filter(f => f.risk_type === 'POTENTIAL_AI_POLICY_MISMATCH' || f.risk_type === 'AI_RECOMMENDS_POLICY_FAILS').length;
  const policyFailures = riskFlags.filter(f => f.risk_type === 'POLICY_FAILURE').length;
  const insufficientDataCases = riskFlags.filter(f => f.risk_type === 'INSUFFICIENT_DATA').length;
  const pendingInvestigations = riskFlags.filter(f => f.status === 'PENDING_INVESTIGATION' || f.status === 'UNDER_REVIEW').length;
  const resolvedAlerts = riskFlags.filter(f => f.status === 'RESOLVED').length;

  const filteredFlags = riskFlags.filter(f => {
    const app = applications.find(a => a.id === f.application_id);
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = app?.applicant_id.toLowerCase().includes(q);
      const matchName = app?.full_name.toLowerCase().includes(q);
      const matchTitle = f.title.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchTitle) return false;
    }
    if (filterType !== 'all' && f.risk_type !== filterType) return false;
    if (filterSeverity !== 'all' && f.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#FF5B26]" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Risk Engine & Policy Verification</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Independent algorithmic verification of AI recommendations against institutional financial loan eligibility policies.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel-elevated rounded-xl p-3.5 border-l-2 border-l-slate-400">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Checked</span>
          <span className="text-xl font-bold text-white mt-1 block">{totalChecked}</span>
        </div>
        <div className="glass-panel-elevated rounded-xl p-3.5 border-l-2 border-l-rose-500">
          <span className="text-[10px] uppercase font-semibold text-rose-400 block">AI-Policy Mismatches</span>
          <span className="text-xl font-bold text-white mt-1 block">{mismatches}</span>
        </div>
        <div className="glass-panel-elevated rounded-xl p-3.5 border-l-2 border-l-amber-500">
          <span className="text-[10px] uppercase font-semibold text-amber-400 block">Policy Failures</span>
          <span className="text-xl font-bold text-white mt-1 block">{policyFailures}</span>
        </div>
        <div className="glass-panel-elevated rounded-xl p-3.5 border-l-2 border-l-sky-500">
          <span className="text-[10px] uppercase font-semibold text-sky-400 block">Insufficient Data</span>
          <span className="text-xl font-bold text-white mt-1 block">{insufficientDataCases}</span>
        </div>
        <div className="glass-panel-elevated rounded-xl p-3.5 border-l-2 border-l-brand">
          <span className="text-[10px] uppercase font-semibold text-brand block">Under Investigation</span>
          <span className="text-xl font-bold text-white mt-1 block">{pendingInvestigations}</span>
        </div>
        <div className="glass-panel-elevated rounded-xl p-3.5 border-l-2 border-l-emerald-500">
          <span className="text-[10px] uppercase font-semibold text-emerald-400 block">Resolved Cases</span>
          <span className="text-xl font-bold text-white mt-1 block">{resolvedAlerts}</span>
        </div>
      </div>

      {/* Scenario Explanations Capsule */}
      <div className="glass-panel-elevated rounded-2xl p-4 sm:p-5 border border-white/[0.08]">
        <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
          Automated Risk Engine Detection Rules
        </span>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="font-bold text-rose-400 block mb-1">Scenario 1: Potential AI Mismatch</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              AI rejects applicant who passes all configured policies. Flagged as High Severity model bias investigation.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="font-bold text-rose-400 block mb-1">Scenario 4: AI Overlooks Breach</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              AI recommends an applicant who breaches mathematical policy limits (e.g., DTI &gt; 35% or Credit &lt; 650).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="font-bold text-amber-400 block mb-1">Scenario 2: Policy Failures</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Identifies threshold discrepancies (income, DTI, credit score) with exact quantitative difference display.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="font-bold text-sky-400 block mb-1">Scenario 3: Insufficient Data</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Missing income proof or unverified debt is NOT automatically treated as a loan failure; evidence requested.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel-elevated rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search risk alerts by applicant ID, name, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl glass-input text-slate-200 bg-[#121218]"
          >
            <option value="all">All Risk Types</option>
            <option value="POTENTIAL_AI_POLICY_MISMATCH">Potential AI-Policy Mismatch</option>
            <option value="AI_RECOMMENDS_POLICY_FAILS">AI Recommends Over Policy</option>
            <option value="POLICY_FAILURE">Policy Failure</option>
            <option value="INSUFFICIENT_DATA">Insufficient Data</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl glass-input text-slate-200 bg-[#121218]"
          >
            <option value="all">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Risk Alert Cards List */}
      <div className="space-y-3">
        {filteredFlags.length === 0 ? (
          <div className="glass-panel-elevated rounded-2xl p-8 text-center text-slate-400 text-xs">
            No risk alerts match the selected criteria.
          </div>
        ) : (
          filteredFlags.map(flag => {
            const app = applications.find(a => a.id === flag.application_id);
            const decision = aiDecisions.find(d => d.application_id === flag.application_id);
            const isMismatch = flag.risk_type.includes('MISMATCH') || flag.risk_type.includes('RECOMMENDS_POLICY');

            return (
              <div 
                key={flag.id} 
                className={`glass-panel-elevated rounded-2xl p-5 border transition-all ${
                  isMismatch 
                    ? 'border-rose-500/40 bg-gradient-to-r from-rose-500/[0.06] to-transparent' 
                    : flag.severity === 'High'
                    ? 'border-rose-500/30'
                    : 'border-white/[0.08]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-lg bg-[#FF5B26]/15 text-[#FF7A00] font-mono text-xs font-bold border border-[#FF5B26]/30">
                      {app?.applicant_id}
                    </span>
                    <h3 className="text-sm font-bold text-white">{app?.full_name}</h3>
                    <span className="text-xs text-slate-400">Loan: ₹{app?.loan_amount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      flag.severity === 'High'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : flag.severity === 'Medium'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }`}>
                      {flag.severity} Severity
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] text-[10px] text-slate-400 font-mono">
                      {flag.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Alert Details */}
                <div className="py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${flag.severity === 'High' ? 'text-rose-400' : 'text-amber-400'}`} />
                    <h4 className="text-xs font-bold text-white">{flag.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {flag.description}
                  </p>
                  {flag.policy_mismatch_details && (
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-slate-400 font-mono leading-relaxed">
                      <b className="text-slate-300">Verification Context:</b> {flag.policy_mismatch_details}
                    </div>
                  )}
                </div>

                {/* Footer with AI decision and action */}
                <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center gap-2">
                    <span>Original AI Recommendation:</span>
                    <span className={`font-semibold ${
                      decision?.recommendation === 'Recommended' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {decision?.recommendation}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate('human-review')}
                    className="px-3.5 py-1.5 rounded-xl btn-primary-orange text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-md shadow-orange-500/25"
                  >
                    <span>Open in Human Review Queue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
