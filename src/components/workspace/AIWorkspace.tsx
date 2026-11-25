import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  Sparkles, 
  Trash2, 
  FileText, 
  Copy, 
  ArrowRight,
  Clock, 
  Key,
  ShieldAlert,
  ShieldCheck,
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  Flame,
  Info
} from 'lucide-react';
import { ValidationIssue } from '../../services/geminiService';

const SAMPLE_MULTI_PASTE = `Applicant ID: LN011
Name: Anand Raman
Monthly Income: ₹75,000
Monthly Debt: ₹14,000
Credit Score: 765
Loan Amount: ₹6,00,000
Employment: Salaried
Employer: Larsen & Toubro
Income Proof: Available
Purpose: Electric Vehicle Purchase
Tenure: 48

Applicant ID: LN012
Name: Meenakshi Sundaram
Monthly Income: ₹32,000
Monthly Debt: ₹16,000
Credit Score: 615
Loan Amount: ₹9,00,000
Employment: Salaried
Employer: Express Cargo
Income Proof: Missing
Purpose: Debt Consolidation
Tenure: 36

Applicant ID: LN013
Name: Rajesh Patel
Monthly Income: ₹68,000
Monthly Debt: ₹11,000
Credit Score: 780
Loan Amount: ₹5,00,000
Employment: Salaried
Employer: Tata Consultancy Services
Income Proof: Available
Purpose: Home Improvement
Tenure: 24`;

export const AIWorkspace: React.FC<{ onNavigate: (tab: string, param?: string) => void }> = ({ onNavigate }) => {
  const { 
    analyzeBatch, 
    geminiApiKey, 
    setGeminiApiKey, 
    aiDecisions, 
    applications,
    policies,
    policyResults,
    riskFlags,
    executionMode,
    setExecutionMode,
    simulationProbability,
    setSimulationProbability
  } = useApp();

  const [inputText, setInputText] = useState(SAMPLE_MULTI_PASTE);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.8-flash'>('gemini-3.5-flash');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [lastResults, setLastResults] = useState<any[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<ValidationIssue[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey);

  const handleRunAnalysis = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setValidationWarnings([]);
    setAnalysisStep('1. Parsing and isolating individual applicant records...');
    
    setTimeout(() => setAnalysisStep('2. Validating applicant financial parameters & debt ratios...'), 300);
    setTimeout(() => setAnalysisStep('3. Dispatching structured prompt to Google Gemini Underwriting Model...'), 700);
    setTimeout(() => setAnalysisStep('4. Saving immutable original AI recommendations in database...'), 1200);
    setTimeout(() => setAnalysisStep('5. Executing Risk Engine policy checks & mismatch detection...'), 1500);

    try {
      const res = await analyzeBatch(inputText, selectedModel, executionMode);
      if (res.validationIssues && res.validationIssues.length > 0) {
        setValidationWarnings(res.validationIssues);
      }
      setAnalysisStep('Analysis completed successfully!');
      const latestDecisions = aiDecisions.slice(0, res.processedCount);
      setLastResults(latestDecisions);
    } catch (err: any) {
      alert('Analysis error: ' + err.message);
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisStep('');
      }, 500);
    }
  };

  const handleClear = () => {
    setInputText('');
    setLastResults([]);
    setValidationWarnings([]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5B26] to-[#FF8A00] flex items-center justify-center text-white shadow-md shadow-orange-500/25">
              <Bot className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Underwriting Workspace</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Institutional multi-applicant underwriting engine powered by Google Gemini and independent TrustTrack Policy Verification.
          </p>
        </div>

        {/* Top Controls: Mode Switcher & Settings */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live vs Demo Simulation Mode Toggle */}
          <div className="flex items-center bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl text-xs">
            <button
              onClick={() => setExecutionMode('simulation')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                executionMode === 'simulation'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Simulates controlled realistic AI errors (e.g. wrong rejections, missed policy failures) to prove TrustTrack accountability"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Simulation</span>
            </button>

            <button
              onClick={() => setExecutionMode('live')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                executionMode === 'live'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Direct Google Gemini inference without simulated mistake injection"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Mode</span>
            </button>
          </div>

          {/* Model Selector */}
          <div className="flex items-center bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl text-xs">
            <span className="text-[10px] text-slate-400 px-2 font-mono uppercase">Model:</span>
            <button
              onClick={() => setSelectedModel('gemini-3.5-flash')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedModel === 'gemini-3.5-flash'
                  ? 'bg-[#FF5B26] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gemini 3.5 Flash
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.8-flash')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedModel === 'gemini-3.8-flash'
                  ? 'bg-[#FF5B26] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gemini 3.8
            </button>
          </div>

          {/* API Key Modal Button */}
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="hidden sm:inline">
              {geminiApiKey ? 'Gemini Key Configured' : 'Set API Key'}
            </span>
          </button>
        </div>
      </div>

      {/* Mode Explanatory Notice */}
      <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-4 ${
        executionMode === 'simulation'
          ? 'bg-amber-500/[0.06] border-amber-500/25 text-amber-200'
          : 'bg-emerald-500/[0.06] border-emerald-500/25 text-emerald-200'
      }`}>
        <div className="flex items-center gap-2.5">
          {executionMode === 'simulation' ? (
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {executionMode === 'simulation' ? 'DEMO SIMULATION MODE ACTIVE' : 'LIVE AUTONOMOUS INFERENCE ACTIVE'}
            </span>
            <p className="text-[11px] opacity-90 mt-0.5">
              {executionMode === 'simulation' 
                ? 'Controlled, realistic AI errors (wrong rejections, overlooked policy breaches, missing data approvals) are occasionally simulated (~20%) to demonstrate TrustTrack\'s independent detection layer.'
                : 'Direct Gemini API evaluation without simulated mistakes. TrustTrack independently verifies all financial metrics against configured risk policies.'}
            </p>
          </div>
        </div>

        {executionMode === 'simulation' && (
          <div className="flex items-center gap-1.5 shrink-0 bg-black/30 px-2.5 py-1 rounded-xl border border-white/[0.08]">
            <span className="text-[10px] text-slate-300">Sim Error Rate:</span>
            <select
              value={simulationProbability}
              onChange={(e) => setSimulationProbability(parseFloat(e.target.value))}
              className="bg-transparent text-[11px] font-bold text-amber-300 outline-none cursor-pointer"
            >
              <option value="0.10" className="bg-[#121218] text-white">10%</option>
              <option value="0.20" className="bg-[#121218] text-white">20% (Default)</option>
              <option value="0.35" className="bg-[#121218] text-white">35%</option>
              <option value="0.50" className="bg-[#121218] text-white">50%</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multi-Applicant Input Box (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="glass-panel-elevated rounded-2xl p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#FF7A00]" />
                  Applicant Profiles Input
                </span>
                <button
                  onClick={() => setInputText(SAMPLE_MULTI_PASTE)}
                  className="text-[11px] text-[#FF7A00] hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Load Sample Batch
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                Paste one or multiple applicant dossiers. TrustTrack parses monthly income, debt obligations, credit score, loan amount, and income documentation automatically.
              </p>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={16}
                placeholder="Applicant ID: LN001&#10;Name: Arun&#10;Monthly Income: ₹65,000&#10;Monthly Debt: ₹12,000&#10;Credit Score: 750&#10;Loan Amount: ₹5,00,000&#10;Employment: Salaried&#10;Income Proof: Available"
                className="w-full p-3.5 text-xs rounded-xl glass-input font-mono text-slate-200 leading-relaxed resize-none focus:ring-1 focus:ring-[#FF5B26]"
              />
            </div>

            {/* Validation Warnings Box */}
            {validationWarnings.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Pre-flight Data Validation Warnings</span>
                </div>
                {validationWarnings.map((w, idx) => (
                  <p key={idx} className="text-[10px] text-amber-200/90 leading-tight">
                    • [{w.applicant_id}] {w.message}
                  </p>
                ))}
              </div>
            )}

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={handleClear}
                disabled={isAnalyzing || !inputText}
                className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-slate-200 text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !inputText.trim()}
                className="px-5 py-2.5 rounded-xl btn-primary-orange text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/30 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Batch...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Gemini Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress / Pipeline Execution */}
          {isAnalyzing && (
            <div className="p-4 rounded-xl bg-[#FF5B26]/10 border border-[#FF5B26]/30 text-xs text-orange-200 animate-fadeIn">
              <div className="flex items-center gap-2 font-semibold text-[#FF8A00] mb-1">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Underwriting Pipeline Execution</span>
              </div>
              <p className="font-mono text-[11px] text-slate-300">{analysisStep}</p>
            </div>
          )}
        </div>

        {/* Right Column: AI Analysis Output Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>AI Evaluation & Independent Policy Verification</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              {applications.length} Total Dossiers Evaluated
            </span>
          </div>

          {/* Empty State */}
          {lastResults.length === 0 ? (
            <div className="glass-panel-elevated rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 mb-3">
                <Sparkles className="w-6 h-6 text-[#FF7A00]" />
              </div>
              <h3 className="text-base font-bold text-white">Ready for Multi-Applicant Underwriting</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Paste applicant profiles on the left and click "Run Gemini Evaluation". TrustTrack will generate structured AI reasoning, verify configurable policies, detect mismatches, and preserve immutable decision logs.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleRunAnalysis}
                  className="px-4 py-2 rounded-xl btn-primary-orange text-xs font-semibold shadow-md shadow-orange-500/25"
                >
                  Analyze Sample Dossiers
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {lastResults.map((decision) => {
                const app = applications.find(a => a.id === decision.application_id || a.applicant_id === decision.applicant_id);
                const appPolicyResults = policyResults.filter(p => p.application_id === app?.id);
                const appRiskFlags = riskFlags.filter(r => r.application_id === app?.id);
                const hasMismatch = appRiskFlags.some(f => f.risk_type.includes('MISMATCH') || f.risk_type.includes('CONTRADICTION'));

                return (
                  <div key={decision.id} className="glass-panel-elevated rounded-2xl p-5 border border-white/[0.09] space-y-4">
                    {/* Top Row: Applicant Header & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FF5B26]/15 text-[#FF7A00] font-mono text-xs font-bold border border-[#FF5B26]/30">
                          {decision.applicant_id}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{app?.full_name || 'Loan Applicant'}</h4>
                          <span className="text-[11px] text-slate-400">
                            Loan: ₹{app?.loan_amount.toLocaleString()} • Income: ₹{app?.monthly_income.toLocaleString()} • DTI: {app?.dti_ratio}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Simulation vs Live Badge */}
                        {decision.is_simulation ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                            Demo Simulation
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                            Live Inference
                          </span>
                        )}

                        {/* AI Recommendation Badge */}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          decision.recommendation === 'Recommended'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : decision.recommendation === 'Not Recommended'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                          {decision.recommendation}
                        </span>

                        <span className="text-[10px] text-slate-400 bg-white/[0.04] px-2 py-1 rounded-lg border border-white/[0.06] font-mono">
                          Confidence: {decision.confidence_score}%
                        </span>
                      </div>
                    </div>

                    {/* Simulation Mistake Banner (if simulated) */}
                    {decision.is_simulation && decision.simulation_scenario && (
                      <div className="p-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 text-xs">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          Simulated Error Demonstration: {decision.simulation_scenario}
                        </span>
                        <p className="text-[11px] text-amber-200/90 mt-0.5">
                          {decision.simulation_reason}
                        </p>
                      </div>
                    )}

                    {/* AI Decision Explanation */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Gemini Underwriting Explanation
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {decision.explanation}
                      </p>
                    </div>

                    {/* Financial Factors Considered */}
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Financial Parameters Considered by AI
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {decision.financial_factors?.map((f: any, idx: number) => (
                          <div key={idx} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                            <span className="text-[10px] text-slate-400 block truncate">{f.name}</span>
                            <span className="text-xs font-semibold text-white block mt-0.5">{f.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TRUSTTRACK INDEPENDENT VERIFICATION SECTION */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-[#FF5B26]/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Scale className="w-4 h-4 text-[#FF7A00]" />
                          Independent TrustTrack Policy Verification
                        </span>

                        {hasMismatch ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            POTENTIAL AI-POLICY MISMATCH
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            POLICY ALIGNED
                          </span>
                        )}
                      </div>

                      {/* Policy Results Pill Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {appPolicyResults.map((pr) => (
                          <div 
                            key={pr.id} 
                            className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
                              pr.status === 'PASSED'
                                ? 'bg-emerald-500/[0.05] border-emerald-500/20 text-emerald-300'
                                : pr.status === 'FAILED'
                                ? 'bg-rose-500/[0.05] border-rose-500/20 text-rose-300'
                                : 'bg-amber-500/[0.05] border-amber-500/20 text-amber-300'
                            }`}
                          >
                            <span className="font-medium truncate">{pr.policy_name}</span>
                            <span className="font-bold uppercase tracking-wider">{pr.status}</span>
                          </div>
                        ))}
                      </div>

                      {/* Risk Alerts Flagged */}
                      {appRiskFlags.length > 0 && (
                        <div className="p-2 rounded-lg bg-rose-500/[0.08] border border-rose-500/20 text-[11px] text-rose-200">
                          <span className="font-bold text-rose-300 block mb-0.5">
                            Escalated to Human Review:
                          </span>
                          {appRiskFlags.map((rf) => (
                            <p key={rf.id} className="text-[10px] text-slate-300">
                              • {rf.title}: {rf.description}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Metadata Footer & Navigation */}
                    <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-mono font-medium">{decision.model_name}</span>
                        <span>•</span>
                        <span className="text-[#FF7A00]">Original AI Decision Saved (Immutable)</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {hasMismatch && (
                          <button
                            onClick={() => onNavigate('human-review')}
                            className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                          >
                            <span>Open Human Review</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => onNavigate('decision-log', decision.applicant_id)}
                          className="text-white hover:text-[#FF7A00] font-semibold flex items-center gap-1"
                        >
                          <span>Decision Log</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Gemini API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel-elevated rounded-3xl p-6 border border-white/[0.1] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Key className="w-4 h-4 text-[#FF7A00]" />
                <span>Google Gemini API Configuration</span>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              TrustTrack connects to Google Gemini via secure client credentials. Enter your Google Generative Language API key below:
            </p>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AQ.Ab8RN... or AIzaSy..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input text-slate-100 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setGeminiApiKey(tempApiKey);
                  setShowApiKeyModal(false);
                }}
                className="px-4 py-1.5 rounded-xl btn-primary-orange text-xs font-semibold"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
