-- ====================================================================
-- TRUSTTRACK: AI LOAN DECISION MONITORING & ACCOUNTABILITY PLATFORM
-- Complete Supabase PostgreSQL Schema with RLS and Audit Integrity
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'reviewer')),
    department TEXT NOT NULL DEFAULT 'Risk & Compliance',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LOAN POLICIES & POLICY VERSIONS
CREATE TABLE IF NOT EXISTS public.loan_policies (
    id TEXT PRIMARY KEY,
    policy_key TEXT NOT NULL UNIQUE,
    policy_name TEXT NOT NULL,
    description TEXT,
    policy_category TEXT NOT NULL CHECK (policy_category IN ('income', 'credit', 'dti', 'documentation', 'employment')),
    operator TEXT NOT NULL CHECK (operator IN ('>', '>=', '<', '<=', '==', 'contains')),
    threshold_value TEXT NOT NULL,
    threshold_unit TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    current_version_id TEXT,
    version_number INT DEFAULT 1,
    updated_by_id UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.policy_versions (
    id TEXT PRIMARY KEY,
    policy_id TEXT NOT NULL REFERENCES public.loan_policies(id) ON DELETE CASCADE,
    policy_name TEXT NOT NULL,
    previous_value TEXT,
    new_value TEXT NOT NULL,
    change_rationale TEXT NOT NULL,
    updated_by_id UUID REFERENCES public.profiles(id),
    updated_by_name TEXT NOT NULL,
    version_number INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LOAN APPLICATIONS
CREATE TABLE IF NOT EXISTS public.loan_applications (
    id TEXT PRIMARY KEY,
    applicant_id TEXT NOT NULL UNIQUE, -- e.g. LN001
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    loan_amount NUMERIC(15,2) NOT NULL,
    loan_purpose TEXT,
    loan_tenure_months INT NOT NULL,
    monthly_income NUMERIC(15,2) NOT NULL,
    monthly_debt NUMERIC(15,2) NOT NULL,
    credit_score INT NOT NULL,
    employment_type TEXT NOT NULL,
    employer_name TEXT,
    income_proof_status TEXT NOT NULL CHECK (income_proof_status IN ('Available', 'Missing', 'Pending Verification')),
    identity_proof_status TEXT NOT NULL DEFAULT 'Available',
    dti_ratio NUMERIC(6,2) GENERATED ALWAYS AS (
        CASE WHEN monthly_income > 0 THEN ROUND((monthly_debt / monthly_income) * 100, 2) ELSE 0 END
    ) STORED,
    application_status TEXT NOT NULL DEFAULT 'submitted' CHECK (
        application_status IN ('submitted', 'ai_evaluated', 'policy_verified', 'flagged', 'under_review', 'resolved')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORIGINAL AI DECISIONS (IMMUTABLE RECORD)
CREATE TABLE IF NOT EXISTS public.ai_decisions (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
    applicant_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    recommendation TEXT NOT NULL CHECK (
        recommendation IN ('Recommended', 'Not Recommended', 'Needs More Information', 'Inconclusive')
    ),
    confidence_score NUMERIC(5,2),
    explanation TEXT NOT NULL,
    financial_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    positive_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_information JSONB NOT NULL DEFAULT '[]'::jsonb,
    additional_verification_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_demo_fallback BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RISK ENGINE: POLICY VERIFICATION RESULTS
CREATE TABLE IF NOT EXISTS public.policy_verification_results (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
    policy_id TEXT NOT NULL REFERENCES public.loan_policies(id),
    policy_key TEXT NOT NULL,
    policy_name TEXT NOT NULL,
    policy_version_used INT NOT NULL,
    configured_threshold TEXT NOT NULL,
    actual_applicant_value TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PASSED', 'FAILED', 'INSUFFICIENT DATA')),
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RISK FLAGS
CREATE TABLE IF NOT EXISTS public.risk_flags (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
    risk_type TEXT NOT NULL CHECK (
        risk_type IN ('POTENTIAL_AI_POLICY_MISMATCH', 'POLICY_FAILURE', 'INSUFFICIENT_DATA', 'AI_RECOMMENDS_POLICY_FAILS', 'HIGH_DTI_ANOMALY')
    ),
    severity TEXT NOT NULL CHECK (severity IN ('High', 'Medium', 'Low')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    policy_mismatch_details TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING_INVESTIGATION' CHECK (
        status IN ('PENDING_INVESTIGATION', 'UNDER_REVIEW', 'RESOLVED')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HUMAN REVIEW CASES & ACTIONS
CREATE TABLE IF NOT EXISTS public.human_review_cases (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
    applicant_id TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    ai_recommendation TEXT NOT NULL,
    risk_flag_id TEXT REFERENCES public.risk_flags(id),
    risk_type TEXT NOT NULL,
    risk_severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (
        status IN ('Pending Review', 'Under Investigation', 'Evidence Requested', 'On Hold', 'Confirmed', 'Overridden', 'Inconclusive', 'Resolved')
    ),
    assigned_reviewer_id UUID REFERENCES public.profiles(id),
    assigned_reviewer_name TEXT,
    flagged_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.human_review_actions (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL REFERENCES public.human_review_cases(id) ON DELETE CASCADE,
    application_id TEXT NOT NULL REFERENCES public.loan_applications(id),
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
    reviewer_name TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (
        action_type IN ('CONFIRM_AI', 'OVERRIDE_AI', 'REQUEST_EVIDENCE', 'PLACE_ON_HOLD', 'MARK_INCONCLUSIVE')
    ),
    human_finding TEXT NOT NULL,
    mandatory_rationale TEXT NOT NULL CHECK (LENGTH(TRIM(mandatory_rationale)) > 0),
    evidence_references JSONB DEFAULT '[]'::jsonb,
    original_ai_recommendation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. APPEND-ONLY AUDIT EVENTS WITH SHA-256 HASH CHAIN
CREATE TABLE IF NOT EXISTS public.audit_events (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    previous_hash TEXT NOT NULL,
    current_hash TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent update or delete on audit_events (Append-only guarantee)
CREATE OR REPLACE RULE audit_events_immutable_update AS ON UPDATE TO public.audit_events DO INSTEAD NOTHING;
CREATE OR REPLACE RULE audit_events_immutable_delete AS ON DELETE TO public.audit_events DO INSTEAD NOTHING;

-- 9. GENERATED PDF AUDIT REPORTS
CREATE TABLE IF NOT EXISTS public.generated_reports (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
    report_number TEXT NOT NULL UNIQUE,
    generated_by_id UUID REFERENCES public.profiles(id),
    generated_by_name TEXT NOT NULL,
    storage_path TEXT,
    file_size_bytes BIGINT,
    integrity_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. VOICE ASSISTANT INTERACTIONS
CREATE TABLE IF NOT EXISTS public.voice_interactions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    transcript_in TEXT NOT NULL,
    response_text TEXT NOT NULL,
    intent_identified TEXT,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_loan_apps_applicant_id ON public.loan_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_loan_apps_status ON public.loan_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_app_id ON public.ai_decisions(application_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_app_id ON public.risk_flags(application_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_type ON public.risk_flags(risk_type);
CREATE INDEX IF NOT EXISTS idx_human_review_cases_status ON public.human_review_cases(status);
CREATE INDEX IF NOT EXISTS idx_audit_events_app_id ON public.audit_events(application_id);

-- 12. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.human_review_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.human_review_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
-- Profiles: Any authenticated user can read profiles; users can update their own
CREATE POLICY "Profiles readable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Loan Applications: Admins can do all; reviewers can read and update status
CREATE POLICY "Applications readable by authorized staff" ON public.loan_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage applications" ON public.loan_applications FOR ALL TO authenticated USING (public.is_admin());

-- AI Decisions: Read-only for all authorized staff; system can insert
CREATE POLICY "AI Decisions readable by authorized staff" ON public.ai_decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "AI Decisions insertable by authenticated" ON public.ai_decisions FOR INSERT TO authenticated WITH CHECK (true);

-- Loan Policies: Readable by all; strictly Admin only for modifications
CREATE POLICY "Policies readable by all" ON public.loan_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage policies" ON public.loan_policies FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Policy versions readable by all" ON public.policy_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage policy versions" ON public.policy_versions FOR ALL TO authenticated USING (public.is_admin());

-- Risk Flags & Human Review
CREATE POLICY "Risk flags viewable by staff" ON public.risk_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Review cases viewable by staff" ON public.human_review_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reviewers can update review cases" ON public.human_review_cases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Review actions insertable by staff" ON public.human_review_actions FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Review actions viewable by staff" ON public.human_review_actions FOR SELECT TO authenticated USING (true);

-- Audit Events: Read-only for authenticated staff; append-only
CREATE POLICY "Audit events viewable by staff" ON public.audit_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Audit events insertable by staff" ON public.audit_events FOR INSERT TO authenticated WITH CHECK (true);
