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
  UserProfile,
  NotificationItem 
} from '../types';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'usr_admin_01',
    email: 'admin@trusttrack.bank',
    full_name: 'Vikramaditya Roy',
    role: 'admin',
    department: 'Risk Management & AI Compliance',
    created_at: '2026-01-10T09:00:00Z'
  },
  {
    id: 'usr_reviewer_01',
    email: 'reviewer@trusttrack.bank',
    full_name: 'Dr. Sarah Mathews',
    role: 'reviewer',
    department: 'Credit Underwriting & Human Review Desk',
    created_at: '2026-01-15T10:30:00Z'
  }
];

export const INITIAL_POLICIES: LoanPolicy[] = [
  {
    id: 'pol_01',
    policy_key: 'min_monthly_income',
    policy_name: 'Minimum Monthly Income',
    description: 'Applicant gross verifiable monthly income must meet or exceed base financial threshold.',
    policy_category: 'income',
    operator: '>=',
    threshold_value: 40000,
    threshold_unit: 'INR (₹)',
    is_active: true,
    current_version_id: 'ver_pol_01_v1',
    version_number: 1,
    updated_by_id: 'usr_admin_01',
    updated_at: '2026-02-01T10:00:00Z'
  },
  {
    id: 'pol_02',
    policy_key: 'max_dti_ratio',
    policy_name: 'Maximum Debt-to-Income (DTI) Ratio',
    description: 'Total monthly debt obligations divided by monthly income must not exceed configured safety ceiling.',
    policy_category: 'dti',
    operator: '<=',
    threshold_value: 35,
    threshold_unit: '%',
    is_active: true,
    current_version_id: 'ver_pol_02_v1',
    version_number: 1,
    updated_by_id: 'usr_admin_01',
    updated_at: '2026-02-01T10:00:00Z'
  },
  {
    id: 'pol_03',
    policy_key: 'min_credit_score',
    policy_name: 'Minimum Credit Bureau Score',
    description: 'CIBIL / Experian credit bureau score must satisfy prime underwriting minimum threshold.',
    policy_category: 'credit',
    operator: '>=',
    threshold_value: 650,
    threshold_unit: 'Points',
    is_active: true,
    current_version_id: 'ver_pol_03_v1',
    version_number: 1,
    updated_by_id: 'usr_admin_01',
    updated_at: '2026-02-01T10:00:00Z'
  },
  {
    id: 'pol_04',
    policy_key: 'income_proof_required',
    policy_name: 'Verifiable Income Documentation',
    description: 'Mandatory audited salary slips, Form 16, or ITR filings must be submitted and validated.',
    policy_category: 'documentation',
    operator: '==',
    threshold_value: 'Available',
    threshold_unit: 'Status',
    is_active: true,
    current_version_id: 'ver_pol_04_v1',
    version_number: 1,
    updated_by_id: 'usr_admin_01',
    updated_at: '2026-02-01T10:00:00Z'
  }
];

export const INITIAL_POLICY_VERSIONS: PolicyVersion[] = [
  {
    id: 'ver_pol_01_v1',
    policy_id: 'pol_01',
    policy_name: 'Minimum Monthly Income',
    previous_value: 35000,
    new_value: 40000,
    change_rationale: 'Updated in accordance with Q1 2026 inflationary adjustment guidelines.',
    updated_by_id: 'usr_admin_01',
    updated_by_name: 'Vikramaditya Roy',
    version_number: 1,
    created_at: '2026-02-01T10:00:00Z'
  },
  {
    id: 'ver_pol_02_v1',
    policy_id: 'pol_02',
    policy_name: 'Maximum Debt-to-Income (DTI) Ratio',
    previous_value: 40,
    new_value: 35,
    change_rationale: 'Prudential risk containment for unsecured personal and retail loan portfolios.',
    updated_by_id: 'usr_admin_01',
    updated_by_name: 'Vikramaditya Roy',
    version_number: 1,
    created_at: '2026-02-01T10:00:00Z'
  },
  {
    id: 'ver_pol_03_v1',
    policy_id: 'pol_03',
    policy_name: 'Minimum Credit Bureau Score',
    previous_value: 620,
    new_value: 650,
    change_rationale: 'Alignment with standard tier-1 banking benchmark score.',
    updated_by_id: 'usr_admin_01',
    updated_by_name: 'Vikramaditya Roy',
    version_number: 1,
    created_at: '2026-02-01T10:00:00Z'
  },
  {
    id: 'ver_pol_04_v1',
    policy_id: 'pol_04',
    policy_name: 'Verifiable Income Documentation',
    previous_value: 'Optional',
    new_value: 'Available',
    change_rationale: 'Mandatory compliance protocol to curb fraudulent self-declarations.',
    updated_by_id: 'usr_admin_01',
    updated_by_name: 'Vikramaditya Roy',
    version_number: 1,
    created_at: '2026-02-01T10:00:00Z'
  }
];

export const INITIAL_APPLICATIONS: LoanApplication[] = [
  // 1. Meets all configured policies
  {
    id: 'app_ln001',
    applicant_id: 'LN001',
    full_name: 'Arun Kumar',
    email: 'arun.kumar@demo-bank.in',
    phone: '+91 98450 11201',
    loan_amount: 500000,
    loan_purpose: 'Home Improvement & Renovation',
    loan_tenure_months: 36,
    monthly_income: 65000,
    monthly_debt: 12000,
    credit_score: 750,
    employment_type: 'Salaried',
    employer_name: 'Tata Consultancy Services',
    income_proof_status: 'Available',
    identity_proof_status: 'Available',
    dti_ratio: 18.46,
    application_status: 'resolved',
    created_at: '2026-03-01T08:30:00Z',
    updated_at: '2026-03-01T09:15:00Z'
  },
  // 2. Low credit score
  {
    id: 'app_ln002',
    applicant_id: 'LN002',
    full_name: 'Priya Sharma',
    email: 'priya.sharma@demo-bank.in',
    phone: '+91 98450 11202',
    loan_amount: 350000,
    loan_purpose: 'Personal Medical Expenses',
    loan_tenure_months: 24,
    monthly_income: 55000,
    monthly_debt: 10000,
    credit_score: 580,
    employment_type: 'Salaried',
    employer_name: 'Infosys Limited',
    income_proof_status: 'Available',
    identity_proof_status: 'Available',
    dti_ratio: 18.18,
    application_status: 'flagged',
    created_at: '2026-03-01T10:15:00Z',
    updated_at: '2026-03-01T10:20:00Z'
  },
  // 3. High DTI ratio
  {
    id: 'app_ln003',
    applicant_id: 'LN003',
    full_name: 'Rahul Verma',
    email: 'rahul.verma@demo-bank.in',
    phone: '+91 98450 11203',
    loan_amount: 800000,
    loan_purpose: 'Automobile Purchase',
    loan_tenure_months: 48,
    monthly_income: 50000,
    monthly_debt: 24000,
    credit_score: 710,
    employment_type: 'Salaried',
    employer_name: 'Wipro Technologies',
    income_proof_status: 'Available',
    identity_proof_status: 'Available',
    dti_ratio: 48.0,
    application_status: 'flagged',
    created_at: '2026-03-01T11:00:00Z',
    updated_at: '2026-03-01T11:05:00Z'
  },
  // 4. Insufficient income
  {
    id: 'app_ln004',
    applicant_id: 'LN004',
    full_name: 'Ananya Sen',
    email: 'ananya.sen@demo-bank.in',
    phone: '+91 98450 11204',
    loan_amount: 200000,
    loan_purpose: 'Higher Education Certification',
    loan_tenure_months: 18,
    monthly_income: 28000,
    monthly_debt: 5000,
    credit_score: 690,
    employment_type: 'Salaried',
    employer_name: 'St. Jude Educational Foundation',
    income_proof_status: 'Available',
    identity_proof_status: 'Available',
    dti_ratio: 17.86,
    application_status: 'flagged',
    created_at: '2026-03-02T09:30:00Z',
    updated_at: '2026-03-02T09:35:00Z'
  },
  // 5. Missing income proof
  {
    id: 'app_ln005',
    applicant_id: 'LN005',
    full_name: 'Vikram Patel',
    email: 'vikram.patel@demo-bank.in',
    phone: '+91 98450 11205',
    loan_amount: 600000,
    loan_purpose: 'Inventory Expansion',
    loan_tenure_months: 36,
    monthly_income: 80000,
    monthly_debt: 15000,
    credit_score: 740,
    employment_type: 'Self-employed',
    employer_name: 'Patel Trading Enterprise',
    income_proof_status: 'Missing',
    identity_proof_status: 'Available',
    dti_ratio: 18.75,
    application_status: 'under_review',
    created_at: '2026-03-02T11:15:00Z',
    updated_at: '2026-03-02T11:25:00Z'
  },
  // 6. POTENTIAL AI-POLICY MISMATCH (AI rejects, but passes all policies)
  {
    id: 'app_ln006',
    applicant_id: 'LN006',
    full_name: 'Deepa Nair',
    email: 'deepa.nair@demo-bank.in',
    phone: '+91 98450 11206',
    loan_amount: 450000,
    loan_purpose: 'Solar Rooftop Installation',
    loan_tenure_months: 36,
    monthly_income: 72000,
    monthly_debt: 14000,
    credit_score: 760,
    employment_type: 'Salaried',
    employer_name: 'Larsen & Toubro',
    income_proof_status: 'Available',
    identity_proof_status: 'Available',
    dti_ratio: 19.44,
    application_status: 'under_review',
    created_at: '2026-03-02T14:00:00Z',
    updated_at: '2026-03-02T14:10:00Z'
  },
  // 7. AI RECOMMENDS BUT POLICY FAILS (AI recommends, but fails DTI and credit score)
  {
    id: 'app_ln007',
    applicant_id: 'LN007',
    full_name: 'Karthik Raja',
    email: 'karthik.raja@demo-bank.in',
    phone: '+91 98450 11207',
    loan_amount: 750000,
    loan_purpose: 'Wedding Expenses',
    loan_tenure_months: 40,
    monthly_income: 38000,
    monthly_debt: 18000,
    credit_score: 610,
    employment_type: 'Salaried',
    employer_name: 'Apex Logistics',
    income_proof_status: 'Available',
    identity_proof_status: 'Available',
    dti_ratio: 47.37,
    application_status: 'flagged',
    created_at: '2026-03-03T09:45:00Z',
    updated_at: '2026-03-03T09:50:00Z'
  },
  // 8. Incomplete financial information
  {
    id: 'app_ln008',
    applicant_id: 'LN008',
    full_name: 'Sneha Reddy',
    email: 'sneha.reddy@demo-bank.in',
    phone: '+91 98450 11208',
    loan_amount: 300000,
    loan_purpose: 'Home Furnishing',
    loan_tenure_months: 24,
    monthly_income: 60000,
    monthly_debt: 0, // Unstated or missing debt statement
    credit_score: 680,
    employment_type: 'Salaried',
    employer_name: 'Tech Mahindra',
    income_proof_status: 'Pending Verification',
    identity_proof_status: 'Available',
    dti_ratio: 0.0,
    application_status: 'under_review',
    created_at: '2026-03-03T11:20:00Z',
    updated_at: '2026-03-03T11:30:00Z'
  },
  // 9. Requiring additional evidence
  {
    id: 'app_ln009',
    applicant_id: 'LN009',
    full_name: 'Manoj Tiwari',
    email: 'manoj.tiwari@demo-bank.in',
    phone: '+91 98450 11209',
    loan_amount: 900000,
    loan_purpose: 'Commercial Workshop Equipment',
    loan_tenure_months: 48,
    monthly_income: 95000,
    monthly_debt: 20000,
    credit_score: 720,
    employment_type: 'Self-employed',
    employer_name: 'Tiwari Precision Engineering',
    income_proof_status: 'Pending Verification',
    identity_proof_status: 'Available',
    dti_ratio: 21.05,
    application_status: 'under_review',
    created_at: '2026-03-03T13:40:00Z',
    updated_at: '2026-03-03T14:15:00Z'
  },
  // 10. Inconclusive AI recommendation
  {
    id: 'app_ln010',
    applicant_id: 'LN010',
    full_name: 'Farhan Akhtar',
    email: 'farhan.akhtar@demo-bank.in',
    phone: '+91 98450 11210',
    loan_amount: 400000,
    loan_purpose: 'Studio Tech Upgrade',
    loan_tenure_months: 30,
    monthly_income: 45000,
    monthly_debt: 14000,
    credit_score: 660,
    employment_type: 'Self-employed',
    employer_name: 'Freelance Media Production',
    income_proof_status: 'Available',
    identity_proof_status: 'Available',
    dti_ratio: 31.11,
    application_status: 'under_review',
    created_at: '2026-03-03T15:10:00Z',
    updated_at: '2026-03-03T15:20:00Z'
  }
];

export const INITIAL_AI_DECISIONS: AIDecision[] = [
  {
    id: 'ai_dec_001',
    application_id: 'app_ln001',
    applicant_id: 'LN001',
    model_name: 'Google Gemini 1.5 Pro',
    model_version: 'gemini-1.5-pro-002',
    recommendation: 'Recommended',
    confidence_score: 94.2,
    explanation: 'The applicant possesses a robust verifiable monthly income of ₹65,000, an excellent CIBIL credit score of 750, and a conservative debt-to-income ratio of 18.46%. Financial indicators demonstrate strong capacity to service loan obligation.',
    financial_factors: [
      { name: 'Monthly Income', value: '₹65,000', impact: 'positive' },
      { name: 'Credit Score', value: 750, impact: 'positive' },
      { name: 'Debt-to-Income Ratio', value: '18.46%', impact: 'positive' },
      { name: 'Income Documentation', value: 'Available & Verified', impact: 'positive' }
    ],
    positive_factors: [
      'High disposable income exceeding benchmark thresholds',
      'Flawless credit history with tier-1 score of 750',
      'Stable employment with established technology enterprise'
    ],
    risk_factors: [
      'Standard retail market exposure'
    ],
    missing_information: [],
    additional_verification_requirements: [
      'Standard physical address geo-tagging confirmation'
    ],
    is_demo_fallback: false,
    created_at: '2026-03-01T08:31:12Z'
  },
  {
    id: 'ai_dec_002',
    application_id: 'app_ln002',
    applicant_id: 'LN002',
    model_name: 'Google Gemini 1.5 Pro',
    model_version: 'gemini-1.5-pro-002',
    recommendation: 'Not Recommended',
    confidence_score: 88.5,
    explanation: 'Applicant credit score of 580 falls significantly below the prime threshold of 650. Bureau record indicates historical 60+ days past due delinquency on past consumer credit lines.',
    financial_factors: [
      { name: 'Monthly Income', value: '₹55,000', impact: 'positive' },
      { name: 'Credit Score', value: 580, impact: 'negative' },
      { name: 'Debt-to-Income Ratio', value: '18.18%', impact: 'positive' },
      { name: 'Income Documentation', value: 'Available', impact: 'positive' }
    ],
    positive_factors: [
      'Moderate and steady monthly income of ₹55,000',
      'Low debt obligations relative to earnings'
    ],
    risk_factors: [
      'Subprime credit rating (580)',
      'Heightened default probability indicated by historical late payments'
    ],
    missing_information: [],
    additional_verification_requirements: [
      'Credit bureau full tradeline rectification report if disputes are active'
    ],
    is_demo_fallback: false,
    created_at: '2026-03-01T10:16:04Z'
  },
  {
    id: 'ai_dec_003',
    application_id: 'app_ln003',
    applicant_id: 'LN003',
    model_name: 'Google Gemini 1.5 Pro',
    model_version: 'gemini-1.5-pro-002',
    recommendation: 'Not Recommended',
    confidence_score: 91.0,
    explanation: 'Applicant is heavily leveraged with an existing monthly debt burden of ₹24,000 against ₹50,000 income, yielding a high Debt-to-Income ratio of 48.00%, well above the 35% safe ceiling.',
    financial_factors: [
      { name: 'Monthly Income', value: '₹50,000', impact: 'neutral' },
      { name: 'Credit Score', value: 710, impact: 'positive' },
      { name: 'Debt-to-Income Ratio', value: '48.00%', impact: 'negative' },
      { name: 'Loan Burden', value: 'High', impact: 'negative' }
    ],
    positive_factors: [
      'Good credit score of 710'
    ],
    risk_factors: [
      'Severe existing debt overhang (48% DTI)',
      'Potential cash-flow vulnerability to unforeseen financial shocks'
    ],
    missing_information: [],
    additional_verification_requirements: [
      'Proof of any proposed loan consolidation or foreclosure'
    ],
    is_demo_fallback: false,
    created_at: '2026-03-01T11:01:20Z'
  },
  {
    id: 'ai_dec_004',
    application_id: 'app_ln004',
    applicant_id: 'LN004',
    model_name: 'Google Gemini 1.5 Pro',
    model_version: 'gemini-1.5-pro-002',
    recommendation: 'Not Recommended',
    confidence_score: 86.4,
    explanation: 'Declared monthly net income of ₹28,000 fails the minimum baseline threshold of ₹40,000. Insufficient residual margin to support debt servicing after living subsistence expenses.',
    financial_factors: [
      { name: 'Monthly Income', value: '₹28,000', impact: 'negative' },
      { name: 'Credit Score', value: 690, impact: 'positive' },
      { name: 'Debt-to-Income Ratio', value: '17.86%', impact: 'positive' }
    ],
    positive_factors: [
      'Responsible credit utilization (690)'
    ],
    risk_factors: [
      'Income lower than institutional minimum underwriting floor'
    ],
    missing_information: [],
    additional_verification_requirements: [
      'Option to introduce a creditworthy co-applicant or guarantor'
    ],
    is_demo_fallback: false,
    created_at: '2026-03-02T09:31:05Z'
  },
  {
    id: 'ai_dec_005',
    application_id: 'app_ln005',
    applicant_id: 'LN005',
    model_name: 'Google Gemini 1.5 Pro',
    model_version: 'gemini-1.5-pro-002',
    recommendation: 'Needs More Information',
    confidence_score: 65.0,
    explanation: 'Self-employed profile shows promising revenue claims (₹80,000/mo) and credit score of 740, but official income documentation (ITR/audited accounts) is completely missing.',
    financial_factors: [
      { name: 'Declared Income', value: '₹80,000', impact: 'neutral' },
      { name: 'Income Proof', value: 'Missing', impact: 'negative' },
      { name: 'Credit Score', value: 740, impact: 'positive' }
    ],
    positive_factors: [
      'Strong bureau score of 740'
    ],
    risk_factors: [
      'Unverified informal income declarations without tax filing paper trail'
    ],
    missing_information: [
      'Last 2 years Income Tax Returns with Computation of Income',
      '6 months operative current bank account statements'
    ],
    additional_verification_requirements: [
      'Certified GST returns or business vintage registration certificate'
    ],
    is_demo_fallback: false,
    created_at: '2026-03-02T11:16:30Z'
  },
  // 6. POTENTIAL AI-POLICY MISMATCH: AI says Not Recommended, but all policies pass!
  {
    id: 'ai_dec_006',
    application_id: 'app_ln006',
    applicant_id: 'LN006',
    model_name: 'Google Gemini 1.5 Pro',
    model_version: 'gemini-1.5-pro-002',
    recommendation: 'Not Recommended',
    confidence_score: 72.8,
    explanation: 'AI evaluation rejected application citing peripheral macro-sector volatility concerns in industrial infrastructure. (Note: Applicant satisfies all institutional numerical loan policy thresholds).',
    financial_factors: [
      { name: 'Monthly Income', value: '₹72,000', impact: 'positive' },
      { name: 'Credit Score', value: 760, impact: 'positive' },
      { name: 'Debt-to-Income Ratio', value: '19.44%', impact: 'positive' },
      { name: 'Income Documentation', value: 'Available', impact: 'positive' }
    ],
    positive_factors: [
      'Flawless credit score of 760',
      'Low DTI ratio of 19.44%',
      'High income of ₹72,000 with tier-1 employer'
    ],
    risk_factors: [
      'AI flagged unverified employer sector volatility hypothesis'
    ],
    missing_information: [],
    additional_verification_requirements: [
      'Immediate Human Review required for potential AI model bias/hallucination'
    ],
    is_demo_fallback: false,
    created_at: '2026-03-02T14:01:45Z'
  },
  // 7. AI RECOMMENDS BUT POLICY FAILS: AI says Recommended, but DTI and credit score fail!
  {
    id: 'ai_dec_007',
    application_id: 'app_ln007',
    applicant_id: 'LN007',
    model_name: 'Google Gemini 1.5 Pro',
    model_version: 'gemini-1.5-pro-002',
    recommendation: 'Recommended',
    confidence_score: 71.5,
    explanation: 'AI mistakenly generated a positive recommendation based on qualitative sentiment regarding social wedding commitment, overlooking explicit mathematical policy breaches.',
    financial_factors: [
      { name: 'Monthly Income', value: '₹38,000', impact: 'negative' },
      { name: 'Credit Score', value: 610, impact: 'negative' },
      { name: 'Debt-to-Income Ratio', value: '47.37%', impact: 'negative' }
    ],
    positive_factors: [
      'Prompt submission of loan application paperwork'
    ],
    risk_factors: [
      'Severe DTI breach (47.37% vs 35% max)',
      'Credit score below required minimum (610 vs 650 min)',
      'Monthly income fails floor threshold (₹38,000 vs ₹40,000 min)'
    ],
    missing_information: [],
    additional_verification_requirements: [
      'Mandatory Human Review to enforce strict policy adherence over model oversight'
    ],
    is_demo_fallback: false,
    created_at: '2026-03-03T09:46:22Z'
  },
  {
    id: 'ai_dec_008',
    application_id: 'app_ln008',
    applicant_id: 'LN008',
    model_name: 'Google Gemini 1.5 Pro',
    model_version: 'gemini-1.5-pro-002',
    recommendation: 'Needs More Information',
    confidence_score: 60.0,
    explanation: 'Applicant declares zero monthly debts despite credit bureau mentioning active installment obligations. Detailed bank transaction statement is required to compute accurate DTI.',
    financial_factors: [
      { name: 'Monthly Income', value: '₹60,000', impact: 'positive' },
      { name: 'Declared Debt', value: '₹0 (Disputed)', impact: 'neutral' },
      { name: 'Credit Score', value: 680, impact: 'positive' }
    ],
    positive_factors: [
      'Good income level (₹60,000)',
      'Satisfactory credit score (680)'
    ],
    risk_factors: [
      'Discrepancy between declared zero liabilities and active credit lines'
    ],
    missing_information: [
      'Latest 6-month continuous bank account statements showing EMI debits',
      'Clarification regarding existing personal loan tradeline'
    ],
    additional_verification_requirements: [
      'Bureau tradeline reconciliation'
    ],
    is_demo_fallback: false,
    created_at: '2026-03-03T11:21:50Z'
  },
  {
    id: 'ai_dec_009',
    application_id: 'app_ln009',
    applicant_id: 'LN009',
    model_name: 'Google Gemini 1.5 Pro',
    model_version: 'gemini-1.5-pro-002',
    recommendation: 'Needs More Information',
    confidence_score: 68.0,
    explanation: 'Large exposure loan request (₹9,00,000) for proprietary engineering firm requires audited balance sheet certification and collateral valuation prior to risk approval.',
    financial_factors: [
      { name: 'Monthly Income', value: '₹95,000', impact: 'positive' },
      { name: 'Credit Score', value: 720, impact: 'positive' },
      { name: 'DTI Ratio', value: '21.05%', impact: 'positive' }
    ],
    positive_factors: [
      'High monthly cash flow (₹95,000)',
      'Healthy credit history (720)'
    ],
    risk_factors: [
      'Single-proprietor business concentration risk',
      'High ticket loan size'
    ],
    missing_information: [
      'Audited balance sheet for FY 2024-2025 certified by Chartered Accountant',
      'Workshop property lease deed or title deeds'
    ],
    additional_verification_requirements: [
      'Independent chartered valuation of mechanical assets'
    ],
    is_demo_fallback: false,
    created_at: '2026-03-03T13:42:10Z'
  },
  {
    id: 'ai_dec_010',
    application_id: 'app_ln010',
    applicant_id: 'LN010',
    model_name: 'Google Gemini 1.5 Pro',
    model_version: 'gemini-1.5-pro-002',
    recommendation: 'Inconclusive',
    confidence_score: 52.0,
    explanation: 'Income stream exhibits extreme variance across consecutive quarters (freelance erratic invoices). Inconclusive evidence to reliably project forward debt-service coverage ratio.',
    financial_factors: [
      { name: 'Average Income', value: '₹45,000', impact: 'neutral' },
      { name: 'Credit Score', value: 660, impact: 'neutral' },
      { name: 'DTI Ratio', value: '31.11%', impact: 'neutral' }
    ],
    positive_factors: [
      'Credit score within minimal acceptable band'
    ],
    risk_factors: [
      'High monthly income volatility (+/- 65% quarterly fluctuation)',
      'Lack of long-term employer retainer contracts'
    ],
    missing_information: [
      'Annual client contract retainers',
      '12-month average cash balance report'
    ],
    additional_verification_requirements: [
      'Specialist underwriting review for gig-economy revenue assessment'
    ],
    is_demo_fallback: false,
    created_at: '2026-03-03T15:11:45Z'
  }
];

export const INITIAL_POLICY_RESULTS: PolicyVerificationResult[] = [
  // LN001 - All Passed
  {
    id: 'pvr_001_1',
    application_id: 'app_ln001',
    policy_id: 'pol_01',
    policy_key: 'min_monthly_income',
    policy_name: 'Minimum Monthly Income',
    policy_version_used: 1,
    configured_threshold: '>= ₹40,000',
    actual_applicant_value: '₹65,000',
    status: 'PASSED',
    explanation: 'Applicant monthly income of ₹65,000 exceeds policy threshold of ₹40,000 (+₹25,000 surplus).',
    created_at: '2026-03-01T08:31:30Z'
  },
  {
    id: 'pvr_001_2',
    application_id: 'app_ln001',
    policy_id: 'pol_02',
    policy_key: 'max_dti_ratio',
    policy_name: 'Maximum Debt-to-Income (DTI) Ratio',
    policy_version_used: 1,
    configured_threshold: '<= 35%',
    actual_applicant_value: '18.46%',
    status: 'PASSED',
    explanation: 'Calculated DTI ratio of 18.46% is comfortably within the 35% maximum safety ceiling.',
    created_at: '2026-03-01T08:31:30Z'
  },
  {
    id: 'pvr_001_3',
    application_id: 'app_ln001',
    policy_id: 'pol_03',
    policy_key: 'min_credit_score',
    policy_name: 'Minimum Credit Bureau Score',
    policy_version_used: 1,
    configured_threshold: '>= 650',
    actual_applicant_value: '750',
    status: 'PASSED',
    explanation: 'Credit score of 750 satisfies the minimum benchmark of 650 (+100 points buffer).',
    created_at: '2026-03-01T08:31:30Z'
  },
  {
    id: 'pvr_001_4',
    application_id: 'app_ln001',
    policy_id: 'pol_04',
    policy_key: 'income_proof_required',
    policy_name: 'Verifiable Income Documentation',
    policy_version_used: 1,
    configured_threshold: 'Available',
    actual_applicant_value: 'Available',
    status: 'PASSED',
    explanation: 'Salary slips and tax certificates are complete, verified, and authenticated.',
    created_at: '2026-03-01T08:31:30Z'
  },

  // LN002 - Failed Credit Score
  {
    id: 'pvr_002_1',
    application_id: 'app_ln002',
    policy_id: 'pol_01',
    policy_key: 'min_monthly_income',
    policy_name: 'Minimum Monthly Income',
    policy_version_used: 1,
    configured_threshold: '>= ₹40,000',
    actual_applicant_value: '₹55,000',
    status: 'PASSED',
    explanation: 'Applicant monthly income of ₹55,000 passes threshold of ₹40,000.',
    created_at: '2026-03-01T10:16:30Z'
  },
  {
    id: 'pvr_002_2',
    application_id: 'app_ln002',
    policy_id: 'pol_02',
    policy_key: 'max_dti_ratio',
    policy_name: 'Maximum Debt-to-Income (DTI) Ratio',
    policy_version_used: 1,
    configured_threshold: '<= 35%',
    actual_applicant_value: '18.18%',
    status: 'PASSED',
    explanation: 'DTI ratio of 18.18% is well within the 35% allowable maximum.',
    created_at: '2026-03-01T10:16:30Z'
  },
  {
    id: 'pvr_002_3',
    application_id: 'app_ln002',
    policy_id: 'pol_03',
    policy_key: 'min_credit_score',
    policy_name: 'Minimum Credit Bureau Score',
    policy_version_used: 1,
    configured_threshold: '>= 650',
    actual_applicant_value: '580',
    status: 'FAILED',
    explanation: 'Credit score of 580 fails the minimum required threshold of 650 by 70 points.',
    created_at: '2026-03-01T10:16:30Z'
  },
  {
    id: 'pvr_002_4',
    application_id: 'app_ln002',
    policy_id: 'pol_04',
    policy_key: 'income_proof_required',
    policy_name: 'Verifiable Income Documentation',
    policy_version_used: 1,
    configured_threshold: 'Available',
    actual_applicant_value: 'Available',
    status: 'PASSED',
    explanation: 'Income documentation is available and validated.',
    created_at: '2026-03-01T10:16:30Z'
  },

  // LN006 - Deepa Nair (POTENTIAL AI-POLICY MISMATCH: All policies passed!)
  {
    id: 'pvr_006_1',
    application_id: 'app_ln006',
    policy_id: 'pol_01',
    policy_key: 'min_monthly_income',
    policy_name: 'Minimum Monthly Income',
    policy_version_used: 1,
    configured_threshold: '>= ₹40,000',
    actual_applicant_value: '₹72,000',
    status: 'PASSED',
    explanation: 'Income of ₹72,000 exceeds policy requirement of ₹40,000.',
    created_at: '2026-03-02T14:02:00Z'
  },
  {
    id: 'pvr_006_2',
    application_id: 'app_ln006',
    policy_id: 'pol_02',
    policy_key: 'max_dti_ratio',
    policy_name: 'Maximum Debt-to-Income (DTI) Ratio',
    policy_version_used: 1,
    configured_threshold: '<= 35%',
    actual_applicant_value: '19.44%',
    status: 'PASSED',
    explanation: 'DTI of 19.44% complies with the 35% maximum ceiling.',
    created_at: '2026-03-02T14:02:00Z'
  },
  {
    id: 'pvr_006_3',
    application_id: 'app_ln006',
    policy_id: 'pol_03',
    policy_key: 'min_credit_score',
    policy_name: 'Minimum Credit Bureau Score',
    policy_version_used: 1,
    configured_threshold: '>= 650',
    actual_applicant_value: '760',
    status: 'PASSED',
    explanation: 'Bureau score of 760 exceeds the 650 requirement with a high prime margin.',
    created_at: '2026-03-02T14:02:00Z'
  },
  {
    id: 'pvr_006_4',
    application_id: 'app_ln006',
    policy_id: 'pol_04',
    policy_key: 'income_proof_required',
    policy_name: 'Verifiable Income Documentation',
    policy_version_used: 1,
    configured_threshold: 'Available',
    actual_applicant_value: 'Available',
    status: 'PASSED',
    explanation: 'Complete salary slips and bank statements provided.',
    created_at: '2026-03-02T14:02:00Z'
  },

  // LN007 - Karthik Raja (AI RECOMMENDS BUT POLICY FAILS!)
  {
    id: 'pvr_007_1',
    application_id: 'app_ln007',
    policy_id: 'pol_01',
    policy_key: 'min_monthly_income',
    policy_name: 'Minimum Monthly Income',
    policy_version_used: 1,
    configured_threshold: '>= ₹40,000',
    actual_applicant_value: '₹38,000',
    status: 'FAILED',
    explanation: 'Monthly income of ₹38,000 fails minimum threshold of ₹40,000 by ₹2,000.',
    created_at: '2026-03-03T09:47:00Z'
  },
  {
    id: 'pvr_007_2',
    application_id: 'app_ln007',
    policy_id: 'pol_02',
    policy_key: 'max_dti_ratio',
    policy_name: 'Maximum Debt-to-Income (DTI) Ratio',
    policy_version_used: 1,
    configured_threshold: '<= 35%',
    actual_applicant_value: '47.37%',
    status: 'FAILED',
    explanation: 'DTI ratio of 47.37% exceeds maximum limit of 35% by +12.37%.',
    created_at: '2026-03-03T09:47:00Z'
  },
  {
    id: 'pvr_007_3',
    application_id: 'app_ln007',
    policy_id: 'pol_03',
    policy_key: 'min_credit_score',
    policy_name: 'Minimum Credit Bureau Score',
    policy_version_used: 1,
    configured_threshold: '>= 650',
    actual_applicant_value: '610',
    status: 'FAILED',
    explanation: 'Credit score of 610 fails the 650 threshold by 40 points.',
    created_at: '2026-03-03T09:47:00Z'
  },

  // LN008 - Sneha Reddy (INSUFFICIENT DATA on DTI)
  {
    id: 'pvr_008_1',
    application_id: 'app_ln008',
    policy_id: 'pol_02',
    policy_key: 'max_dti_ratio',
    policy_name: 'Maximum Debt-to-Income (DTI) Ratio',
    policy_version_used: 1,
    configured_threshold: '<= 35%',
    actual_applicant_value: 'Unverified (₹0 declared)',
    status: 'INSUFFICIENT DATA',
    explanation: 'Active external tradelines detected in bureau query; debt obligations unconfirmed. Cannot verify DTI accurately without verified debt schedule.',
    created_at: '2026-03-03T11:22:15Z'
  }
];

export const INITIAL_RISK_FLAGS: RiskFlag[] = [
  // LN006 - Potential AI-Policy Mismatch
  {
    id: 'rf_006',
    application_id: 'app_ln006',
    risk_type: 'POTENTIAL_AI_POLICY_MISMATCH',
    severity: 'High',
    title: 'Potential AI-Policy Mismatch Detected',
    description: 'AI model returned "Not Recommended" despite the applicant passing ALL 4 configured institutional policies (Income: ₹72,000, DTI: 19.44%, Credit: 760, Income Proof: Available). Possible model hallucination or extraneous variable penalty.',
    policy_mismatch_details: 'Policies passed: min_monthly_income (₹72k >= ₹40k), max_dti_ratio (19.44% <= 35%), min_credit_score (760 >= 650), documentation (Available). AI rejected on subjective industry concerns.',
    status: 'UNDER_REVIEW',
    created_at: '2026-03-02T14:02:15Z'
  },
  // LN007 - AI Recommends but Policy Fails
  {
    id: 'rf_007',
    application_id: 'app_ln007',
    risk_type: 'AI_RECOMMENDS_POLICY_FAILS',
    severity: 'High',
    title: 'AI Recommendation Overlooks Policy Failures',
    description: 'AI recommendation is "Recommended", but applicant breached 3 critical financial policies (Income ₹38,000 < ₹40k, DTI 47.37% > 35%, Credit Score 610 < 650). Immediate human review required to avert policy breach sanction.',
    policy_mismatch_details: 'AI recommended based on qualitative narrative while applicant fails DTI, income floor, and credit score thresholds.',
    status: 'PENDING_INVESTIGATION',
    created_at: '2026-03-03T09:47:30Z'
  },
  // LN002 - Policy Failure (Credit Score)
  {
    id: 'rf_002',
    application_id: 'app_ln002',
    risk_type: 'POLICY_FAILURE',
    severity: 'Medium',
    title: 'Policy Failure: Minimum Credit Bureau Score',
    description: 'Applicant credit bureau score of 580 is 70 points below the required minimum threshold of 650.',
    status: 'PENDING_INVESTIGATION',
    created_at: '2026-03-01T10:16:45Z'
  },
  // LN003 - Policy Failure (DTI)
  {
    id: 'rf_003',
    application_id: 'app_ln003',
    risk_type: 'POLICY_FAILURE',
    severity: 'Medium',
    title: 'Policy Failure: Debt-to-Income Ratio Exceeded',
    description: 'DTI ratio calculated at 48.00%, breaching the configured 35.00% safety limit.',
    status: 'PENDING_INVESTIGATION',
    created_at: '2026-03-01T11:01:45Z'
  },
  // LN005 - Insufficient Data (Documentation)
  {
    id: 'rf_005',
    application_id: 'app_ln005',
    risk_type: 'INSUFFICIENT_DATA',
    severity: 'Medium',
    title: 'Insufficient Data: Missing Verifiable Income Proof',
    description: 'Self-employed applicant has not provided ITR or GST bank statements. Missing information does not constitute automatic loan failure, but requires document collection.',
    status: 'UNDER_REVIEW',
    created_at: '2026-03-02T11:17:00Z'
  },
  // LN008 - Insufficient Data
  {
    id: 'rf_008',
    application_id: 'app_ln008',
    risk_type: 'INSUFFICIENT_DATA',
    severity: 'Low',
    title: 'Insufficient Information: Undeclared Debt Liabilities',
    description: 'Discrepancy in debt declaration requires tradeline verification from applicant.',
    status: 'UNDER_REVIEW',
    created_at: '2026-03-03T11:22:30Z'
  }
];

export const INITIAL_HUMAN_REVIEW_CASES: HumanReviewCase[] = [
  {
    id: 'case_006',
    application_id: 'app_ln006',
    applicant_id: 'LN006',
    applicant_name: 'Deepa Nair',
    ai_recommendation: 'Not Recommended',
    risk_flag_id: 'rf_006',
    risk_type: 'POTENTIAL_AI_POLICY_MISMATCH',
    risk_severity: 'High',
    status: 'Under Investigation',
    assigned_reviewer_id: 'usr_reviewer_01',
    assigned_reviewer_name: 'Dr. Sarah Mathews',
    flagged_at: '2026-03-02T14:02:30Z'
  },
  {
    id: 'case_007',
    application_id: 'app_ln007',
    applicant_id: 'LN007',
    applicant_name: 'Karthik Raja',
    ai_recommendation: 'Recommended',
    risk_flag_id: 'rf_007',
    risk_type: 'AI_RECOMMENDS_POLICY_FAILS',
    risk_severity: 'High',
    status: 'Pending Review',
    assigned_reviewer_id: 'usr_reviewer_01',
    assigned_reviewer_name: 'Dr. Sarah Mathews',
    flagged_at: '2026-03-03T09:48:00Z'
  },
  {
    id: 'case_005',
    application_id: 'app_ln005',
    applicant_id: 'LN005',
    applicant_name: 'Vikram Patel',
    ai_recommendation: 'Needs More Information',
    risk_flag_id: 'rf_005',
    risk_type: 'INSUFFICIENT_DATA',
    risk_severity: 'Medium',
    status: 'Evidence Requested',
    assigned_reviewer_id: 'usr_reviewer_01',
    assigned_reviewer_name: 'Dr. Sarah Mathews',
    flagged_at: '2026-03-02T11:17:15Z'
  },
  {
    id: 'case_008',
    application_id: 'app_ln008',
    applicant_id: 'LN008',
    applicant_name: 'Sneha Reddy',
    ai_recommendation: 'Needs More Information',
    risk_flag_id: 'rf_008',
    risk_type: 'INSUFFICIENT_DATA',
    risk_severity: 'Low',
    status: 'Evidence Requested',
    assigned_reviewer_id: 'usr_reviewer_01',
    assigned_reviewer_name: 'Dr. Sarah Mathews',
    flagged_at: '2026-03-03T11:23:00Z'
  },
  {
    id: 'case_009',
    application_id: 'app_ln009',
    applicant_id: 'LN009',
    applicant_name: 'Manoj Tiwari',
    ai_recommendation: 'Needs More Information',
    risk_severity: 'Medium',
    risk_type: 'INSUFFICIENT_DATA',
    status: 'On Hold',
    assigned_reviewer_id: 'usr_reviewer_01',
    assigned_reviewer_name: 'Dr. Sarah Mathews',
    flagged_at: '2026-03-03T13:43:00Z'
  },
  {
    id: 'case_010',
    application_id: 'app_ln010',
    applicant_id: 'LN010',
    applicant_name: 'Farhan Akhtar',
    ai_recommendation: 'Inconclusive',
    risk_severity: 'Medium',
    risk_type: 'INSUFFICIENT_DATA',
    status: 'Under Investigation',
    assigned_reviewer_id: 'usr_reviewer_01',
    assigned_reviewer_name: 'Dr. Sarah Mathews',
    flagged_at: '2026-03-03T15:12:00Z'
  }
];

export const INITIAL_REVIEW_ACTIONS: HumanReviewAction[] = [
  {
    id: 'act_005_1',
    case_id: 'case_005',
    application_id: 'app_ln005',
    reviewer_id: 'usr_reviewer_01',
    reviewer_name: 'Dr. Sarah Mathews',
    action_type: 'REQUEST_EVIDENCE',
    human_finding: 'Requested 2 Years Certified ITR and GST Return Summary',
    mandatory_rationale: 'Self-employed turnover requires formal taxation reconciliation before any credit risk assessment can proceed.',
    evidence_references: ['ITR-V Form 2024-25', '6-Month Current Account Statement'],
    original_ai_recommendation: 'Needs More Information',
    created_at: '2026-03-02T11:25:00Z'
  }
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  // LN001 Genesis Hash Chain
  {
    id: 'aud_001_1',
    application_id: 'app_ln001',
    event_type: 'APPLICATION_SUBMITTED',
    description: 'Applicant profile Arun Kumar (LN001) ingested into TrustTrack platform.',
    actor_id: 'sys_ingest_01',
    actor_name: 'TrustTrack Ingestion Pipeline',
    actor_role: 'system',
    previous_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    current_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    metadata: { loan_amount: 500000, monthly_income: 65000 },
    timestamp: '2026-03-01T08:30:00Z'
  },
  {
    id: 'aud_001_2',
    application_id: 'app_ln001',
    event_type: 'AI_ANALYSIS_COMPLETED',
    description: 'Gemini 1.5 Pro generated recommendation "Recommended" (confidence: 94.2%). Original AI decision saved immutably.',
    actor_id: 'gemini-1.5-pro',
    actor_name: 'Google Gemini 1.5 Pro',
    actor_role: 'system',
    previous_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    current_hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    metadata: { recommendation: 'Recommended', model_version: 'gemini-1.5-pro-002' },
    timestamp: '2026-03-01T08:31:12Z'
  },
  {
    id: 'aud_001_3',
    application_id: 'app_ln001',
    event_type: 'POLICY_VERIFICATION_PERFORMED',
    description: 'Risk Engine completed verification against 4 configured loan policies. All 4 policies PASSED.',
    actor_id: 'risk_engine_v1',
    actor_name: 'TrustTrack Risk Engine',
    actor_role: 'system',
    previous_hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    current_hash: 'c871329a4a75416efef67c1e550e1ef0021c60ad688ec12f71f657a840e6c310',
    metadata: { passed_count: 4, failed_count: 0, insufficient_count: 0 },
    timestamp: '2026-03-01T08:31:30Z'
  },
  // LN006 Genesis Hash Chain (Mismatch event)
  {
    id: 'aud_006_1',
    application_id: 'app_ln006',
    event_type: 'APPLICATION_SUBMITTED',
    description: 'Applicant profile Deepa Nair (LN006) ingested into TrustTrack platform.',
    actor_id: 'sys_ingest_01',
    actor_name: 'TrustTrack Ingestion Pipeline',
    actor_role: 'system',
    previous_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    current_hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    metadata: { loan_amount: 450000, monthly_income: 72000 },
    timestamp: '2026-03-02T14:00:00Z'
  },
  {
    id: 'aud_006_2',
    application_id: 'app_ln006',
    event_type: 'AI_ANALYSIS_COMPLETED',
    description: 'Gemini 1.5 Pro evaluated application: "Not Recommended" (confidence: 72.8%).',
    actor_id: 'gemini-1.5-pro',
    actor_name: 'Google Gemini 1.5 Pro',
    actor_role: 'system',
    previous_hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    current_hash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    metadata: { recommendation: 'Not Recommended' },
    timestamp: '2026-03-02T14:01:45Z'
  },
  {
    id: 'aud_006_3',
    application_id: 'app_ln006',
    event_type: 'RISK_ALERT_GENERATED',
    description: 'ALERT: Potential AI-Policy Mismatch detected. Applicant satisfies all policies but received AI rejection.',
    actor_id: 'risk_engine_v1',
    actor_name: 'TrustTrack Risk Engine',
    actor_role: 'system',
    previous_hash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    current_hash: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    metadata: { risk_type: 'POTENTIAL_AI_POLICY_MISMATCH', severity: 'High' },
    timestamp: '2026-03-02T14:02:15Z'
  },
  {
    id: 'aud_006_4',
    application_id: 'app_ln006',
    event_type: 'HUMAN_REVIEW_ASSIGNED',
    description: 'Case escalated and assigned to Dr. Sarah Mathews for mandatory investigation.',
    actor_id: 'sys_workflow_01',
    actor_name: 'Review Dispatcher Engine',
    actor_role: 'system',
    previous_hash: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    current_hash: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    metadata: { reviewer_id: 'usr_reviewer_01' },
    timestamp: '2026-03-02T14:02:30Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_001',
    title: 'High Risk Alert: Potential AI-Policy Mismatch',
    message: 'Application LN006 (Deepa Nair) passed all financial criteria but was rejected by AI. Assigned to Human Review.',
    type: 'mismatch',
    is_read: false,
    link: '/human-review',
    created_at: '2026-03-02T14:02:35Z'
  },
  {
    id: 'notif_002',
    title: 'Policy Violation Alert: AI Recommends Over Policy',
    message: 'Application LN007 (Karthik Raja) recommended by AI despite DTI (47.37%) and credit score failure.',
    type: 'risk',
    is_read: false,
    link: '/human-review',
    created_at: '2026-03-03T09:48:05Z'
  },
  {
    id: 'notif_003',
    title: 'Additional Evidence Requested',
    message: 'Reviewer Dr. Sarah Mathews requested certified 2-year ITRs for Vikram Patel (LN005).',
    type: 'evidence',
    is_read: true,
    link: '/human-review',
    created_at: '2026-03-02T11:25:30Z'
  }
];
