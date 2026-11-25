import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  Hash, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Eye, 
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { generateAuditPDFReport } from '../../services/pdfReportService';
import { verifyApplicationAuditTrail } from '../../services/auditService';

export const AuditReportsView: React.FC = () => {
  const { user } = useAuth();
  const { 
    applications, 
    aiDecisions, 
    policyResults, 
    riskFlags, 
    reviewCases, 
    reviewActions, 
    auditEvents,
    reports,
    generateReport
  } = useApp();

  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [search, setSearch] = useState('');
  const [integrityStatus, setIntegrityStatus] = useState<{ [appId: string]: { isValid: boolean; error?: string } }>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const selectedApp = applications.find(a => a.id === selectedAppId);
  const selectedDecision = aiDecisions.find(d => d.application_id === selectedAppId);
  const selectedPolicyResults = policyResults.filter(p => p.application_id === selectedAppId);
  const selectedRiskFlags = riskFlags.filter(f => f.application_id === selectedAppId);
  const selectedReviewCase = reviewCases.find(c => c.application_id === selectedAppId);
  const selectedReviewActions = reviewActions.filter(a => a.application_id === selectedAppId);
  const selectedEvents = auditEvents.filter(e => e.application_id === selectedAppId);

  // Run SHA-256 chain verification for the current application
  const handleVerifyChain = async () => {
    if (!selectedAppId) return;
    setIsVerifying(true);
    try {
      const result = await verifyApplicationAuditTrail(selectedEvents);
      setIntegrityStatus(prev => ({
        ...prev,
        [selectedAppId]: result
      }));
    } finally {
      setIsVerifying(false);
    }
  };

  // Generate and download PDF report with Gemini AI Summary
  const handleDownloadReport = async () => {
    if (!selectedApp) return;
    setIsGeneratingPdf(true);
    try {
      const res = await generateReport(selectedApp.applicant_id);
      if (!res.success) {
        alert(res.error || 'Failed to generate audit report.');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating PDF report.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const currentVerification = integrityStatus[selectedAppId];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF7A00]" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Audit Engine & PDF Report Generator</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable append-only audit event logging with cryptographic SHA-256 hash chains and regulatory report generation.
          </p>
        </div>

        {selectedApp && (
          <button
            onClick={handleDownloadReport}
            disabled={isGeneratingPdf}
            className="px-4 py-2.5 rounded-xl btn-primary-orange text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/25"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : `Download PDF for ${selectedApp.applicant_id}`}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Application Selector on Left (4 cols), Inspection & Report Preview on Right (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Applications Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="glass-panel-elevated rounded-2xl p-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3">
              Select Loan Application
            </span>

            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search applicant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl glass-input text-slate-100"
              />
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1">
              {applications
                .filter(a => search ? (a.applicant_id.toLowerCase().includes(search.toLowerCase()) || a.full_name.toLowerCase().includes(search.toLowerCase())) : true)
                .map(app => {
                  const isSelected = app.id === selectedAppId;
                  const eventCount = auditEvents.filter(e => e.application_id === app.id).length;
                  const flags = riskFlags.filter(f => f.application_id === app.id);

                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected 
                          ? 'bg-[#FF5B26]/15 border-[#FF5B26]/50 shadow-md shadow-orange-500/10' 
                          : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#FF7A00]">{app.applicant_id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{eventCount} events</span>
                      </div>
                      <p className="text-xs font-medium text-white mt-0.5">{app.full_name}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pt-1 border-t border-white/[0.04]">
                        <span>₹{app.loan_amount.toLocaleString()}</span>
                        {flags.length > 0 ? (
                          <span className="text-amber-400 font-semibold">{flags.length} Flag(s)</span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">Clean</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Cryptographic Hash Integrity Assurance Card */}
          <div className="glass-panel-elevated rounded-2xl p-4 border border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-bold text-white mb-2">
              <Hash className="w-4 h-4 text-[#FF7A00]" />
              <span>SHA-256 Hash Chain Integrity</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every audit record cryptographically binds the current state to the previous record hash. Any tampering with historical events produces an invalid hash verification error.
            </p>

            <button
              onClick={handleVerifyChain}
              disabled={isVerifying || !selectedAppId}
              className="mt-3 w-full py-2 rounded-xl bg-white/[0.05] hover:bg-[#FF5B26]/20 border border-white/[0.1] hover:border-[#FF5B26]/40 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying Chain...' : 'Verify Cryptographic Hash Chain'}</span>
            </button>

            {currentVerification && (
              <div className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2 ${
                currentVerification.isValid 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {currentVerification.isValid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Chain Verified Valid</p>
                      <p className="text-[10px] text-emerald-400/80 mt-0.5">
                        All {selectedEvents.length} chronological events have unbroken SHA-256 signatures matching genesis root.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Tamper Detected</p>
                      <p className="text-[10px] text-rose-400/80 mt-0.5">{currentVerification.error}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Complete 8-Section Audit Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedApp ? (
            <div className="glass-panel-elevated rounded-2xl p-6 border border-white/[0.1] space-y-6">
              {/* Report Header Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#171720] to-[#121218] border border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider block">
                    Certified Audit Report Preview
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Report ID: TT-REP-{selectedApp.applicant_id}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Generated: {new Date().toLocaleString()} • Examiner: {user?.full_name}
                  </p>
                </div>

                <button
                  onClick={handleDownloadReport}
                  className="px-3.5 py-1.5 rounded-xl btn-primary-orange text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-orange-500/25"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
              </div>

              {/* SECTION 2: APPLICANT FINANCIAL INFORMATION */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block pb-1 border-b border-white/[0.06]">
                  Section 2: Applicant Information
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.02]">
                    <span className="text-[10px] text-slate-400 block">Name</span>
                    <span className="font-semibold text-white">{selectedApp.full_name}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02]">
                    <span className="text-[10px] text-slate-400 block">Requested Loan</span>
                    <span className="font-semibold text-white">₹{selectedApp.loan_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02]">
                    <span className="text-[10px] text-slate-400 block">Monthly Income</span>
                    <span className="font-semibold text-white">₹{selectedApp.monthly_income.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02]">
                    <span className="text-[10px] text-slate-400 block">DTI Ratio</span>
                    <span className="font-semibold text-white">{selectedApp.dti_ratio}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02]">
                    <span className="text-[10px] text-slate-400 block">Credit Bureau Score</span>
                    <span className="font-semibold text-white">{selectedApp.credit_score}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02]">
                    <span className="text-[10px] text-slate-400 block">Employment</span>
                    <span className="font-semibold text-white">{selectedApp.employment_type}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02]">
                    <span className="text-[10px] text-slate-400 block">Income Proof Status</span>
                    <span className="font-semibold text-white">{selectedApp.income_proof_status}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02]">
                    <span className="text-[10px] text-slate-400 block">Loan Purpose</span>
                    <span className="font-semibold text-white">{selectedApp.loan_purpose}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ORIGINAL AI RECOMMENDATION */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block pb-1 border-b border-white/[0.06]">
                  Section 3: Original AI Recommendation (Immutable Record)
                </span>
                {selectedDecision ? (
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Recommendation: {selectedDecision.recommendation}</span>
                      <span className="text-slate-400 text-[10px] font-mono">
                        {selectedDecision.model_name} • Conf: {selectedDecision.confidence_score}%
                      </span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{selectedDecision.explanation}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No AI evaluation recorded.</p>
                )}
              </div>

              {/* SECTION 4: POLICY VERIFICATION */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block pb-1 border-b border-white/[0.06]">
                  Section 4: Configured Policy Verification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedPolicyResults.map(p => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{p.policy_name}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          p.status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-400' : p.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Threshold: {p.configured_threshold} | Actual: {p.actual_applicant_value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 7: CHRONOLOGICAL AUDIT HISTORY WITH SHA-256 HASH CHAIN */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block pb-1 border-b border-white/[0.06] flex items-center justify-between">
                  <span>Section 7: Append-Only Chronological Events & SHA-256 Signatures</span>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedEvents.length} Verified Entries</span>
                </span>
                <div className="space-y-2">
                  {selectedEvents.map((ev, idx) => (
                    <div key={ev.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#FF7A00]">
                          #{idx + 1} {ev.event_type}
                        </span>
                        <span className="text-slate-400">{new Date(ev.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-200 font-sans">{ev.description}</p>
                      <div className="text-[9px] text-slate-400 space-y-0.5 pt-1">
                        <div className="truncate">Previous Hash: {ev.previous_hash}</div>
                        <div className="truncate text-emerald-400 font-bold">Current Hash: {ev.current_hash}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 8: MANDATORY STATUTORY DISCLAIMER */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Section 8: Regulatory Notice & Statutory Disclaimer
                </span>
                <p className="text-[11px] text-slate-400 italic leading-relaxed">
                  "This report documents AI-generated recommendations, configured policy verification results, and human review activities. It does not constitute a final loan sanction or financial approval."
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-panel-elevated rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select an application on the left to inspect its audit trail and generate PDF reports.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
