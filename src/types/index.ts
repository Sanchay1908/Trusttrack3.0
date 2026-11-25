export type UserRole = 'admin' | 'reviewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  department: string;
  created_at: string;
}

export type ApplicationStatus = 
  | 'submitted' 
  | 'ai_evaluated' 
  | 'policy_verified' 
  | 'flagged' 
  | 'under_review' 
  | 'resolved';

export interface LoanApplication {
  id: string;
  applicant_id: string; // e.g. LN001
  full_name: string;
  email: string;
  phone: string;
  loan_amount: number;
  loan_purpose: string;
  loan_tenure_months: number;
  monthly_income: number;
  monthly_debt: number;
  credit_score: number;
  employment_type: 'Salaried' | 'Self-employed' | 'Business' | 'Other';
  employer_name?: string;
  income_proof_status: 'Available' | 'Missing' | 'Pending Verification';
  identity_proof_status: 'Available' | 'Missing';
  dti_ratio: number; // calculated: (monthly_debt / monthly_income) * 100
  application_status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export type AIRecommendationType = 
  | 'Recommended' 
  | 'Not Recommended' 
  | 'Needs More Information' 
  | 'Inconclusive';

export interface FinancialFactor {
  name: string;
  value: string | number;
  impact: 'positive' | 'negative' | 'neutral';
}

export type ExecutionMode = 'live' | 'simulation';

export interface AIDecision {
  id: string;
  application_id: string;
  applicant_id: string;
  model_name: string;
  model_version: string;
  recommendation: AIRecommendationType;
  confidence_score: number; // 0-100
  explanation: string;
  risk_category?: string; // Low Risk | Moderate Risk | High Risk | Critical Risk
  financial_factors: FinancialFactor[];
  positive_factors: string[];
  risk_factors: string[];
  missing_information: string[];
  additional_verification_requirements: string[];
  recommended_next_steps?: string[];
  is_demo_fallback: boolean;
  is_simulation?: boolean;
  simulation_scenario?: string;
  simulation_reason?: string;
  raw_gemini_recommendation?: string;
  created_at: string;
}

export interface LoanPolicy {
  id: string;
  policy_key: string;
  policy_name: string;
  description: string;
  policy_category: 'income' | 'credit' | 'dti' | 'documentation' | 'employment';
  operator: '>' | '>=' | '<' | '<=' | '==' | 'contains';
  threshold_value: string | number;
  threshold_unit?: string;
  is_active: boolean;
  current_version_id: string;
  version_number: number;
  updated_by_id: string;
  updated_at: string;
}

export interface PolicyVersion {
  id: string;
  policy_id: string;
  policy_name: string;
  previous_value: string | number;
  new_value: string | number;
  change_rationale: string;
  updated_by_id: string;
  updated_by_name: string;
  version_number: number;
  created_at: string;
}

export type PolicyVerificationStatus = 'PASSED' | 'FAILED' | 'INSUFFICIENT DATA';

export interface PolicyVerificationResult {
  id: string;
  application_id: string;
  policy_id: string;
  policy_key: string;
  policy_name: string;
  policy_version_used: number;
  configured_threshold: string | number;
  actual_applicant_value: string | number;
  status: PolicyVerificationStatus;
  explanation: string;
  created_at: string;
}

export type RiskSeverity = 'High' | 'Medium' | 'Low';
export type RiskType = 
  | 'POTENTIAL_AI_POLICY_MISMATCH' 
  | 'POLICY_FAILURE' 
  | 'INSUFFICIENT_DATA' 
  | 'AI_RECOMMENDS_POLICY_FAILS' 
  | 'HIGH_DTI_ANOMALY'
  | 'MISSING_DATA_CONFIDENCE_MISMATCH'
  | 'AI_EXPLANATION_CONTRADICTION'
  | 'FINANCIAL_CALCULATION_DISCREPANCY';

export interface RiskFlag {
  id: string;
  application_id: string;
  risk_type: RiskType;
  severity: RiskSeverity;
  title: string;
  description: string;
  policy_mismatch_details?: string;
  status: 'PENDING_INVESTIGATION' | 'UNDER_REVIEW' | 'RESOLVED';
  created_at: string;
}

export type HumanReviewStatus = 
  | 'Pending Review' 
  | 'Under Investigation' 
  | 'Evidence Requested' 
  | 'On Hold' 
  | 'Confirmed' 
  | 'Overridden' 
  | 'Inconclusive' 
  | 'Resolved';

export interface HumanReviewCase {
  id: string;
  application_id: string;
  applicant_id: string;
  applicant_name: string;
  ai_recommendation: AIRecommendationType;
  risk_flag_id?: string;
  risk_type: string;
  risk_severity: RiskSeverity;
  status: HumanReviewStatus;
  assigned_reviewer_id?: string;
  assigned_reviewer_name?: string;
  flagged_at: string;
  resolved_at?: string;
}

export type ReviewActionType = 
  | 'CONFIRM_AI' 
  | 'OVERRIDE_AI' 
  | 'REQUEST_EVIDENCE' 
  | 'PLACE_ON_HOLD' 
  | 'MARK_INCONCLUSIVE';

export interface HumanReviewAction {
  id: string;
  case_id: string;
  application_id: string;
  reviewer_id: string;
  reviewer_name: string;
  action_type: ReviewActionType;
  human_finding: string;
  mandatory_rationale: string;
  evidence_references?: string[];
  original_ai_recommendation: AIRecommendationType;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  application_id: string;
  event_type: string;
  description: string;
  actor_id: string;
  actor_name: string;
  actor_role: 'system' | 'admin' | 'reviewer';
  previous_hash: string;
  current_hash: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface GeneratedReport {
  id: string;
  application_id: string;
  report_number: string;
  generated_by_id: string;
  generated_by_name: string;
  storage_path?: string;
  file_size_bytes?: number;
  integrity_hash: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'mismatch' | 'risk' | 'assignment' | 'evidence' | 'report' | 'system';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface VoiceInteractionLog {
  id: string;
  user_id: string;
  transcript_in: string;
  response_text: string;
  intent_identified: string;
  action_taken?: string;
  created_at: string;
}
