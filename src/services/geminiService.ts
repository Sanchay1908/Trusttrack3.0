import { 
  AIDecision, 
  LoanApplication, 
  FinancialFactor, 
  PolicyVerificationResult, 
  RiskFlag, 
  HumanReviewAction,
  ExecutionMode,
  AIRecommendationType
} from '../types';
import { STORAGE_KEYS } from '../lib/supabase';
import { calculateDTI } from './riskEngineService';

export interface ParsedApplicantRaw {
  applicant_id: string;
  full_name: string;
  monthly_income: number;
  monthly_debt: number;
  credit_score: number;
  loan_amount: number;
  employment_type: 'Salaried' | 'Self-employed' | 'Business' | 'Other';
  employer_name?: string;
  income_proof_status: 'Available' | 'Missing' | 'Pending Verification';
  loan_purpose?: string;
  loan_tenure_months?: number;
}

export interface ValidationIssue {
  applicant_id: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validate applicant data before sending to Gemini
 */
export function validateApplicantRecord(applicant: ParsedApplicantRaw): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!applicant.applicant_id || !applicant.applicant_id.trim()) {
    issues.push({ applicant_id: applicant.applicant_id || 'UNKNOWN', field: 'applicant_id', message: 'Applicant ID is required.', severity: 'error' });
  }

  if (!applicant.full_name || !applicant.full_name.trim()) {
    issues.push({ applicant_id: applicant.applicant_id, field: 'full_name', message: 'Applicant name is missing.', severity: 'error' });
  }

  if (applicant.monthly_income < 0) {
    issues.push({ applicant_id: applicant.applicant_id, field: 'monthly_income', message: 'Monthly income cannot be negative.', severity: 'error' });
  } else if (applicant.monthly_income === 0) {
    issues.push({ applicant_id: applicant.applicant_id, field: 'monthly_income', message: 'Monthly income is declared as ₹0.', severity: 'warning' });
  }

  if (applicant.monthly_debt < 0) {
    issues.push({ applicant_id: applicant.applicant_id, field: 'monthly_debt', message: 'Monthly debt cannot be negative.', severity: 'error' });
  }

  if (applicant.credit_score < 300 || applicant.credit_score > 900) {
    issues.push({ applicant_id: applicant.applicant_id, field: 'credit_score', message: `Credit bureau score ${applicant.credit_score} is outside standard range (300-900).`, severity: 'warning' });
  }

  if (applicant.loan_amount <= 0) {
    issues.push({ applicant_id: applicant.applicant_id, field: 'loan_amount', message: 'Loan amount must be greater than zero.', severity: 'error' });
  }

  if (applicant.income_proof_status === 'Missing') {
    issues.push({ applicant_id: applicant.applicant_id, field: 'income_proof_status', message: 'Income documentation is missing. Policy mandates proof of income.', severity: 'warning' });
  }

  return issues;
}

export function parseApplicantProfiles(rawText: string): ParsedApplicantRaw[] {
  if (!rawText || !rawText.trim()) return [];

  const chunks = rawText.split(/(?=Applicant\s*(?:ID)?\s*[:\-])/i).filter(c => c.trim().length > 0);
  const parsedList: ParsedApplicantRaw[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);

    let id = `LN${String(i + 1).padStart(3, '0')}`;
    let name = `Applicant ${i + 1}`;
    let income = 0;
    let debt = 0;
    let score = 700;
    let amount = 500000;
    let employment: 'Salaried' | 'Self-employed' | 'Business' | 'Other' = 'Salaried';
    let incomeProof: 'Available' | 'Missing' | 'Pending Verification' = 'Available';
    let purpose = 'Personal / Retail Credit';
    let tenure = 36;
    let employer = '';

    for (const line of lines) {
      const idMatch = line.match(/Applicant\s*(?:ID)?\s*[:\-]\s*(.+)/i);
      if (idMatch) id = idMatch[1].trim();

      const nameMatch = line.match(/Name\s*[:\-]\s*(.+)/i);
      if (nameMatch) name = nameMatch[1].trim();

      const incomeMatch = line.match(/(?:Monthly\s*)?Income\s*[:\-]\s*₹?([0-9,.]+)/i);
      if (incomeMatch) income = parseFloat(incomeMatch[1].replace(/,/g, ''));

      const debtMatch = line.match(/(?:Monthly\s*)?Debt\s*[:\-]\s*₹?([0-9,.]+)/i);
      if (debtMatch) debt = parseFloat(debtMatch[1].replace(/,/g, ''));

      const scoreMatch = line.match(/Credit\s*(?:Score)?\s*[:\-]\s*([0-9]+)/i);
      if (scoreMatch) score = parseInt(scoreMatch[1], 10);

      const amountMatch = line.match(/Loan\s*Amount\s*[:\-]\s*₹?([0-9,.]+)/i);
      if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g, ''));

      const empMatch = line.match(/Employment\s*(?:Type)?\s*[:\-]\s*(.+)/i);
      if (empMatch) {
        const val = empMatch[1].trim().toLowerCase();
        if (val.includes('self')) employment = 'Self-employed';
        else if (val.includes('business')) employment = 'Business';
        else if (val.includes('other')) employment = 'Other';
        else employment = 'Salaried';
      }

      const employerMatch = line.match(/Employer\s*[:\-]\s*(.+)/i);
      if (employerMatch) employer = employerMatch[1].trim();

      const proofMatch = line.match(/Income\s*Proof\s*[:\-]\s*(.+)/i);
      if (proofMatch) {
        const val = proofMatch[1].trim().toLowerCase();
        if (val.includes('miss')) incomeProof = 'Missing';
        else if (val.includes('pend')) incomeProof = 'Pending Verification';
        else incomeProof = 'Available';
      }

      const purposeMatch = line.match(/Purpose\s*[:\-]\s*(.+)/i);
      if (purposeMatch) purpose = purposeMatch[1].trim();

      const tenureMatch = line.match(/Tenure\s*(?:Months)?\s*[:\-]\s*([0-9]+)/i);
      if (tenureMatch) tenure = parseInt(tenureMatch[1], 10);
    }

    parsedList.push({
      applicant_id: id,
      full_name: name,
      monthly_income: income,
      monthly_debt: debt,
      credit_score: score,
      loan_amount: amount,
      employment_type: employment,
      employer_name: employer || undefined,
      income_proof_status: incomeProof,
      loan_purpose: purpose,
      loan_tenure_months: tenure
    });
  }

  return parsedList;
}

function getGeminiApiKey(): string {
  const storedKey = typeof window !== 'undefined' 
    ? localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) 
    : null;
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  return (storedKey && storedKey.trim()) ? storedKey.trim() : envKey;
}

function resolveModelName(modelName: string): string {
  // Route 1.5/2.5 identifiers to active Google Gemini 3.5 Flash
  if (modelName.includes('1.5') || modelName.includes('2.5')) {
    return 'gemini-3.5-flash';
  }
  return modelName;
}

/**
 * Main AI Loan Decision Generation
 * Supports Live Mode and Demo Simulation Mode with controlled, realistic AI errors
 */
export async function evaluateApplicantWithGemini(
  applicant: LoanApplication,
  modelName = 'gemini-3.5-flash',
  mode: ExecutionMode = 'live',
  simulationProbability = 0.20
): Promise<AIDecision> {
  const dti = calculateDTI(applicant.monthly_debt, applicant.monthly_income);
  const activeModel = resolveModelName(modelName);
  const apiKey = getGeminiApiKey();
  const modelVersion = `${activeModel}-002`;

  // Check if Demo Simulation Mode should trigger a controlled mistake
  if (mode === 'simulation') {
    const shouldSimulateMistake = Math.random() < simulationProbability;
    if (shouldSimulateMistake) {
      return generateControlledSimulationMistake(applicant, activeModel, modelVersion, dti);
    }
  }

  // Live Mode: Perform real Gemini inference
  if (apiKey) {
    try {
      const prompt = `You are the AI Underwriting Evaluator for TrustTrack Loan Decision Platform.
Evaluate this loan application rigorously and return a structured JSON assessment:

Applicant Details:
- ID: ${applicant.applicant_id}
- Name: ${applicant.full_name}
- Loan Amount: ₹${applicant.loan_amount.toLocaleString()}
- Purpose: ${applicant.loan_purpose}
- Monthly Income: ₹${applicant.monthly_income.toLocaleString()}
- Monthly Debt: ₹${applicant.monthly_debt.toLocaleString()}
- Calculated DTI Ratio: ${dti}%
- Credit Bureau Score: ${applicant.credit_score}
- Employment Type: ${applicant.employment_type}
- Income Proof Status: ${applicant.income_proof_status}

IMPORTANT RULES:
1. Recommendation MUST be one of: "Recommended", "Not Recommended", "Needs More Information", "Inconclusive".
2. If income proof is Missing, recommend "Needs More Information".
3. Return pure JSON without markdown backticks.

Schema:
{
  "recommendation": "Recommended" | "Not Recommended" | "Needs More Information" | "Inconclusive",
  "confidence_score": number,
  "risk_category": "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk",
  "explanation": "Detailed professional banking underwriting reasoning",
  "positive_factors": ["list of positive aspects"],
  "risk_factors": ["list of risk flags or vulnerabilities"],
  "missing_information": ["list of missing data items"],
  "additional_verification_requirements": ["list of required steps"],
  "recommended_next_steps": ["list of underwriting recommendations"]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);

          // Validate recommendation format
          let rec: AIRecommendationType = 'Recommended';
          const rLower = (parsed.recommendation || '').toLowerCase();
          if (rLower.includes('not')) rec = 'Not Recommended';
          else if (rLower.includes('need') || rLower.includes('information')) rec = 'Needs More Information';
          else if (rLower.includes('inconclusive')) rec = 'Inconclusive';
          else if (rLower.includes('recommend') || rLower.includes('approve')) rec = 'Recommended';

          const factors: FinancialFactor[] = [
            { name: 'Monthly Income', value: `₹${applicant.monthly_income.toLocaleString()}`, impact: applicant.monthly_income >= 40000 ? 'positive' : 'negative' },
            { name: 'Credit Bureau Score', value: applicant.credit_score, impact: applicant.credit_score >= 650 ? 'positive' : 'negative' },
            { name: 'Debt-to-Income (DTI)', value: `${dti}%`, impact: dti <= 35 ? 'positive' : 'negative' },
            { name: 'Income Documentation', value: applicant.income_proof_status, impact: applicant.income_proof_status === 'Available' ? 'positive' : 'negative' }
          ];

          const conf = typeof parsed.confidence_score === 'number'
            ? (parsed.confidence_score <= 1 ? Math.round(parsed.confidence_score * 100) : Math.round(parsed.confidence_score))
            : 90.0;

          return {
            id: `ai_dec_${applicant.id}_${Date.now()}`,
            application_id: applicant.id,
            applicant_id: applicant.applicant_id,
            model_name: `Google Gemini (${activeModel})`,
            model_version: modelVersion,
            recommendation: rec,
            confidence_score: conf,
            risk_category: parsed.risk_category || (rec === 'Recommended' ? 'Low Risk' : rec === 'Not Recommended' ? 'High Risk' : 'Moderate Risk'),
            explanation: parsed.explanation || 'Evaluated via Google Gemini.',
            financial_factors: factors,
            positive_factors: parsed.positive_factors || [],
            risk_factors: parsed.risk_factors || [],
            missing_information: parsed.missing_information || [],
            additional_verification_requirements: parsed.additional_verification_requirements || [],
            recommended_next_steps: parsed.recommended_next_steps || ['Verify documentation and proceed with standard underwriting sanctions.'],
            is_demo_fallback: false,
            is_simulation: false,
            created_at: new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, using verified fallback:', err);
    }
  }

  // Fallback Underwriting Engine with Clear Demonstration Label
  return generateDeterministicFallback(applicant, activeModel, modelVersion, mode);
}

/**
 * Generate controlled, realistic AI mistakes for DEMO SIMULATION MODE
 */
function generateControlledSimulationMistake(
  applicant: LoanApplication,
  modelName: string,
  modelVersion: string,
  dti: number
): AIDecision {
  const isProofAvailable = applicant.income_proof_status === 'Available';
  const passesPolicies = applicant.monthly_income >= 40000 && dti <= 35 && applicant.credit_score >= 650 && isProofAvailable;

  // Determine scenario
  const scenarios: Array<{
    scenario: string;
    reason: string;
    rec: AIRecommendationType;
    conf: number;
    explanation: string;
    riskCategory: string;
  }> = [];

  // Scenario 1: Wrong rejection (passes all policies, but AI rejects)
  if (passesPolicies) {
    scenarios.push({
      scenario: 'Wrong Rejection (Compliant Applicant)',
      reason: 'AI model returned "Not Recommended" despite applicant satisfying all active loan policies. Demonstrates algorithmic risk weighting bias or hallucinated risk indicators.',
      rec: 'Not Recommended',
      conf: 87.5,
      explanation: `AI Underwriting flagged elevated systemic risk based on macroeconomic factors and regional credit indexing, recommending rejection despite nominal compliance with individual policy thresholds.`,
      riskCategory: 'High Risk'
    });

    // Scenario 5: Inconsistent explanation
    scenarios.push({
      scenario: 'Inconsistent Explanation',
      reason: 'AI recommended "Not Recommended" while its generated explanation contradicts itself by stating the applicant satisfies all eligibility parameters.',
      rec: 'Not Recommended',
      conf: 84.0,
      explanation: `The applicant demonstrates exceptional financial strength with steady monthly income of ₹${applicant.monthly_income.toLocaleString()}, a strong credit bureau score of ${applicant.credit_score}, and low debt leverage. All criteria are fully met. Recommendation: Not Recommended.`,
      riskCategory: 'Moderate Risk'
    });
  }

  // Scenario 2: Wrong approval (breaches policies, but AI approves)
  if (!passesPolicies) {
    scenarios.push({
      scenario: 'Wrong Approval (Policy Breach)',
      reason: 'AI model recommended "Recommended" despite critical policy failures (e.g. high DTI, low credit score, or insufficient income). Demonstrates why independent policy verification is essential.',
      rec: 'Recommended',
      conf: 91.0,
      explanation: `AI model prioritized positive career trajectory and employer reputation, recommending approval while overlooking non-compliant DTI ratio (${dti}%) or credit score (${applicant.credit_score}).`,
      riskCategory: 'Low Risk'
    });
  }

  // Scenario 3: Missing data ignored
  if (!isProofAvailable) {
    scenarios.push({
      scenario: 'Missing Data Ignored',
      reason: 'AI produced a highly confident approval recommendation without requiring mandatory verified income documentation.',
      rec: 'Recommended',
      conf: 94.0,
      explanation: `The applicant appears qualified based on self-reported monthly income of ₹${applicant.monthly_income.toLocaleString()}. Loan recommendation is confirmed without requiring audited salary slips.`,
      riskCategory: 'Low Risk'
    });
  }

  // Scenario 4: Incorrect DTI calculation
  if (dti > 35) {
    scenarios.push({
      scenario: 'Incorrect DTI Interpretation',
      reason: 'AI hallucinated a healthy DTI of 24.5%, contradicting the independently calculated DTI of ' + dti + '%.',
      rec: 'Recommended',
      conf: 88.0,
      explanation: `Applicant debt serviceability is rated strong with an internal model DTI estimate of 24.5%, well within acceptable debt tolerance limits.`,
      riskCategory: 'Low Risk'
    });
  }

  const selected = scenarios.length > 0 
    ? scenarios[Math.floor(Math.random() * scenarios.length)]
    : {
        scenario: 'Simulated Boundary Discrepancy',
        reason: 'Simulated AI underwriting uncertainty near policy boundaries.',
        rec: 'Not Recommended' as AIRecommendationType,
        conf: 79.0,
        explanation: `Simulated boundary condition discrepancy triggered for institutional demo evaluation.`,
        riskCategory: 'High Risk'
      };

  const factors: FinancialFactor[] = [
    { name: 'Monthly Income', value: `₹${applicant.monthly_income.toLocaleString()}`, impact: applicant.monthly_income >= 40000 ? 'positive' : 'negative' },
    { name: 'Credit Bureau Score', value: applicant.credit_score, impact: applicant.credit_score >= 650 ? 'positive' : 'negative' },
    { name: 'Debt-to-Income (DTI)', value: `${dti}%`, impact: dti <= 35 ? 'positive' : 'negative' },
    { name: 'Income Documentation', value: applicant.income_proof_status, impact: isProofAvailable ? 'positive' : 'negative' }
  ];

  return {
    id: `ai_sim_${applicant.id}_${Date.now()}`,
    application_id: applicant.id,
    applicant_id: applicant.applicant_id,
    model_name: `Google Gemini (${modelName})`,
    model_version: modelVersion,
    recommendation: selected.rec,
    confidence_score: selected.conf,
    risk_category: selected.riskCategory,
    explanation: selected.explanation,
    financial_factors: factors,
    positive_factors: [`Simulated scenario: ${selected.scenario}`],
    risk_factors: [`Controlled mistake injection: ${selected.reason}`],
    missing_information: !isProofAvailable ? ['Income documentation missing from dossier'] : [],
    additional_verification_requirements: ['Independent TrustTrack Risk Engine scrutiny required'],
    recommended_next_steps: ['Escalate to Human Review Queue for certified underwriter determination'],
    is_demo_fallback: false,
    is_simulation: true,
    simulation_scenario: selected.scenario,
    simulation_reason: selected.reason,
    created_at: new Date().toISOString()
  };
}

function generateDeterministicFallback(
  applicant: LoanApplication,
  modelName: string,
  modelVersion: string,
  mode: ExecutionMode = 'live'
): AIDecision {
  const dti = calculateDTI(applicant.monthly_debt, applicant.monthly_income);
  const isProofAvailable = applicant.income_proof_status === 'Available';

  let recommendation: AIRecommendationType = 'Recommended';
  let confidence = 88.0;
  let explanation = '';
  const positiveFactors: string[] = [];
  const riskFactors: string[] = [];
  const missingInfo: string[] = [];
  const additionalReqs: string[] = [];

  if (!isProofAvailable) {
    recommendation = 'Needs More Information';
    confidence = 65.0;
    explanation = `The applicant has declared an income of ₹${applicant.monthly_income.toLocaleString()} and credit score of ${applicant.credit_score}. However, income proof is ${applicant.income_proof_status}. Official audited documentation is required to verify debt serviceability.`;
    riskFactors.push('Absence of authenticated income verification documents');
    missingInfo.push('Last 3 months salary slips or Form 16 / ITR acknowledgement');
    additionalReqs.push('Request formal employer letter and operative bank statement');
  } else if (applicant.credit_score < 650 || dti > 35 || applicant.monthly_income < 40000) {
    recommendation = 'Not Recommended';
    confidence = 89.5;
    explanation = `The financial profile indicates potential repayment stress. Debt-to-income ratio is ${dti}% (illustrative ceiling 35%) and Credit Score is ${applicant.credit_score} (illustrative floor 650).`;
    if (applicant.credit_score < 650) riskFactors.push(`Credit bureau score (${applicant.credit_score}) below benchmark`);
    if (dti > 35) riskFactors.push(`High debt burden with DTI of ${dti}%`);
    if (applicant.monthly_income < 40000) riskFactors.push(`Monthly income (₹${applicant.monthly_income.toLocaleString()}) below prime bracket`);
    additionalReqs.push('Explore joint liability co-borrower or hypothecation of assets');
  } else {
    recommendation = 'Recommended';
    confidence = 93.0;
    explanation = `The applicant demonstrates strong financial capacity with monthly income of ₹${applicant.monthly_income.toLocaleString()}, a prime credit score of ${applicant.credit_score}, and a conservative debt-to-income ratio of ${dti}%. The provided profile meets configured illustrative guidelines.`;
    positiveFactors.push(`Verified income exceeding ₹40,000 threshold`);
    positiveFactors.push(`Prime credit bureau score of ${applicant.credit_score}`);
    positiveFactors.push(`Low leverage with DTI ratio of ${dti}%`);
    additionalReqs.push('Standard pre-disbursement KYC verification');
  }

  const factors: FinancialFactor[] = [
    { name: 'Monthly Income', value: `₹${applicant.monthly_income.toLocaleString()}`, impact: applicant.monthly_income >= 40000 ? 'positive' : 'negative' },
    { name: 'Credit Bureau Score', value: applicant.credit_score, impact: applicant.credit_score >= 650 ? 'positive' : 'negative' },
    { name: 'Debt-to-Income (DTI)', value: `${dti}%`, impact: dti <= 35 ? 'positive' : 'negative' },
    { name: 'Income Documentation', value: applicant.income_proof_status, impact: isProofAvailable ? 'positive' : 'negative' }
  ];

  return {
    id: `ai_dec_${applicant.id}_${Date.now()}`,
    application_id: applicant.id,
    applicant_id: applicant.applicant_id,
    model_name: `Google Gemini (${modelName} Simulation)`,
    model_version: modelVersion,
    recommendation,
    confidence_score: confidence,
    risk_category: recommendation === 'Recommended' ? 'Low Risk' : recommendation === 'Not Recommended' ? 'High Risk' : 'Moderate Risk',
    explanation,
    financial_factors: factors,
    positive_factors: positiveFactors,
    risk_factors: riskFactors,
    missing_information: missingInfo,
    additional_verification_requirements: additionalReqs,
    recommended_next_steps: ['Standard institutional credit compliance verification.'],
    is_demo_fallback: true,
    is_simulation: mode === 'simulation',
    created_at: new Date().toISOString()
  };
}

/**
 * Gemini AI Audit Summary Generation for PDF Audit Reports
 */
export async function generateAIAuditSummary(
  application: LoanApplication,
  aiDecision: AIDecision | undefined,
  policyResults: PolicyVerificationResult[],
  riskFlags: RiskFlag[],
  reviewActions: HumanReviewAction[]
): Promise<string> {
  const apiKey = getGeminiApiKey();
  const dti = calculateDTI(application.monthly_debt, application.monthly_income);

  const contextData = {
    applicant: {
      id: application.applicant_id,
      name: application.full_name,
      amount: application.loan_amount,
      income: application.monthly_income,
      debt: application.monthly_debt,
      dti: `${dti}%`,
      creditScore: application.credit_score,
      incomeProof: application.income_proof_status
    },
    aiDecision: aiDecision ? {
      recommendation: aiDecision.recommendation,
      confidence: `${aiDecision.confidence_score}%`,
      isSimulation: aiDecision.is_simulation,
      scenario: aiDecision.simulation_scenario
    } : null,
    policies: policyResults.map(p => ({ policy: p.policy_name, status: p.status, threshold: p.configured_threshold, actual: p.actual_applicant_value })),
    flags: riskFlags.map(f => ({ type: f.risk_type, severity: f.severity, title: f.title })),
    reviewActions: reviewActions.map(a => ({ reviewer: a.reviewer_name, action: a.action_type, rationale: a.mandatory_rationale }))
  };

  if (apiKey) {
    try {
      const prompt = `You are the Senior Compliance Auditor for TrustTrack AI Governance Platform.
Produce a concise, professional 3-paragraph executive audit summary based strictly on this factual record:

${JSON.stringify(contextData, null, 2)}

Requirements:
Paragraph 1: State what the AI model recommended, its confidence, and whether this was evaluated in Live Mode or Demo Simulation Mode.
Paragraph 2: Detail how the independent Risk Engine evaluated the application against configured policies, noting any detected policy mismatches or missing information.
Paragraph 3: Summarize human review intervention (if conducted), reviewer decision and rationale, and provide final institutional audit conclusion.
Do not invent facts or metrics outside the provided data. Return plain text only.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 50) {
          return text.trim();
        }
      }
    } catch (e) {
      console.warn('Gemini audit summary generation failed, falling back:', e);
    }
  }

  // Deterministic professional summary fallback
  const aiRec = aiDecision?.recommendation || 'Evaluated';
  const modeLabel = aiDecision?.is_simulation ? 'Demo Simulation Mode (Controlled Mistake Demonstration)' : 'Live Model Inference';
  const hasMismatch = riskFlags.some(f => f.risk_type.includes('MISMATCH'));
  const latestAction = reviewActions[reviewActions.length - 1];

  let p1 = `The loan application for ${application.full_name} (${application.applicant_id}) for an amount of ₹${application.loan_amount.toLocaleString()} was processed under ${modeLabel}. The AI underwriting model rendered an initial recommendation of "${aiRec}" with ${aiDecision?.confidence_score || 88}% confidence.`;
  
  let p2 = `Independent TrustTrack verification evaluated ${policyResults.length} active risk policies. ${hasMismatch ? 'Crucially, a Potential AI-Policy Mismatch was detected: the algorithmic output diverged from active institutional policy criteria, automatically routing this application to the Human Review Queue.' : 'All evaluated parameters conformed to institutional policy benchmarks without critical discrepancy.'}`;

  let p3 = latestAction
    ? `A human credit reviewer (${latestAction.reviewer_name}) completed review with action "${latestAction.action_type.replace('_', ' ')}", recording mandatory rationale: "${latestAction.mandatory_rationale}". The original AI decision has been preserved immutably in the SHA-256 tamper-evident audit ledger.`
    : `The case remains under active compliance governance. Final loan sanctioning remains strictly subject to authorized credit officer authorization.`;

  return `${p1}\n\n${p2}\n\n${p3}`;
}

/**
 * Gemini AI Dashboard Insights Generation
 */
export async function generateDashboardAIInsights(stats: {
  totalApps: number;
  aiRecommended: number;
  aiNotRecommended: number;
  aiNeedsInfo: number;
  flaggedApps: number;
  mismatches: number;
  pendingReviews: number;
  overriddenCount: number;
}): Promise<string[]> {
  const apiKey = getGeminiApiKey();

  if (apiKey && stats.totalApps > 0) {
    try {
      const prompt = `You are the Chief Risk Officer AI Analyst for TrustTrack Loan Governance.
Given these actual platform metrics:
- Total Loan Applications: ${stats.totalApps}
- AI Recommended Approvals: ${stats.aiRecommended}
- AI Rejections: ${stats.aiNotRecommended}
- Missing Information / Inconclusive: ${stats.aiNeedsInfo}
- Potential AI-Policy Mismatches: ${stats.mismatches}
- Flagged Applications: ${stats.flaggedApps}
- Pending Human Review Queue: ${stats.pendingReviews}
- Human Reviewer Overrides: ${stats.overriddenCount}

Generate exactly 3 concise, executive-level institutional insights (1-2 sentences each). Focus on AI decision accountability, policy alignment, and review workload.
Return pure JSON array of strings: ["insight 1", "insight 2", "insight 3"]`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Gemini dashboard insights failed, falling back:', e);
    }
  }

  // Deterministic insights
  return [
    stats.mismatches > 0 
      ? `TrustTrack identified ${stats.mismatches} potential AI–policy mismatch case(s) where model recommendations diverged from configured lending rules, successfully preventing automated misapprovals.`
      : `High policy alignment observed: 0 direct AI–policy mismatches detected across ${stats.totalApps} active applications.`,
    stats.pendingReviews > 0
      ? `Underwriting desk currently has ${stats.pendingReviews} flagged application(s) awaiting mandatory human rationale before any credit sanction can occur.`
      : `Human review queues are fully cleared; all flagged exceptions have been resolved and hash-chained.`,
    stats.overriddenCount > 0
      ? `Human underwriters have overridden ${stats.overriddenCount} AI decision(s), underscoring the critical necessity of human-in-the-loop credit accountability.`
      : `AI recommendations currently exhibit high consensus with credit underwriting assessments.`
  ];
}

/**
 * Gemini Voice Assistant Query Handler with Sensitive Action Detection
 */
export async function queryGeminiVoiceAssistant(
  userQuery: string,
  context: {
    totalApps: number;
    flaggedApps: number;
    pendingReviews: number;
    mismatches: number;
    userRole: string;
    sampleApplicants: Array<{ id: string; name: string; status: string; recommendation?: string }>;
    policies: Array<{ name: string; threshold: string | number }>;
  }
): Promise<{
  reply: string;
  isSensitiveAction: boolean;
  actionType?: string;
  actionPayload?: any;
  confirmationPrompt?: string;
  navigationTarget?: string;
}> {
  const apiKey = getGeminiApiKey();
  const lower = userQuery.toLowerCase();

  // 1. Detect Sensitive Action: Generating / Exporting PDF Report
  if (lower.includes('generate') && (lower.includes('report') || lower.includes('pdf') || lower.includes('audit'))) {
    const idMatch = userQuery.match(/ln[0-9]{3}/i);
    const targetId = idMatch ? idMatch[0].toUpperCase() : (context.sampleApplicants[0]?.id || 'LN001');
    return {
      reply: `I can generate and export the compliance audit report for applicant ${targetId}. This creates an official certified record.`,
      isSensitiveAction: true,
      actionType: 'GENERATE_REPORT',
      actionPayload: { applicantId: targetId },
      confirmationPrompt: `Generate and export formal audit report for ${targetId}?`,
      navigationTarget: 'audit-reports'
    };
  }

  // 2. Detect Sensitive Action: Overriding an AI decision
  if (lower.includes('override') || (lower.includes('reject') && lower.includes('ai')) || (lower.includes('approve') && lower.includes('ai'))) {
    const idMatch = userQuery.match(/ln[0-9]{3}/i);
    const targetId = idMatch ? idMatch[0].toUpperCase() : 'selected case';
    return {
      reply: `Overriding an AI recommendation requires formal credit underwriting authorization and a documented mandatory rationale.`,
      isSensitiveAction: true,
      actionType: 'OVERRIDE_DECISION',
      actionPayload: { applicantId: targetId },
      confirmationPrompt: `Open underwriting desk to formally override case ${targetId}?`,
      navigationTarget: 'human-review'
    };
  }

  // 3. Detect Sensitive Action: Modifying Loan Policy
  if (lower.includes('change policy') || lower.includes('update threshold') || lower.includes('modify rule')) {
    if (context.userRole !== 'admin') {
      return {
        reply: `Policy threshold modifications are restricted strictly to Administrators. You are logged in with ${context.userRole.toUpperCase()} permissions.`,
        isSensitiveAction: false,
        navigationTarget: 'loan-policies'
      };
    }
    return {
      reply: `Altering institutional loan policies affects risk calculations across all future underwriting evaluations.`,
      isSensitiveAction: true,
      actionType: 'MODIFY_POLICY',
      confirmationPrompt: `Open Loan Policy management to adjust policy thresholds?`,
      navigationTarget: 'loan-policies'
    };
  }

  // 4. Regular Natural Language Query: Ask Gemini with actual platform context
  if (apiKey) {
    try {
      const prompt = `You are TrustTrack Voice Assistant, an intelligent voice copilot for loan decision monitoring and accountability.
You answer questions about the TrustTrack platform strictly using the provided live data.

Platform Context:
- Current User Role: ${context.userRole}
- Total Applications: ${context.totalApps}
- Flagged Applications: ${context.flaggedApps}
- Pending Human Reviews: ${context.pendingReviews}
- Potential AI-Policy Mismatches: ${context.mismatches}
- Active Policies: ${context.policies.map(p => `${p.name}: ${p.threshold}`).join(', ')}
- Recent Applicants: ${context.sampleApplicants.map(a => `${a.id} (${a.name}): Status ${a.status}, AI ${a.recommendation || 'Pending'}`).join('; ')}

User Voice Query: "${userQuery}"

Instructions:
1. Provide a direct, professional, 1 to 3 sentence spoken answer.
2. If the user asks to see or navigate to a module (e.g. workspace, human review, decision log, policies, reports, dashboard), suggest where they can view it.
3. If they ask about specific metrics, cite the exact numbers from the context. Do not invent numbers.
4. Output JSON: { "reply": "spoken answer", "navigationTarget": "dashboard" | "workspace" | "decision-log" | "risk-engine" | "human-review" | "audit-reports" | "loan-policies" | "settings" | null }`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            reply: parsed.reply || 'Request processed.',
            isSensitiveAction: false,
            navigationTarget: parsed.navigationTarget || undefined
          };
        }
      }
    } catch (e) {
      console.warn('Gemini voice query failed, using rule-based answer:', e);
    }
  }

  // Deterministic fallback response based on keywords
  let reply = `TrustTrack monitors ${context.totalApps} loan applications with ${context.flaggedApps} active risk alert(s) and ${context.pendingReviews} review case(s) pending.`;
  let navigationTarget: string | undefined = undefined;

  if (lower.includes('flag') || lower.includes('mismatch') || lower.includes('alert')) {
    reply = `There are currently ${context.flaggedApps} flagged applications, including ${context.mismatches} potential AI–policy mismatch cases awaiting underwriter investigation.`;
    navigationTarget = 'risk-engine';
  } else if (lower.includes('pending') || lower.includes('human review') || lower.includes('review queue')) {
    reply = `The Credit Underwriting Desk has ${context.pendingReviews} case(s) pending human review.`;
    navigationTarget = 'human-review';
  } else if (lower.includes('policy') || lower.includes('policies') || lower.includes('threshold') || lower.includes('rules')) {
    reply = `Active policies require a minimum income of ₹40,000, maximum DTI of 35%, and credit score floor of 650.`;
    navigationTarget = 'loan-policies';
  } else if (lower.includes('workspace') || lower.includes('analyse') || lower.includes('analyze')) {
    reply = `Opening AI Workspace where you can submit multi-applicant batches for Gemini underwriting and risk checks.`;
    navigationTarget = 'workspace';
  } else if (lower.includes('decision log') || lower.includes('history')) {
    reply = `Opening the AI Decision Log displaying immutable recommendation records and confidence metrics.`;
    navigationTarget = 'decision-log';
  }

  return {
    reply,
    isSensitiveAction: false,
    navigationTarget
  };
}

/**
 * Human Review Underwriting Assistance via Gemini
 */
export async function generateHumanReviewGuidance(
  applicant: LoanApplication,
  aiDecision: AIDecision | undefined,
  failedPolicies: PolicyVerificationResult[],
  riskFlags: RiskFlag[]
): Promise<string> {
  const apiKey = getGeminiApiKey();
  const dti = calculateDTI(applicant.monthly_debt, applicant.monthly_income);

  if (apiKey) {
    try {
      const prompt = `You are the Underwriting AI Assistant helping a senior credit officer review a flagged loan application.
Applicant Details:
- Name: ${applicant.full_name} (${applicant.applicant_id})
- Monthly Income: ₹${applicant.monthly_income.toLocaleString()}
- Monthly Debt: ₹${applicant.monthly_debt.toLocaleString()} (Calculated DTI: ${dti}%)
- Credit Score: ${applicant.credit_score}
- Income Proof: ${applicant.income_proof_status}
- Original AI Recommendation: ${aiDecision?.recommendation || 'None'} (Confidence: ${aiDecision?.confidence_score}%)
- Flagged Issues: ${riskFlags.map(f => f.title).join('; ')}
- Breached Policies: ${failedPolicies.map(p => `${p.policy_name} (Threshold: ${p.configured_threshold}, Actual: ${p.actual_applicant_value})`).join('; ')}

Provide 2-3 concise, actionable underwriting guidance points to help the reviewer determine whether to CONFIRM, OVERRIDE, or REQUEST EVIDENCE. Focus on debt serviceability and document authenticity.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn('Gemini review guidance failed:', e);
    }
  }

  // Deterministic fallback guidance
  if (failedPolicies.length > 0) {
    return `Reviewer Guidance: Applicant breaches ${failedPolicies.length} configured policy requirement(s): ${failedPolicies.map(f => f.policy_name).join(', ')}. If confirming an override, document statutory justification and verify collateral or co-borrower guarantees.`;
  }
  return `Reviewer Guidance: Applicant satisfies configured income, DTI, and credit benchmarks. Investigate reason for AI rejection (e.g. uncalibrated model weighting or employment tenure) before confirming or overriding.`;
}
