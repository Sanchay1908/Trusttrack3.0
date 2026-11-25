import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  X,
  ExternalLink,
  Lock,
  Hash
} from 'lucide-react';
import { generateAuditPDFReport } from '../../services/pdfReportService';

export const DecisionLogView: React.FC<{ initialSearchId?: string }> = ({ initialSearchId }) => {
  const { user } = useAuth();
  const { applications, aiDecisions, policyResults, riskFlags, reviewCases, reviewActions, auditEvents } = useApp();

  const [searchQuery, setSearchQuery] = useState(initialSearchId || '');
  const [filterRecommendation, setFilterRecommendation] = useState<string>('all');
  const [filterRiskStatus, setFilterRiskStatus] = useState<string>('all');
  const [filterReviewStatus, setFilterReviewStatus] = useState<string>('all');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Summary counts
  const totalCount = applications.length;
  const recommendedCount = aiDecisions.filter(d => d.recommendation === 'Recommended').length;
  const notRecommendedCount = aiDecisions.filter(d => d.recommendation === 'Not Recommended').length;
  const needsInfoCount = aiDecisions.filter(d => d.recommendation === 'Needs More Information').length;
  const inconclusiveCount = aiDecisions.filter(d => d.recommendation === 'Inconclusive').length;

  // Filtered Applications
  const filteredApps = applications.filter(app => {
    const decision = aiDecisions.find(d => d.application_id === app.id);
    const flags = riskFlags.filter(f => f.application_id === app.id);
    const review = reviewCases.find(c => c.application_id === app.id);

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = app.applicant_id.toLowerCase().includes(q);
      const matchName = app.full_name.toLowerCase().includes(q);
      if (!matchId && !matchName) return false;
    }

    // Recommendation filter
    if (filterRecommendation !== 'all') {
      if (decision?.recommendation !== filterRecommendation) return false;
    }

    // Risk status filter
    if (filterRiskStatus !== 'all') {
      if (filterRiskStatus === 'flagged' && flags.length === 0) return false;
      if (filterRiskStatus === 'clean' && flags.length > 0) return false;
      if (filterRiskStatus === 'mismatch' && !flags.some(f => f.risk_type.includes('MISMATCH'))) return false;
    }

    // Review status filter
    if (filterReviewStatus !== 'all') {
      if (filterReviewStatus === 'pending' && (!review || review.status !== 'Pending Review')) return false;
      if (filterReviewStatus === 'investigating' && (!review || review.status !== 'Under Investigation')) return false;
      if (filterReviewStatus === 'resolved' && app.application_status !== 'resolved') return false;
    }

    return true;
  });

  const selectedApp = applications.find(a => a.id === selectedAppId);
  const selectedDecision = aiDecisions.find(d => d.application_id === selectedAppId);
  const selectedPolicyResults = policyResults.filter(p => p.application_id === selectedAppId);
  const selectedRiskFlags = riskFlags.filter(f => f.application_id === selectedAppId);
  const selectedReviewCase = reviewCases.find(c => c.application_id === selectedAppId);
  const selectedReviewActions = reviewActions.filter(a => a.application_id === selectedAppId);
  const selectedAuditEvents = auditEvents.filter(e => e.application_id === selectedAppId);

  const handleDownloadPdf = () => {
    if (!selectedApp || !user) return;
    setIsGeneratingPdf(true);
    try {
      const { doc, fileName } = generateAuditPDFReport({
        application: selectedApp,
        aiDecision: selectedDecision,
        policyResults: selectedPolicyResults,
        riskFlags: selectedRiskFlags,
        reviewCase: selectedReviewCase,
        reviewActions: selectedReviewActions,
        auditEvents: selectedAuditEvents,
        generatedBy: user
      });
      doc.save(fileName);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Error generating PDF report.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#FF7A00]" />
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Decision Log</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete database of applicant records, original AI recommendations, policy verifications, and audit trails.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="glass-panel-elevated rounded-xl p-3.5 border-l-2 border-l-slate-400">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Evaluated</span>
          <span className="text-xl font-bold text-white mt-1 block">{totalCount}</span>
        </div>
        <div className="glass-panel-elevated rounded-xl p-3.5 border-l-2 border-l-emerald-400">
          <span className="text-[10px] uppercase font-semibold text-emerald-400 block">AI Recommended</span>
          <span className="text-xl font-bold text-white mt-1 block">{recommendedCount}</span>
        </div>
        <div className="glass-panel-elevated rounded-xl p-3.5 border-l-2 border-l-rose-400">
          <span className="text-[10px] uppercase font-semibold text-rose-400 block">AI Not Recommended</span>
          <span className="text-xl font-bold text-white mt-1 block">{notRecommendedCount}</span>
        </div>
        <div className="glass-panel-elevated rounded-xl p-3.5 border-l-2 border-l-amber-400">
          <span className="text-[10px] uppercase font-semibold text-amber-400 block">Needs More Info</span>
          <span className="text-xl font-bold text-white mt-1 block">{needsInfoCount}</span>
        </div>
        <div className="glass-panel-elevated rounded-xl p-3.5 border-l-2 border-l-purple-400">
          <span className="text-[10px] uppercase font-semibold text-purple-400 block">Inconclusive</span>
          <span className="text-xl font-bold text-white mt-1 block">{inconclusiveCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel-elevated rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Applicant ID (e.g. LN006) or applicant name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input text-slate-100"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Recommendation Filter */}
          <select
            value={filterRecommendation}
            onChange={(e) => setFilterRecommendation(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl glass-input text-slate-200 bg-[#121218]"
          >
            <option value="all">AI: All Recommendations</option>
            <option value="Recommended">Recommended</option>
            <option value="Not Recommended">Not Recommended</option>
            <option value="Needs More Information">Needs More Information</option>
            <option value="Inconclusive">Inconclusive</option>
          </select>

          {/* Risk Status Filter */}
          <select
            value={filterRiskStatus}
            onChange={(e) => setFilterRiskStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl glass-input text-slate-200 bg-[#121218]"
          >
            <option value="all">Risk: All Statuses</option>
            <option value="mismatch">Potential AI-Policy Mismatches</option>
            <option value="flagged">Any Risk Alert Flagged</option>
            <option value="clean">Clean / No Alerts</option>
          </select>

          {/* Review Filter */}
          <select
            value={filterReviewStatus}
            onChange={(e) => setFilterReviewStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl glass-input text-slate-200 bg-[#121218]"
          >
            <option value="all">Review: All Cases</option>
            <option value="pending">Pending Review</option>
            <option value="investigating">Under Investigation</option>
            <option value="resolved">Resolved</option>
          </select>

          {(searchQuery || filterRecommendation !== 'all' || filterRiskStatus !== 'all' || filterReviewStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterRecommendation('all');
                setFilterRiskStatus('all');
                setFilterReviewStatus('all');
              }}
              className="text-xs text-[#FF7A00] hover:underline px-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel-elevated rounded-2xl p-4 sm:p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Application ID</th>
                <th className="pb-3 font-semibold">Applicant Name</th>
                <th className="pb-3 font-semibold">Loan Amount</th>
                <th className="pb-3 font-semibold">Income & DTI</th>
                <th className="pb-3 font-semibold">Credit Score</th>
                <th className="pb-3 font-semibold">AI Recommendation</th>
                <th className="pb-3 font-semibold">Risk Status</th>
                <th className="pb-3 font-semibold">Review Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No loan applications match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredApps.map(app => {
                  const decision = aiDecisions.find(d => d.application_id === app.id);
                  const flags = riskFlags.filter(f => f.application_id === app.id);
                  const isMismatch = flags.some(f => f.risk_type.includes('MISMATCH'));
                  const review = reviewCases.find(c => c.application_id === app.id);

                  return (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-mono font-semibold text-[#FF7A00]">
                        {app.applicant_id}
                      </td>
                      <td className="py-3 font-medium text-white">
                        {app.full_name}
                      </td>
                      <td className="py-3 text-slate-200">
                        ₹{app.loan_amount.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className="text-slate-200">₹{app.monthly_income.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">DTI: {app.dti_ratio}%</span>
                      </td>
                      <td className="py-3 font-semibold">
                        <span className={app.credit_score >= 650 ? 'text-emerald-400' : 'text-rose-400'}>
                          {app.credit_score}
                        </span>
                      </td>
                      <td className="py-3">
                        {decision ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            decision.recommendation === 'Recommended'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : decision.recommendation === 'Not Recommended'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}>
                            {decision.recommendation}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Unprocessed</span>
                        )}
                      </td>
                      <td className="py-3">
                        {isMismatch ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-subtle-pulse">
                            AI-Policy Mismatch
                          </span>
                        ) : flags.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            {flags.length} Risk Alert(s)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                            Clean
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {review ? (
                          <span className="text-slate-300 font-medium text-[11px]">
                            {review.status}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Auto-Resolved</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedAppId(app.id)}
                          className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-[#FF5B26]/20 border border-white/[0.08] hover:border-[#FF5B26]/40 text-slate-300 hover:text-white transition-all text-[11px] font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Application Inspection Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl max-h-[90vh] glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-xl bg-[#FF5B26]/20 text-[#FF7A00] font-mono text-sm font-bold border border-[#FF5B26]/40">
                  {selectedApp.applicant_id}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedApp.full_name}</h3>
                  <p className="text-xs text-slate-400">
                    Loan Requested: ₹{selectedApp.loan_amount.toLocaleString()} • {selectedApp.loan_purpose}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="px-3.5 py-1.5 rounded-xl btn-primary-orange text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-orange-500/25"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Audit Report'}</span>
                </button>

                <button
                  onClick={() => setSelectedAppId(null)}
                  className="p-2 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-1">
              {/* Section 1: Financial Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Monthly Income</span>
                  <span className="text-sm font-bold text-white block mt-0.5">₹{selectedApp.monthly_income.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Monthly Debt</span>
                  <span className="text-sm font-bold text-white block mt-0.5">₹{selectedApp.monthly_debt.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">DTI Ratio</span>
                  <span className={`text-sm font-bold block mt-0.5 ${selectedApp.dti_ratio <= 35 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedApp.dti_ratio}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Credit Score</span>
                  <span className={`text-sm font-bold block mt-0.5 ${selectedApp.credit_score >= 650 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedApp.credit_score}
                  </span>
                </div>
              </div>

              {/* Section 2: Original AI Recommendation (Immutable Record) */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#FF7A00]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Original AI Decision (Immutable Record)
                    </span>
                  </div>
                  {selectedDecision && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      selectedDecision.recommendation === 'Recommended'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : selectedDecision.recommendation === 'Not Recommended'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {selectedDecision.recommendation}
                    </span>
                  )}
                </div>

                {selectedDecision && (
                  <>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {selectedDecision.explanation}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-2 border-t border-white/[0.04]">
                      <span>Model: <b className="text-slate-300">{selectedDecision.model_name}</b></span>
                      <span>Version: <b className="text-slate-300">{selectedDecision.model_version}</b></span>
                      <span>Confidence: <b className="text-slate-300">{selectedDecision.confidence_score}%</b></span>
                      <span>Recorded: <b className="text-slate-300">{new Date(selectedDecision.created_at).toLocaleString()}</b></span>
                    </div>
                  </>
                )}
              </div>

              {/* Section 3: Policy Verification Results */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Risk Engine: Policy Verification Results
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedPolicyResults.map(p => (
                    <div key={p.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{p.policy_name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'PASSED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : p.status === 'FAILED'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Required: {p.configured_threshold} | Actual: {p.actual_applicant_value}</p>
                      <p className="text-[11px] text-slate-300 mt-1">{p.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Risk Alerts if any */}
              {selectedRiskFlags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Triggered Risk Alerts & Discrepancies
                  </span>
                  {selectedRiskFlags.map(f => (
                    <div key={f.id} className="p-3 rounded-xl bg-rose-500/[0.08] border border-rose-500/30 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-rose-300">{f.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 uppercase">
                          {f.severity} Severity
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 mt-0.5">{f.description}</p>
                      {f.policy_mismatch_details && (
                        <p className="text-[10px] text-rose-300/80 mt-1 font-mono">{f.policy_mismatch_details}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Section 5: Human Review Findings */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Human Review & Underwriting Findings
                </span>
                {selectedReviewActions.length > 0 ? (
                  selectedReviewActions.map(act => (
                    <div key={act.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Reviewer: {act.reviewer_name}</span>
                        <span className="px-2 py-0.5 rounded bg-brand/20 text-brand font-bold text-[10px]">
                          {act.action_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 font-medium">Finding: {act.human_finding}</p>
                      <p className="text-[11px] text-slate-400">
                        <b className="text-slate-300">Mandatory Rationale:</b> {act.mandatory_rationale}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Original AI Recommendation Preserved: <b className="text-slate-300">{act.original_ai_recommendation}</b>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No human review actions recorded yet.</p>
                )}
              </div>

              {/* Section 6: Append-only Chronological Audit Timeline with Hash Chain */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#FF7A00]" />
                  SHA-256 Tamper-Evident Audit Timeline
                </span>
                <div className="space-y-2">
                  {selectedAuditEvents.map(ev => (
                    <div key={ev.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-mono">
                      <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                        <span className="font-bold text-[#FF7A00]">{ev.event_type}</span>
                        <span className="text-slate-400">{new Date(ev.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans">{ev.description}</p>
                      <div className="mt-1.5 text-[9px] text-slate-400 space-y-0.5">
                        <div className="truncate">Prev Hash: {ev.previous_hash}</div>
                        <div className="truncate text-emerald-400">Curr Hash: {ev.current_hash}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
