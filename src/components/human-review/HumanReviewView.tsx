import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  FileQuestion, 
  PauseCircle, 
  AlertCircle, 
  ShieldAlert, 
  Lock, 
  Clock, 
  Search, 
  Filter, 
  ArrowRight, 
  FileText,
  X,
  Send,
  Eye
} from 'lucide-react';
import { ReviewActionType, HumanReviewCase } from '../../types';
import { generateHumanReviewGuidance } from '../../services/geminiService';
import { Sparkles } from 'lucide-react';

export const HumanReviewView: React.FC = () => {
  const { user } = useAuth();
  const { 
    reviewCases, 
    applications, 
    aiDecisions, 
    policyResults, 
    riskFlags, 
    reviewActions, 
    submitReviewAction 
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  // Review Form state
  const [selectedAction, setSelectedAction] = useState<ReviewActionType>('CONFIRM_AI');
  const [humanFinding, setHumanFinding] = useState('');
  const [mandatoryRationale, setMandatoryRationale] = useState('');
  const [evidenceDoc, setEvidenceDoc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [aiGuidance, setAiGuidance] = useState<string | null>(null);
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);

  // Filtered queue
  const filteredCases = reviewCases.filter(c => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = c.applicant_id.toLowerCase().includes(q);
      const matchName = c.applicant_name.toLowerCase().includes(q);
      if (!matchId && !matchName) return false;
    }
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && c.risk_severity !== filterSeverity) return false;
    return true;
  });

  const activeCase = reviewCases.find(c => c.id === activeCaseId);
  const activeApp = applications.find(a => a.id === activeCase?.application_id);
  const activeDecision = aiDecisions.find(d => d.application_id === activeCase?.application_id);
  const activePolicyChecks = policyResults.filter(p => p.application_id === activeCase?.application_id);
  const activeRiskAlert = riskFlags.find(f => f.id === activeCase?.risk_flag_id);
  const caseActions = reviewActions.filter(a => a.case_id === activeCaseId);

  const handleOpenCase = (c: HumanReviewCase) => {
    setActiveCaseId(c.id);
    setSelectedAction('CONFIRM_AI');
    setHumanFinding(`Affirmed recommendation based on underwriting review.`);
    setMandatoryRationale('');
    setEvidenceDoc('');
    setFormError(null);
    setAiGuidance(null);
  };

  const handleFetchGuidance = async () => {
    if (!activeApp) return;
    setIsLoadingGuidance(true);
    try {
      const failed = activePolicyChecks.filter(p => p.status === 'FAILED');
      const flags = activeRiskAlert ? [activeRiskAlert] : [];
      const guidance = await generateHumanReviewGuidance(activeApp, activeDecision, failed, flags);
      setAiGuidance(guidance);
    } catch (e) {
      console.warn('Guidance fetch failed:', e);
    } finally {
      setIsLoadingGuidance(false);
    }
  };

  const handleActionChange = (action: ReviewActionType) => {
    setSelectedAction(action);
    switch (action) {
      case 'CONFIRM_AI':
        setHumanFinding(`Original AI recommendation confirmed by certified credit underwriter.`);
        break;
      case 'OVERRIDE_AI':
        setHumanFinding(`Overridden: Overruled AI recommendation due to mitigating financial capacity / verified external collateral.`);
        break;
      case 'REQUEST_EVIDENCE':
        setHumanFinding(`Pending Evidence: 2 Years Certified ITR and 6-Month Bank Account Statements requested.`);
        break;
      case 'PLACE_ON_HOLD':
        setHumanFinding(`Case on Hold: Awaiting tradeline reconciliation from credit bureau.`);
        break;
      case 'MARK_INCONCLUSIVE':
        setHumanFinding(`Inconclusive: Insufficient reliable documentation to establish debt serviceability.`);
        break;
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaseId) return;

    if (!mandatoryRationale.trim()) {
      setFormError('Mandatory Rationale is required. Reviewers must provide an explicit documented reason before submitting.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await submitReviewAction({
        caseId: activeCaseId,
        actionType: selectedAction,
        humanFinding,
        mandatoryRationale: mandatoryRationale.trim(),
        evidenceReferences: evidenceDoc.trim() ? [evidenceDoc.trim()] : []
      });

      if (res.success) {
        alert('Review action recorded successfully. Original AI recommendation has been preserved.');
        setActiveCaseId(null);
      } else {
        setFormError(res.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#FF5B26]" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Human Review Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Credit underwriter desk for inspecting flagged loan applications, resolving AI-policy mismatches, and recording mandatory rationales.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-xl">
          <Lock className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>Statutory Rule: Original AI recommendations are never overwritten.</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel-elevated rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search review cases by applicant ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl glass-input text-slate-200 bg-[#121218]"
          >
            <option value="all">All Case Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Evidence Requested">Evidence Requested</option>
            <option value="On Hold">On Hold</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Overridden">Overridden</option>
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

      {/* Human Review Queue Table */}
      <div className="glass-panel-elevated rounded-2xl p-4 sm:p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Application ID</th>
                <th className="pb-3 font-semibold">Applicant Name</th>
                <th className="pb-3 font-semibold">Original AI Decision</th>
                <th className="pb-3 font-semibold">Risk Alert Type</th>
                <th className="pb-3 font-semibold">Severity</th>
                <th className="pb-3 font-semibold">Flagged Date</th>
                <th className="pb-3 font-semibold">Assigned Reviewer</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No human review cases match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredCases.map(c => {
                  const isResolved = c.status === 'Confirmed' || c.status === 'Overridden';
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-mono font-semibold text-[#FF7A00]">{c.applicant_id}</td>
                      <td className="py-3 font-medium text-white">{c.applicant_name}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          c.ai_recommendation === 'Recommended'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : c.ai_recommendation === 'Not Recommended'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                          {c.ai_recommendation}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300 font-mono text-[11px]">
                        {c.risk_type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.risk_severity === 'High'
                            ? 'bg-rose-500/20 text-rose-400'
                            : c.risk_severity === 'Medium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {c.risk_severity}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 text-[11px]">
                        {new Date(c.flagged_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-slate-300">
                        {c.assigned_reviewer_name || 'Unassigned'}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isResolved 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleOpenCase(c)}
                          className="px-3 py-1 rounded-xl btn-primary-orange text-[11px] font-semibold shadow-sm"
                        >
                          {isResolved ? 'Inspect Verdict' : 'Conduct Review'}
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

      {/* Case Review Inspection & Mandatory Action Modal */}
      {activeCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-5xl max-h-[92vh] glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-xl bg-[#FF5B26]/20 text-[#FF7A00] font-mono text-sm font-bold border border-[#FF5B26]/40">
                  {activeCase.applicant_id}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">Underwriting Review Case: {activeCase.applicant_name}</h3>
                  <p className="text-xs text-slate-400">
                    Flagged for: {activeCase.risk_type.replace(/_/g, ' ')} • Severity: {activeCase.risk_severity}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveCaseId(null)}
                className="p-2 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-1">
              {/* Top Side-by-side: AI Recommendation vs Human Underwriting Verdict */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Original AI Decision */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#FF7A00]" />
                      Original AI Decision
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      activeCase.ai_recommendation === 'Recommended'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : activeCase.ai_recommendation === 'Not Recommended'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {activeCase.ai_recommendation}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeDecision?.explanation}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Model: {activeDecision?.model_name} ({activeDecision?.model_version})
                  </p>
                </div>

                {/* Right: Policy Verification & Risk Alert Trigger */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Investigation Trigger
                  </span>
                  <p className="text-xs text-white font-semibold">
                    {activeRiskAlert?.title || 'Policy Discrepancy Flagged'}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeRiskAlert?.description}
                  </p>
                </div>
              </div>

              {/* Individual Policy Checks Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Configured Institutional Policy Checks
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activePolicyChecks.map(p => (
                    <div key={p.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200">{p.policy_name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-400' : p.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
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

              {/* Previous Review Actions if recorded */}
              {caseActions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Recorded Underwriter Verdicts
                  </span>
                  {caseActions.map(act => (
                    <div key={act.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-emerald-500/20 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{act.action_type.replace('_', ' ')} by {act.reviewer_name}</span>
                        <span className="text-[10px] text-slate-400">{new Date(act.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200 font-medium">{act.human_finding}</p>
                      <p className="text-slate-400"><b className="text-slate-300">Rationale:</b> {act.mandatory_rationale}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Action Form (Mandatory Rationale Enforced) */}
              <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-white/[0.04] border border-[#FF5B26]/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#FF7A00]" />
                    Record Underwriter Assessment (Mandatory Rationale Enforced)
                  </h4>
                  <span className="text-[11px] text-slate-400">Reviewer: <b className="text-white">{user?.full_name}</b></span>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {formError}
                  </div>
                )}

                {/* Review Action Radios / Buttons */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-2">
                    Select Review Action
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { type: 'CONFIRM_AI', label: 'Confirm AI', color: 'hover:border-emerald-500' },
                      { type: 'OVERRIDE_AI', label: 'Override AI', color: 'hover:border-rose-500' },
                      { type: 'REQUEST_EVIDENCE', label: 'Request Evidence', color: 'hover:border-amber-500' },
                      { type: 'PLACE_ON_HOLD', label: 'Place on Hold', color: 'hover:border-slate-400' },
                      { type: 'MARK_INCONCLUSIVE', label: 'Mark Inconclusive', color: 'hover:border-purple-500' },
                    ].map(btn => (
                      <button
                        key={btn.type}
                        type="button"
                        onClick={() => handleActionChange(btn.type as ReviewActionType)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                          selectedAction === btn.type
                            ? 'bg-[#FF5B26] text-white border-[#FF5B26] shadow-md shadow-orange-500/25'
                            : `bg-white/[0.03] border-white/[0.08] text-slate-300 ${btn.color}`
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Human Finding Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Formal Finding Summary
                  </label>
                  <input
                    type="text"
                    required
                    value={humanFinding}
                    onChange={(e) => setHumanFinding(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl glass-input text-slate-100"
                    placeholder="Brief verdict summary (e.g., Overridden due to liquid collateral pledge)"
                  />
                </div>

                {/* Gemini AI Underwriting Copilot */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                      Gemini Underwriting Assistance
                    </span>
                    <button
                      type="button"
                      onClick={handleFetchGuidance}
                      disabled={isLoadingGuidance}
                      className="px-2.5 py-1 rounded-lg bg-[#FF5B26]/15 hover:bg-[#FF5B26]/25 border border-[#FF5B26]/30 text-[#FF7A00] text-[10px] font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      {isLoadingGuidance ? (
                        <>
                          <div className="w-2.5 h-2.5 border-2 border-[#FF7A00] border-t-transparent rounded-full animate-spin" />
                          <span>Consulting Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>Get Review Suggestions</span>
                        </>
                      )}
                    </button>
                  </div>
                  {aiGuidance && (
                    <div className="p-2.5 rounded-lg bg-black/40 border border-[#FF5B26]/20 text-[11px] text-slate-200 leading-relaxed font-sans">
                      <p>{aiGuidance}</p>
                    </div>
                  )}
                </div>

                {/* Mandatory Reviewer Rationale */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase">
                      Mandatory Reviewer Rationale <span className="text-[#FF7A00]">* (Required)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Empty rationale is prohibited by compliance policy</span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={mandatoryRationale}
                    onChange={(e) => setMandatoryRationale(e.target.value)}
                    placeholder="Provide a detailed, documented justification for this decision. For overrides, explain why policy or mitigating factors counter the AI model recommendation..."
                    className="w-full p-3 text-xs rounded-xl glass-input text-slate-100 resize-none font-sans"
                  />
                </div>

                {/* Evidence References */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Evidence References / Document IDs (Optional)
                  </label>
                  <input
                    type="text"
                    value={evidenceDoc}
                    onChange={(e) => setEvidenceDoc(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl glass-input text-slate-100"
                    placeholder="e.g. Form-16 FY 2024-25, Bank Statement HDFC #8821, Collateral Title Deed #1092"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !mandatoryRationale.trim()}
                    className="px-6 py-2.5 rounded-xl btn-primary-orange text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/30 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Saving Audit Record...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Underwriting Action</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
