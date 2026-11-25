import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LoanApplication, 
  AIDecision, 
  LoanPolicy, 
  PolicyVersion, 
  PolicyVerificationResult, 
  RiskFlag, 
  HumanReviewCase, 
  HumanReviewAction, 
  AuditEvent, 
  NotificationItem, 
  ReviewActionType,
  ExecutionMode,
  GeneratedReport
} from '../types';
import { 
  INITIAL_APPLICATIONS, 
  INITIAL_AI_DECISIONS, 
  INITIAL_POLICIES, 
  INITIAL_POLICY_VERSIONS, 
  INITIAL_POLICY_RESULTS, 
  INITIAL_RISK_FLAGS, 
  INITIAL_HUMAN_REVIEW_CASES, 
  INITIAL_REVIEW_ACTIONS, 
  INITIAL_AUDIT_EVENTS, 
  INITIAL_NOTIFICATIONS 
} from '../data/seedData';
import { STORAGE_KEYS, supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  parseApplicantProfiles, 
  evaluateApplicantWithGemini, 
  validateApplicantRecord, 
  ValidationIssue,
  generateAIAuditSummary,
  generateDashboardAIInsights
} from '../services/geminiService';
import { 
  verifyApplicantAgainstPolicies, 
  detectRiskFlags, 
  createReviewCaseFromRiskFlags 
} from '../services/riskEngineService';
import { createAuditEvent } from '../services/auditService';
import { generateAuditPDFReport } from '../services/pdfReportService';
import { useAuth } from './AuthContext';

interface AppContextType {
  applications: LoanApplication[];
  aiDecisions: AIDecision[];
  policies: LoanPolicy[];
  policyVersions: PolicyVersion[];
  policyResults: PolicyVerificationResult[];
  riskFlags: RiskFlag[];
  reviewCases: HumanReviewCase[];
  reviewActions: HumanReviewAction[];
  auditEvents: AuditEvent[];
  notifications: NotificationItem[];
  reports: GeneratedReport[];
  executionMode: ExecutionMode;
  setExecutionMode: (mode: ExecutionMode) => void;
  simulationProbability: number;
  setSimulationProbability: (prob: number) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  dashboardAIInsights: string[];
  isGeneratingInsights: boolean;
  refreshDashboardInsights: () => Promise<void>;
  analyzeBatch: (
    rawText: string, 
    modelName?: string, 
    overrideMode?: ExecutionMode
  ) => Promise<{ processedCount: number; errors?: string[]; validationIssues?: ValidationIssue[] }>;
  submitReviewAction: (data: {
    caseId: string;
    actionType: ReviewActionType;
    humanFinding: string;
    mandatoryRationale: string;
    evidenceReferences?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  generateReport: (applicantId: string) => Promise<{ success: boolean; reportId?: string; error?: string }>;
  updatePolicyThreshold: (policyId: string, newValue: string | number, rationale: string) => Promise<{ success: boolean; error?: string }>;
  addLoanPolicy: (newPolicy: Omit<LoanPolicy, 'id' | 'current_version_id' | 'version_number' | 'updated_by_id' | 'updated_at'>) => Promise<{ success: boolean }>;
  togglePolicyActive: (policyId: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToInitialDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const EXEC_MODE_KEY = 'trusttrack_execution_mode_v1';
const SIM_PROB_KEY = 'trusttrack_sim_prob_v1';
const REPORTS_KEY = 'trusttrack_reports_v1';

function loadStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading storage key ${key}:`, e);
    return defaultValue;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [applications, setApplications] = useState<LoanApplication[]>(() => 
    loadStorage(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS)
  );
  const [aiDecisions, setAiDecisions] = useState<AIDecision[]>(() => 
    loadStorage(STORAGE_KEYS.AI_DECISIONS, INITIAL_AI_DECISIONS)
  );
  const [policies, setPolicies] = useState<LoanPolicy[]>(() => 
    loadStorage(STORAGE_KEYS.POLICIES, INITIAL_POLICIES)
  );
  const [policyVersions, setPolicyVersions] = useState<PolicyVersion[]>(() => 
    loadStorage(STORAGE_KEYS.POLICY_VERSIONS, INITIAL_POLICY_VERSIONS)
  );
  const [policyResults, setPolicyResults] = useState<PolicyVerificationResult[]>(() => 
    loadStorage(STORAGE_KEYS.POLICY_RESULTS, INITIAL_POLICY_RESULTS)
  );
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>(() => 
    loadStorage(STORAGE_KEYS.RISK_FLAGS, INITIAL_RISK_FLAGS)
  );
  const [reviewCases, setReviewCases] = useState<HumanReviewCase[]>(() => 
    loadStorage(STORAGE_KEYS.HUMAN_REVIEWS, INITIAL_HUMAN_REVIEW_CASES)
  );
  const [reviewActions, setReviewActions] = useState<HumanReviewAction[]>(() => 
    loadStorage(STORAGE_KEYS.REVIEW_ACTIONS, INITIAL_REVIEW_ACTIONS)
  );
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => 
    loadStorage(STORAGE_KEYS.AUDIT_EVENTS, INITIAL_AUDIT_EVENTS)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => 
    loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );
  const [reports, setReports] = useState<GeneratedReport[]>(() => 
    loadStorage(REPORTS_KEY, [])
  );

  const [executionMode, setExecutionModeState] = useState<ExecutionMode>(() => 
    (loadStorage(EXEC_MODE_KEY, 'simulation') as ExecutionMode)
  );
  const [simulationProbability, setSimulationProbabilityState] = useState<number>(() => 
    loadStorage(SIM_PROB_KEY, 0.20)
  );

  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(() => 
    loadStorage(STORAGE_KEYS.GEMINI_API_KEY, import.meta.env.VITE_GEMINI_API_KEY || '')
  );

  const [dashboardAIInsights, setDashboardAIInsights] = useState<string[]>([
    'TrustTrack governance active: All AI loan recommendations independently validated against active risk policies.',
    'Controlled Demo Simulation Mode enabled: Simulates realistic AI errors (e.g. wrong rejections, unverified approvals) to demonstrate accountability.',
    'Underwriting desk operational: Human credit reviewers retain mandatory authorization authority over all loan sanctions.'
  ]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AI_DECISIONS, JSON.stringify(aiDecisions));
  }, [aiDecisions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POLICY_VERSIONS, JSON.stringify(policyVersions));
  }, [policyVersions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POLICY_RESULTS, JSON.stringify(policyResults));
  }, [policyResults]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RISK_FLAGS, JSON.stringify(riskFlags));
  }, [riskFlags]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HUMAN_REVIEWS, JSON.stringify(reviewCases));
  }, [reviewCases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEW_ACTIONS, JSON.stringify(reviewActions));
  }, [reviewActions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_EVENTS, JSON.stringify(auditEvents));
  }, [auditEvents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }, [reports]);

  const setExecutionMode = (mode: ExecutionMode) => {
    setExecutionModeState(mode);
    localStorage.setItem(EXEC_MODE_KEY, JSON.stringify(mode));
  };

  const setSimulationProbability = (prob: number) => {
    setSimulationProbabilityState(prob);
    localStorage.setItem(SIM_PROB_KEY, JSON.stringify(prob));
  };

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key);
  };

  /**
   * Refresh Gemini Dashboard Insights using real aggregated metrics
   */
  const refreshDashboardInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const stats = {
        totalApps: applications.length,
        aiRecommended: aiDecisions.filter(d => d.recommendation === 'Recommended').length,
        aiNotRecommended: aiDecisions.filter(d => d.recommendation === 'Not Recommended').length,
        aiNeedsInfo: aiDecisions.filter(d => d.recommendation === 'Needs More Information').length,
        flaggedApps: applications.filter(a => a.application_status === 'flagged' || a.application_status === 'under_review').length,
        mismatches: riskFlags.filter(f => f.risk_type.includes('MISMATCH')).length,
        pendingReviews: reviewCases.filter(c => c.status === 'Pending Review' || c.status === 'Under Investigation').length,
        overriddenCount: reviewActions.filter(a => a.action_type === 'OVERRIDE_AI').length
      };

      const insights = await generateDashboardAIInsights(stats);
      setDashboardAIInsights(insights);
    } catch (e) {
      console.warn('Failed to refresh AI insights:', e);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  /**
   * Main Feature Workflow: AI Workspace Batch Analysis
   */
  const analyzeBatch = async (
    rawText: string, 
    modelName = 'gemini-3.5-flash',
    overrideMode?: ExecutionMode
  ): Promise<{ processedCount: number; errors?: string[]; validationIssues?: ValidationIssue[] }> => {
    const activeMode = overrideMode || executionMode;
    const parsedApplicants = parseApplicantProfiles(rawText);
    
    if (parsedApplicants.length === 0) {
      return { 
        processedCount: 0, 
        errors: ['No valid loan applicant profiles could be parsed from the input. Please follow the format.'] 
      };
    }

    // Pre-flight Data Validation
    const allValidationIssues: ValidationIssue[] = [];
    for (const applicant of parsedApplicants) {
      const issues = validateApplicantRecord(applicant);
      allValidationIssues.push(...issues);
    }

    // Stop if fatal errors found
    const fatalErrors = allValidationIssues.filter(i => i.severity === 'error');
    if (fatalErrors.length > 0) {
      return {
        processedCount: 0,
        errors: fatalErrors.map(e => `[${e.applicant_id}] ${e.message}`),
        validationIssues: allValidationIssues
      };
    }

    const currentActor = user ? { id: user.id, name: user.full_name, role: user.role } : { id: 'sys_workspace', name: 'AI Workspace Engine', role: 'system' as const };
    const newApps: LoanApplication[] = [];
    const newDecisions: AIDecision[] = [];
    const newPolicyResults: PolicyVerificationResult[] = [];
    const newRiskFlags: RiskFlag[] = [];
    const newReviewCases: HumanReviewCase[] = [];
    let accumulatedAuditEvents = [...auditEvents];
    const newNotifications: NotificationItem[] = [];

    for (const raw of parsedApplicants) {
      // Check if application already exists
      const existingApp = applications.find(a => a.applicant_id.toLowerCase() === raw.applicant_id.toLowerCase());
      const appId = existingApp ? existingApp.id : `app_${raw.applicant_id.toLowerCase()}_${Date.now()}`;
      
      const appRecord: LoanApplication = {
        id: appId,
        applicant_id: raw.applicant_id,
        full_name: raw.full_name,
        email: existingApp?.email || `${raw.full_name.toLowerCase().replace(/\s+/g, '.')}@demo-bank.in`,
        phone: existingApp?.phone || '+91 98450 ' + Math.floor(10000 + Math.random() * 90000),
        loan_amount: raw.loan_amount,
        loan_purpose: raw.loan_purpose || 'Retail Personal Loan',
        loan_tenure_months: raw.loan_tenure_months || 36,
        monthly_income: raw.monthly_income,
        monthly_debt: raw.monthly_debt,
        credit_score: raw.credit_score,
        employment_type: raw.employment_type,
        employer_name: raw.employer_name,
        income_proof_status: raw.income_proof_status,
        identity_proof_status: 'Available',
        dti_ratio: raw.monthly_income > 0 ? parseFloat(((raw.monthly_debt / raw.monthly_income) * 100).toFixed(2)) : 0,
        application_status: 'ai_evaluated',
        created_at: existingApp?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 1. Audit event: Submission
      const appEvents = accumulatedAuditEvents.filter(e => e.application_id === appId);
      const evSubmission = await createAuditEvent(
        appId,
        'APPLICATION_SUBMITTED',
        `Applicant profile ${appRecord.full_name} (${appRecord.applicant_id}) received for evaluation. Amount: ₹${appRecord.loan_amount.toLocaleString()}. Mode: ${activeMode.toUpperCase()}.`,
        currentActor,
        appEvents,
        { applicant_id: appRecord.applicant_id, loan_amount: appRecord.loan_amount, mode: activeMode }
      );
      accumulatedAuditEvents.push(evSubmission);

      // 2. Gemini AI Evaluation (Live or Demo Simulation with Controlled Mistakes)
      const decision = await evaluateApplicantWithGemini(
        appRecord, 
        modelName, 
        activeMode, 
        simulationProbability
      );
      newDecisions.push(decision);

      // Audit event: AI decision generated
      const evAi = await createAuditEvent(
        appId,
        'AI_RECOMMENDATION_GENERATED',
        `Gemini AI generated recommendation: "${decision.recommendation}" (Confidence: ${decision.confidence_score}%). ${decision.is_simulation ? `[DEMO SIMULATION: ${decision.simulation_scenario}]` : '[LIVE INFERENCE]'}. Original AI decision stored immutably.`,
        { id: decision.model_name, name: decision.model_name, role: 'system' },
        [...accumulatedAuditEvents.filter(e => e.application_id === appId)],
        { 
          recommendation: decision.recommendation, 
          model: decision.model_version,
          is_simulation: decision.is_simulation,
          scenario: decision.simulation_scenario
        }
      );
      accumulatedAuditEvents.push(evAi);

      // 3. Risk Engine: Policy Verification
      const pResults = verifyApplicantAgainstPolicies(appRecord, policies);
      newPolicyResults.push(...pResults);

      const evPolicy = await createAuditEvent(
        appId,
        'POLICY_VERIFICATION_PERFORMED',
        `Risk Engine evaluated applicant against ${pResults.length} active loan policies. (Passed: ${pResults.filter(p => p.status === 'PASSED').length}, Failed: ${pResults.filter(p => p.status === 'FAILED').length}, Insufficient: ${pResults.filter(p => p.status === 'INSUFFICIENT DATA').length}).`,
        { id: 'risk_engine', name: 'TrustTrack Risk Engine', role: 'system' },
        [...accumulatedAuditEvents.filter(e => e.application_id === appId)]
      );
      accumulatedAuditEvents.push(evPolicy);

      // 4. Risk Engine: Discrepancy & Mismatch Detection
      const detectedFlags = detectRiskFlags(appRecord, decision, pResults);
      if (detectedFlags.length > 0) {
        newRiskFlags.push(...detectedFlags);
        appRecord.application_status = 'flagged';

        const evRisk = await createAuditEvent(
          appId,
          'RISK_ALERT_GENERATED',
          `Risk alert triggered: ${detectedFlags.map(f => f.title).join('; ')}`,
          { id: 'risk_engine', name: 'TrustTrack Risk Engine', role: 'system' },
          [...accumulatedAuditEvents.filter(e => e.application_id === appId)],
          { flags: detectedFlags.map(f => f.risk_type) }
        );
        accumulatedAuditEvents.push(evRisk);

        // 5. Send to Human Review Queue
        const reviewCase = createReviewCaseFromRiskFlags(appRecord, decision, detectedFlags);
        if (reviewCase) {
          newReviewCases.push(reviewCase);

          const evCase = await createAuditEvent(
            appId,
            'HUMAN_REVIEW_ASSIGNED',
            `Case sent to Human Review queue due to: ${reviewCase.risk_type}. Status: Pending Review.`,
            { id: 'review_dispatcher', name: 'Human Review Dispatcher', role: 'system' },
            [...accumulatedAuditEvents.filter(e => e.application_id === appId)]
          );
          accumulatedAuditEvents.push(evCase);

          newNotifications.push({
            id: `notif_${Date.now()}_${appRecord.applicant_id}`,
            title: `Flagged Case: ${appRecord.applicant_id} (${appRecord.full_name})`,
            message: `${reviewCase.risk_type.replace(/_/g, ' ')} detected. Assigned for human investigation.`,
            type: reviewCase.risk_type.includes('MISMATCH') ? 'mismatch' : 'risk',
            is_read: false,
            link: '/human-review',
            created_at: new Date().toISOString()
          });
        }
      } else {
        appRecord.application_status = 'resolved';
      }

      newApps.push(appRecord);
    }

    // Update global local states
    setApplications(prev => {
      const remaining = prev.filter(p => !newApps.some(n => n.id === p.id));
      return [...newApps, ...remaining];
    });
    setAiDecisions(prev => [...newDecisions, ...prev]);
    setPolicyResults(prev => [...newPolicyResults, ...prev]);
    setRiskFlags(prev => [...newRiskFlags, ...prev]);
    setReviewCases(prev => [...newReviewCases, ...prev]);
    setAuditEvents(accumulatedAuditEvents);
    setNotifications(prev => [...newNotifications, ...prev]);

    // Asynchronously synchronize with Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        // Sync applications
        const appsPayload = newApps.map(a => ({
          id: a.id,
          applicant_id: a.applicant_id,
          full_name: a.full_name,
          email: a.email,
          phone: a.phone,
          loan_amount: a.loan_amount,
          loan_purpose: a.loan_purpose,
          loan_tenure_months: a.loan_tenure_months,
          monthly_income: a.monthly_income,
          monthly_debt: a.monthly_debt,
          credit_score: a.credit_score,
          employment_type: a.employment_type,
          employer_name: a.employer_name,
          income_proof_status: a.income_proof_status,
          identity_proof_status: a.identity_proof_status,
          application_status: a.application_status,
          created_at: a.created_at,
          updated_at: a.updated_at
        }));
        await supabase.from('loan_applications').upsert(appsPayload);

        // Sync AI decisions
        const decisionsPayload = newDecisions.map(d => ({
          id: d.id,
          application_id: d.application_id,
          applicant_id: d.applicant_id,
          model_name: d.model_name,
          model_version: d.model_version,
          recommendation: d.recommendation,
          confidence_score: d.confidence_score,
          explanation: d.explanation,
          financial_factors: d.financial_factors,
          positive_factors: d.positive_factors,
          risk_factors: d.risk_factors,
          missing_information: d.missing_information,
          additional_verification_requirements: d.additional_verification_requirements,
          is_demo_fallback: d.is_demo_fallback,
          created_at: d.created_at
        }));
        await supabase.from('ai_decisions').upsert(decisionsPayload);

        // Sync policy verification results
        if (newPolicyResults.length > 0) {
          const pResultsPayload = newPolicyResults.map(p => ({
            id: p.id,
            application_id: p.application_id,
            policy_id: p.policy_id,
            policy_key: p.policy_key,
            policy_name: p.policy_name,
            policy_version_used: p.policy_version_used,
            configured_threshold: String(p.configured_threshold),
            actual_applicant_value: String(p.actual_applicant_value),
            status: p.status,
            explanation: p.explanation,
            created_at: p.created_at
          }));
          await supabase.from('policy_verification_results').upsert(pResultsPayload);
        }

        // Sync risk flags
        if (newRiskFlags.length > 0) {
          const riskPayload = newRiskFlags.map(r => ({
            id: r.id,
            application_id: r.application_id,
            risk_type: r.risk_type,
            severity: r.severity,
            title: r.title,
            description: r.description,
            policy_mismatch_details: r.policy_mismatch_details,
            status: r.status,
            created_at: r.created_at
          }));
          await supabase.from('risk_flags').upsert(riskPayload);
        }

        // Sync review cases
        if (newReviewCases.length > 0) {
          const casesPayload = newReviewCases.map(c => ({
            id: c.id,
            application_id: c.application_id,
            applicant_id: c.applicant_id,
            applicant_name: c.applicant_name,
            ai_recommendation: c.ai_recommendation,
            risk_flag_id: c.risk_flag_id,
            risk_type: c.risk_type,
            risk_severity: c.risk_severity,
            status: c.status,
            flagged_at: c.flagged_at
          }));
          await supabase.from('human_review_cases').upsert(casesPayload);
        }

        // Sync audit events
        const newEvents = accumulatedAuditEvents.slice(auditEvents.length);
        if (newEvents.length > 0) {
          const auditPayload = newEvents.map(e => ({
            id: e.id,
            application_id: e.application_id,
            event_type: e.event_type,
            description: e.description,
            actor_id: e.actor_id,
            actor_name: e.actor_name,
            actor_role: e.actor_role,
            previous_hash: e.previous_hash,
            current_hash: e.current_hash,
            metadata: e.metadata,
            timestamp: e.timestamp
          }));
          await supabase.from('audit_events').upsert(auditPayload);
        }
      } catch (err) {
        console.warn('Async Supabase sync completed with local preservation:', err);
      }
    }

    return { 
      processedCount: newApps.length,
      validationIssues: allValidationIssues
    };
  };

  /**
   * Human Review Action Submission (With Mandatory Rationale)
   */
  const submitReviewAction = async (data: {
    caseId: string;
    actionType: ReviewActionType;
    humanFinding: string;
    mandatoryRationale: string;
    evidenceReferences?: string[];
  }): Promise<{ success: boolean; error?: string }> => {
    if (!data.mandatoryRationale || data.mandatoryRationale.trim().length === 0) {
      return { success: false, error: 'Mandatory rationale is required. Reviewers must provide a documented reason.' };
    }

    const reviewCase = reviewCases.find(c => c.id === data.caseId);
    if (!reviewCase) {
      return { success: false, error: 'Review case not found.' };
    }

    const reviewerActor = user ? { id: user.id, name: user.full_name, role: user.role } : { id: 'usr_rev', name: 'Human Reviewer', role: 'reviewer' as const };

    let updatedStatus: HumanReviewCase['status'] = 'Resolved';
    switch (data.actionType) {
      case 'CONFIRM_AI': updatedStatus = 'Confirmed'; break;
      case 'OVERRIDE_AI': updatedStatus = 'Overridden'; break;
      case 'REQUEST_EVIDENCE': updatedStatus = 'Evidence Requested'; break;
      case 'PLACE_ON_HOLD': updatedStatus = 'On Hold'; break;
      case 'MARK_INCONCLUSIVE': updatedStatus = 'Inconclusive'; break;
    }

    const actionRecord: HumanReviewAction = {
      id: `act_${Date.now()}`,
      case_id: data.caseId,
      application_id: reviewCase.application_id,
      reviewer_id: reviewerActor.id,
      reviewer_name: reviewerActor.name,
      action_type: data.actionType,
      human_finding: data.humanFinding,
      mandatory_rationale: data.mandatoryRationale.trim(),
      evidence_references: data.evidenceReferences || [],
      original_ai_recommendation: reviewCase.ai_recommendation, // Immutably preserved
      created_at: new Date().toISOString()
    };

    // Update case
    setReviewCases(prev => prev.map(c => c.id === data.caseId ? {
      ...c,
      status: updatedStatus,
      assigned_reviewer_id: reviewerActor.id,
      assigned_reviewer_name: reviewerActor.name,
      resolved_at: (updatedStatus === 'Confirmed' || updatedStatus === 'Overridden') ? new Date().toISOString() : undefined
    } : c));

    // Append review action
    setReviewActions(prev => [actionRecord, ...prev]);

    // Update loan application status
    setApplications(prev => prev.map(a => a.id === reviewCase.application_id ? {
      ...a,
      application_status: (updatedStatus === 'Confirmed' || updatedStatus === 'Overridden') ? 'resolved' : 'under_review',
      updated_at: new Date().toISOString()
    } : a));

    // Audit event: Human review action
    const appEvents = auditEvents.filter(e => e.application_id === reviewCase.application_id);
    const evReview = await createAuditEvent(
      reviewCase.application_id,
      'HUMAN_REVIEW_ACTION_SUBMITTED',
      `Reviewer ${reviewerActor.name} recorded action "${data.actionType}". Finding: ${data.humanFinding}. Original AI: ${reviewCase.ai_recommendation}. Rationale: "${data.mandatoryRationale.trim()}".`,
      reviewerActor,
      appEvents,
      { action_type: data.actionType, new_status: updatedStatus }
    );
    setAuditEvents(prev => [...prev, evReview]);

    // Add notification
    setNotifications(prev => [{
      id: `notif_${Date.now()}`,
      title: `Review Submitted for ${reviewCase.applicant_id}`,
      message: `${reviewerActor.name} performed ${data.actionType.replace('_', ' ')}: "${data.humanFinding}"`,
      type: 'assignment',
      is_read: false,
      link: '/human-review',
      created_at: new Date().toISOString()
    }, ...prev]);

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('human_review_actions').insert({
          id: actionRecord.id,
          case_id: actionRecord.case_id,
          application_id: actionRecord.application_id,
          reviewer_id: user?.id,
          reviewer_name: actionRecord.reviewer_name,
          action_type: actionRecord.action_type,
          human_finding: actionRecord.human_finding,
          mandatory_rationale: actionRecord.mandatory_rationale,
          evidence_references: actionRecord.evidence_references,
          original_ai_recommendation: actionRecord.original_ai_recommendation,
          created_at: actionRecord.created_at
        });

        await supabase.from('human_review_cases').update({
          status: updatedStatus,
          assigned_reviewer_id: user?.id,
          assigned_reviewer_name: reviewerActor.name,
          resolved_at: actionRecord.created_at
        }).eq('id', data.caseId);
      } catch (err) {
        console.warn('Async Supabase review sync fallback:', err);
      }
    }

    return { success: true };
  };

  /**
   * Real PDF Audit Report Generation with Gemini AI Summary
   */
  const generateReport = async (applicantId: string): Promise<{ success: boolean; reportId?: string; error?: string }> => {
    const app = applications.find(a => a.applicant_id.toLowerCase() === applicantId.toLowerCase() || a.id === applicantId);
    if (!app) {
      return { success: false, error: `Applicant record "${applicantId}" not found.` };
    }

    const aiDec = aiDecisions.find(d => d.application_id === app.id || d.applicant_id === app.applicant_id);
    const pResults = policyResults.filter(p => p.application_id === app.id);
    const rFlags = riskFlags.filter(r => r.application_id === app.id);
    const rCase = reviewCases.find(c => c.application_id === app.id);
    const rActions = reviewActions.filter(a => a.application_id === app.id);
    const appAuditEvents = auditEvents.filter(e => e.application_id === app.id);
    const currentUser = user || {
      id: 'usr_admin_default',
      email: 'admin@trusttrack.bank',
      full_name: 'Vikramaditya Roy',
      role: 'admin' as const,
      department: 'Institutional Compliance Desk',
      created_at: new Date().toISOString()
    };

    // 1. Generate Gemini AI Summary
    let aiSummary = '';
    try {
      aiSummary = await generateAIAuditSummary(app, aiDec, pResults, rFlags, rActions);
    } catch (e) {
      console.warn('Gemini summary generation failed:', e);
    }

    // 2. Generate Real Downloadable PDF Report
    const { doc, reportId, fileName, integrityHash } = generateAuditPDFReport({
      application: app,
      aiDecision: aiDec,
      policyResults: pResults,
      riskFlags: rFlags,
      reviewCase: rCase,
      reviewActions: rActions,
      auditEvents: appAuditEvents,
      generatedBy: currentUser,
      aiAuditSummary: aiSummary
    });

    // 3. Trigger Download
    doc.save(fileName);

    // 4. Save metadata
    const reportRecord: GeneratedReport = {
      id: `rep_${Date.now()}`,
      application_id: app.id,
      report_number: reportId,
      generated_by_id: currentUser.id,
      generated_by_name: currentUser.full_name,
      file_size_bytes: 45000,
      integrity_hash: integrityHash,
      created_at: new Date().toISOString()
    };

    setReports(prev => [reportRecord, ...prev]);

    // 5. Audit event: Report Generated
    const evReport = await createAuditEvent(
      app.id,
      'AUDIT_REPORT_GENERATED',
      `Certified compliance PDF audit report #${reportId} generated by ${currentUser.full_name}. Cryptographic integrity hash: ${integrityHash}.`,
      { id: currentUser.id, name: currentUser.full_name, role: currentUser.role },
      appAuditEvents,
      { report_id: reportId, integrity_hash: integrityHash }
    );
    setAuditEvents(prev => [...prev, evReport]);

    // 6. Sync report metadata to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('generated_reports').insert({
          id: reportRecord.id,
          application_id: reportRecord.application_id,
          report_number: reportRecord.report_number,
          generated_by_id: user?.id,
          generated_by_name: reportRecord.generated_by_name,
          integrity_hash: reportRecord.integrity_hash,
          file_size_bytes: reportRecord.file_size_bytes,
          created_at: reportRecord.created_at
        });
      } catch (err) {
        console.warn('Async Supabase report sync fallback:', err);
      }
    }

    // Add Notification
    setNotifications(prev => [{
      id: `notif_rep_${Date.now()}`,
      title: `Audit Report Generated: ${reportId}`,
      message: `PDF generated and downloaded for ${app.applicant_id} (${app.full_name}).`,
      type: 'report',
      is_read: false,
      link: '/audit-reports',
      created_at: new Date().toISOString()
    }, ...prev]);

    return { success: true, reportId };
  };

  /**
   * Loan Policy Management with Immutable Versioning
   */
  const updatePolicyThreshold = async (
    policyId: string, 
    newValue: string | number, 
    rationale: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Only compliance administrators can modify loan policies.' };
    }
    if (!rationale || rationale.trim().length === 0) {
      return { success: false, error: 'Mandatory rationale required for updating loan policy threshold.' };
    }

    const targetPolicy = policies.find(p => p.id === policyId);
    if (!targetPolicy) return { success: false, error: 'Policy not found.' };

    const newVersionNum = (targetPolicy.version_number || 1) + 1;
    const versionId = `ver_${policyId}_v${newVersionNum}_${Date.now()}`;

    const newVersion: PolicyVersion = {
      id: versionId,
      policy_id: policyId,
      policy_name: targetPolicy.policy_name,
      previous_value: targetPolicy.threshold_value,
      new_value: newValue,
      change_rationale: rationale.trim(),
      updated_by_id: user.id,
      updated_by_name: user.full_name,
      version_number: newVersionNum,
      created_at: new Date().toISOString()
    };

    setPolicyVersions(prev => [newVersion, ...prev]);

    setPolicies(prev => prev.map(p => p.id === policyId ? {
      ...p,
      threshold_value: newValue,
      current_version_id: versionId,
      version_number: newVersionNum,
      updated_by_id: user.id,
      updated_at: new Date().toISOString()
    } : p));

    setNotifications(prev => [{
      id: `notif_pol_${Date.now()}`,
      title: `Loan Policy Updated: ${targetPolicy.policy_name}`,
      message: `Threshold changed from ${targetPolicy.threshold_value} to ${newValue} (v${newVersionNum}) by ${user.full_name}.`,
      type: 'system',
      is_read: false,
      link: '/loan-policies',
      created_at: new Date().toISOString()
    }, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('loan_policies').update({
          threshold_value: String(newValue),
          current_version_id: versionId,
          version_number: newVersionNum,
          updated_at: new Date().toISOString()
        }).eq('id', policyId);

        await supabase.from('policy_versions').insert({
          id: newVersion.id,
          policy_id: newVersion.policy_id,
          policy_name: newVersion.policy_name,
          previous_value: String(newVersion.previous_value),
          new_value: String(newVersion.new_value),
          change_rationale: newVersion.change_rationale,
          updated_by_id: user?.id,
          updated_by_name: newVersion.updated_by_name,
          version_number: newVersion.version_number,
          created_at: newVersion.created_at
        });
      } catch (err) {
        console.warn('Async Supabase policy sync fallback:', err);
      }
    }

    return { success: true };
  };

  const addLoanPolicy = async (newPolicyData: Omit<LoanPolicy, 'id' | 'current_version_id' | 'version_number' | 'updated_by_id' | 'updated_at'>) => {
    const id = `pol_${Date.now()}`;
    const verId = `ver_${id}_v1`;
    const newPolicy: LoanPolicy = {
      ...newPolicyData,
      id,
      current_version_id: verId,
      version_number: 1,
      updated_by_id: user?.id || 'usr_admin_01',
      updated_at: new Date().toISOString()
    };
    const newVersion: PolicyVersion = {
      id: verId,
      policy_id: id,
      policy_name: newPolicy.policy_name,
      previous_value: 'N/A (Initial Creation)',
      new_value: newPolicy.threshold_value,
      change_rationale: 'Initial policy enactment.',
      updated_by_id: user?.id || 'usr_admin_01',
      updated_by_name: user?.full_name || 'Compliance Administrator',
      version_number: 1,
      created_at: new Date().toISOString()
    };

    setPolicies(prev => [...prev, newPolicy]);
    setPolicyVersions(prev => [newVersion, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('loan_policies').insert({
          id: newPolicy.id,
          policy_key: newPolicy.policy_key,
          policy_name: newPolicy.policy_name,
          description: newPolicy.description,
          policy_category: newPolicy.policy_category,
          operator: newPolicy.operator,
          threshold_value: String(newPolicy.threshold_value),
          threshold_unit: newPolicy.threshold_unit,
          is_active: newPolicy.is_active,
          current_version_id: newPolicy.current_version_id,
          version_number: newPolicy.version_number,
          updated_at: newPolicy.updated_at
        });

        await supabase.from('policy_versions').insert({
          id: newVersion.id,
          policy_id: newVersion.policy_id,
          policy_name: newVersion.policy_name,
          previous_value: String(newVersion.previous_value),
          new_value: String(newVersion.new_value),
          change_rationale: newVersion.change_rationale,
          updated_by_name: newVersion.updated_by_name,
          version_number: newVersion.version_number,
          created_at: newVersion.created_at
        });
      } catch (err) {
        console.warn('Async Supabase add policy fallback:', err);
      }
    }

    return { success: true };
  };

  const togglePolicyActive = (policyId: string) => {
    setPolicies(prev => prev.map(p => p.id === policyId ? { ...p, is_active: !p.is_active, updated_at: new Date().toISOString() } : p));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const resetToInitialDemo = () => {
    setApplications(INITIAL_APPLICATIONS);
    setAiDecisions(INITIAL_AI_DECISIONS);
    setPolicies(INITIAL_POLICIES);
    setPolicyVersions(INITIAL_POLICY_VERSIONS);
    setPolicyResults(INITIAL_POLICY_RESULTS);
    setRiskFlags(INITIAL_RISK_FLAGS);
    setReviewCases(INITIAL_HUMAN_REVIEW_CASES);
    setReviewActions(INITIAL_REVIEW_ACTIONS);
    setAuditEvents(INITIAL_AUDIT_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setReports([]);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        applications,
        aiDecisions,
        policies,
        policyVersions,
        policyResults,
        riskFlags,
        reviewCases,
        reviewActions,
        auditEvents,
        notifications,
        reports,
        executionMode,
        setExecutionMode,
        simulationProbability,
        setSimulationProbability,
        geminiApiKey,
        setGeminiApiKey,
        dashboardAIInsights,
        isGeneratingInsights,
        refreshDashboardInsights,
        analyzeBatch,
        submitReviewAction,
        generateReport,
        updatePolicyThreshold,
        addLoanPolicy,
        togglePolicyActive,
        markNotificationAsRead,
        clearAllNotifications,
        resetToInitialDemo
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
