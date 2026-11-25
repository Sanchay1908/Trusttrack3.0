import { 
  LoanApplication, 
  LoanPolicy, 
  PolicyVerificationResult, 
  AIDecision, 
  RiskFlag, 
  HumanReviewCase 
} from '../types';

export function calculateDTI(monthlyDebt: number, monthlyIncome: number): number {
  if (!monthlyIncome || monthlyIncome <= 0 || isNaN(monthlyIncome)) return 0;
  if (!monthlyDebt || isNaN(monthlyDebt)) return 0;
  return parseFloat(((monthlyDebt / monthlyIncome) * 100).toFixed(2));
}

export function verifyApplicantAgainstPolicies(
  application: LoanApplication,
  policies: LoanPolicy[]
): PolicyVerificationResult[] {
  const results: PolicyVerificationResult[] = [];

  for (const policy of policies) {
    if (!policy.is_active) continue;

    let status: 'PASSED' | 'FAILED' | 'INSUFFICIENT DATA' = 'PASSED';
    let explanation = '';
    let actualValue: string | number = '';

    switch (policy.policy_key) {
      case 'min_monthly_income': {
        const threshold = Number(policy.threshold_value);
        actualValue = `₹${application.monthly_income?.toLocaleString() ?? 0}`;
        if (application.monthly_income === undefined || application.monthly_income === null || isNaN(application.monthly_income)) {
          status = 'INSUFFICIENT DATA';
          explanation = 'Monthly income not provided or unverified.';
        } else if (application.monthly_income >= threshold) {
          status = 'PASSED';
          explanation = `Monthly income of ₹${application.monthly_income.toLocaleString()} satisfies minimum requirement of ₹${threshold.toLocaleString()}. (+₹${(application.monthly_income - threshold).toLocaleString()} surplus)`;
        } else {
          status = 'FAILED';
          explanation = `Monthly income of ₹${application.monthly_income.toLocaleString()} is below configured floor of ₹${threshold.toLocaleString()} by ₹${(threshold - application.monthly_income).toLocaleString()}.`;
        }
        break;
      }

      case 'max_dti_ratio': {
        const threshold = Number(policy.threshold_value);
        const dti = calculateDTI(application.monthly_debt, application.monthly_income);
        
        if (application.monthly_debt === undefined || application.monthly_debt === null || isNaN(application.monthly_debt)) {
          actualValue = 'Unstated';
          status = 'INSUFFICIENT DATA';
          explanation = 'Monthly debt obligations missing; debt-to-income ratio cannot be computed accurately.';
        } else {
          actualValue = `${dti.toFixed(2)}%`;
          if (dti <= threshold) {
            status = 'PASSED';
            explanation = `Debt-to-income ratio of ${dti.toFixed(2)}% is within the configured limit of ${threshold}%.`;
          } else {
            status = 'FAILED';
            explanation = `Debt-to-income ratio of ${dti.toFixed(2)}% exceeds maximum allowable threshold of ${threshold}% by ${(dti - threshold).toFixed(2)}%.`;
          }
        }
        break;
      }

      case 'min_credit_score': {
        const threshold = Number(policy.threshold_value);
        actualValue = application.credit_score;
        if (!application.credit_score || isNaN(application.credit_score)) {
          status = 'INSUFFICIENT DATA';
          explanation = 'Credit bureau score not provided in profile.';
        } else if (application.credit_score >= threshold) {
          status = 'PASSED';
          explanation = `Credit bureau score of ${application.credit_score} satisfies minimum threshold of ${threshold} (+${application.credit_score - threshold} points).`;
        } else {
          status = 'FAILED';
          explanation = `Credit bureau score of ${application.credit_score} fails threshold of ${threshold} by ${threshold - application.credit_score} points.`;
        }
        break;
      }

      case 'income_proof_required': {
        actualValue = application.income_proof_status;
        if (application.income_proof_status === 'Available') {
          status = 'PASSED';
          explanation = 'Audited salary slips or official tax returns submitted and verified.';
        } else if (application.income_proof_status === 'Pending Verification') {
          status = 'INSUFFICIENT DATA';
          explanation = 'Documentation is under verification review. Insufficient data to conclude pass/fail.';
        } else {
          // Missing data is classified as INSUFFICIENT DATA per rule:
          // "Missing data must not automatically count as FAILED"
          status = 'INSUFFICIENT DATA';
          explanation = 'Income documentation is missing. Requires audited documentation before final determination.';
        }
        break;
      }

      default: {
        actualValue = 'Satisfied';
        status = 'PASSED';
        explanation = 'Configured criteria met.';
      }
    }

    results.push({
      id: `pvr_${application.id}_${policy.id}_${Date.now()}`,
      application_id: application.id,
      policy_id: policy.id,
      policy_key: policy.policy_key,
      policy_name: policy.policy_name,
      policy_version_used: policy.version_number || 1,
      configured_threshold: `${policy.operator} ${policy.threshold_value} ${policy.threshold_unit || ''}`.trim(),
      actual_applicant_value: actualValue,
      status,
      explanation,
      created_at: new Date().toISOString()
    });
  }

  return results;
}

/**
 * Independent Discrepancy & Mismatch Detection
 * Detects all 5 mismatch scenarios between AI recommendations and independent policy calculations
 */
export function detectRiskFlags(
  application: LoanApplication,
  aiDecision: AIDecision,
  verificationResults: PolicyVerificationResult[]
): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const allPassed = verificationResults.length > 0 && verificationResults.every(r => r.status === 'PASSED');
  const failedResults = verificationResults.filter(r => r.status === 'FAILED');
  const insufficientResults = verificationResults.filter(r => r.status === 'INSUFFICIENT DATA');
  const dti = calculateDTI(application.monthly_debt, application.monthly_income);

  // Mismatch 1: AI REJECT + all applicable policies PASSED
  if (aiDecision.recommendation === 'Not Recommended' && allPassed) {
    flags.push({
      id: `rf_mismatch_${application.id}_${Date.now()}`,
      application_id: application.id,
      risk_type: 'POTENTIAL_AI_POLICY_MISMATCH',
      severity: 'High',
      title: 'Potential AI–Policy Mismatch Detected (Wrong Rejection)',
      description: `AI model returned "Not Recommended" despite applicant ${application.full_name} passing ALL configured loan eligibility checks. This indicates potential model hallucination, uncalibrated risk weighting, or extraneous bias.`,
      policy_mismatch_details: `Applicant satisfies all ${verificationResults.length} active policies: ${verificationResults.map(v => v.policy_name).join(', ')}. AI explanation: "${aiDecision.explanation}"`,
      status: 'PENDING_INVESTIGATION',
      created_at: new Date().toISOString()
    });
  }

  // Mismatch 2: AI APPROVE + one or more applicable policies FAILED
  if (aiDecision.recommendation === 'Recommended' && failedResults.length > 0) {
    flags.push({
      id: `rf_ai_overlook_${application.id}_${Date.now()}`,
      application_id: application.id,
      risk_type: 'AI_RECOMMENDS_POLICY_FAILS',
      severity: 'High',
      title: 'AI Recommendation Overlooks Policy Failures (Wrong Approval)',
      description: `AI recommendation is "Recommended" for ${application.full_name}, but applicant breached ${failedResults.length} configured policy requirement(s). AI decision must not be permitted to override strict risk policy without human scrutiny.`,
      policy_mismatch_details: failedResults.map(f => `${f.policy_name}: required ${f.configured_threshold}, actual was ${f.actual_applicant_value}`).join(' | '),
      status: 'PENDING_INVESTIGATION',
      created_at: new Date().toISOString()
    });
  }

  // Mismatch 3: AI gives a confident recommendation despite important missing data
  if (aiDecision.confidence_score >= 80 && (insufficientResults.length > 0 || application.income_proof_status !== 'Available')) {
    if (aiDecision.recommendation === 'Recommended') {
      flags.push({
        id: `rf_missing_conf_${application.id}_${Date.now()}`,
        application_id: application.id,
        risk_type: 'MISSING_DATA_CONFIDENCE_MISMATCH',
        severity: 'High',
        title: 'Confident AI Recommendation Despite Missing Data',
        description: `AI generated a confident (${aiDecision.confidence_score}%) approval recommendation, but essential income proof or documentation is unverified or missing. Missing information must remain INSUFFICIENT DATA until verified.`,
        policy_mismatch_details: `Documentation status: ${application.income_proof_status}. AI omitted required verification constraints.`,
        status: 'PENDING_INVESTIGATION',
        created_at: new Date().toISOString()
      });
    }
  }

  // Mismatch 4: AI explanation contradicts its recommendation
  const expLower = aiDecision.explanation.toLowerCase();
  const recLower = aiDecision.recommendation.toLowerCase();
  const statesEligible = expLower.includes('satisfies all') || expLower.includes('fully meets') || expLower.includes('exceptional financial strength') || expLower.includes('strong financial capacity');
  const statesIneligible = expLower.includes('high risk') || expLower.includes('repayment stress') || expLower.includes('unacceptable debt') || expLower.includes('disqualif');

  if (recLower.includes('not') && statesEligible) {
    flags.push({
      id: `rf_contradiction_${application.id}_${Date.now()}`,
      application_id: application.id,
      risk_type: 'AI_EXPLANATION_CONTRADICTION',
      severity: 'High',
      title: 'AI Reasoning Contradiction Detected',
      description: `The AI recommended rejection ("${aiDecision.recommendation}"), but its internal explanation states that the applicant satisfies all eligibility requirements. This internal inconsistency warrants immediate review.`,
      policy_mismatch_details: `AI Explanation: "${aiDecision.explanation}"`,
      status: 'PENDING_INVESTIGATION',
      created_at: new Date().toISOString()
    });
  } else if (recLower.includes('recommend') && !recLower.includes('not') && statesIneligible) {
    flags.push({
      id: `rf_contradiction_${application.id}_${Date.now()}`,
      application_id: application.id,
      risk_type: 'AI_EXPLANATION_CONTRADICTION',
      severity: 'High',
      title: 'AI Reasoning Contradiction Detected',
      description: `The AI recommended approval, but its generated explanation highlights disqualifying risk factors or severe repayment stress.`,
      policy_mismatch_details: `AI Explanation: "${aiDecision.explanation}"`,
      status: 'PENDING_INVESTIGATION',
      created_at: new Date().toISOString()
    });
  }

  // Mismatch 5: AI calculated financial values differ from independent calculation
  const aiDtiFactor = aiDecision.financial_factors?.find(f => f.name.toLowerCase().includes('dti'));
  if (aiDtiFactor) {
    const rawAiDtiStr = String(aiDtiFactor.value).replace(/[^0-9.]/g, '');
    const aiParsedDti = parseFloat(rawAiDtiStr);
    if (!isNaN(aiParsedDti) && Math.abs(aiParsedDti - dti) > 5) {
      flags.push({
        id: `rf_calc_disc_${application.id}_${Date.now()}`,
        application_id: application.id,
        risk_type: 'FINANCIAL_CALCULATION_DISCREPANCY',
        severity: 'Medium',
        title: 'Financial Calculation Discrepancy (DTI Mismatch)',
        description: `AI cited a DTI of ${aiParsedDti}%, which differs from the independently verified DTI calculation of ${dti}%. TrustTrack calculates DTI using authenticated debt and income parameters.`,
        policy_mismatch_details: `Stated AI DTI: ${aiParsedDti}% vs Verified Institutional DTI: ${dti}%`,
        status: 'PENDING_INVESTIGATION',
        created_at: new Date().toISOString()
      });
    }
  }

  // Standard Policy Failures (if not already captured by AI mismatch)
  if (failedResults.length > 0 && aiDecision.recommendation !== 'Recommended') {
    flags.push({
      id: `rf_fail_${application.id}_${Date.now()}`,
      application_id: application.id,
      risk_type: 'POLICY_FAILURE',
      severity: failedResults.length >= 2 ? 'High' : 'Medium',
      title: `Policy Failure: ${failedResults.map(f => f.policy_name).join(', ')}`,
      description: `Applicant failed ${failedResults.length} configured policy checks: ${failedResults.map(f => f.explanation).join(' ')}`,
      policy_mismatch_details: failedResults.map(f => `${f.policy_name} [${f.actual_applicant_value} vs threshold ${f.configured_threshold}]`).join(', '),
      status: 'PENDING_INVESTIGATION',
      created_at: new Date().toISOString()
    });
  }

  // Standard Insufficient Information
  if (insufficientResults.length > 0 && !flags.some(f => f.risk_type === 'MISSING_DATA_CONFIDENCE_MISMATCH')) {
    flags.push({
      id: `rf_insufficient_${application.id}_${Date.now()}`,
      application_id: application.id,
      risk_type: 'INSUFFICIENT_DATA',
      severity: 'Medium',
      title: `Insufficient Information: ${insufficientResults.map(i => i.policy_name).join(', ')}`,
      description: `Missing required evidence for ${insufficientResults.length} policy check(s). Note: Missing information is not classified as a failure. Additional evidence must be requested.`,
      policy_mismatch_details: `Pending items: ${insufficientResults.map(i => i.policy_name).join(', ')}`,
      status: 'PENDING_INVESTIGATION',
      created_at: new Date().toISOString()
    });
  }

  return flags;
}

export function createReviewCaseFromRiskFlags(
  application: LoanApplication,
  aiDecision: AIDecision,
  riskFlags: RiskFlag[]
): HumanReviewCase | null {
  if (!riskFlags || riskFlags.length === 0) return null;

  const highestRisk = riskFlags.reduce((prev, curr) => {
    if (curr.severity === 'High') return curr;
    if (prev.severity === 'High') return prev;
    if (curr.severity === 'Medium') return curr;
    return prev;
  }, riskFlags[0]);

  return {
    id: `case_${application.id}_${Date.now()}`,
    application_id: application.id,
    applicant_id: application.applicant_id,
    applicant_name: application.full_name,
    ai_recommendation: aiDecision.recommendation,
    risk_flag_id: highestRisk.id,
    risk_type: highestRisk.risk_type,
    risk_severity: highestRisk.severity,
    status: 'Pending Review',
    flagged_at: new Date().toISOString()
  };
}

/**
 * Categorize overall application mismatch status for UI displays
 */
export function classifyApplicationMismatchStatus(
  application: LoanApplication,
  riskFlags: RiskFlag[],
  hasReviewCompleted = false
): 'NO MISMATCH' | 'POTENTIAL AI-POLICY MISMATCH' | 'INSUFFICIENT DATA' | 'REQUIRES HUMAN REVIEW' | 'REVIEW COMPLETED' {
  if (hasReviewCompleted) return 'REVIEW COMPLETED';

  const hasMismatch = riskFlags.some(f => 
    f.risk_type === 'POTENTIAL_AI_POLICY_MISMATCH' || 
    f.risk_type === 'AI_RECOMMENDS_POLICY_FAILS' ||
    f.risk_type === 'AI_EXPLANATION_CONTRADICTION' ||
    f.risk_type === 'MISSING_DATA_CONFIDENCE_MISMATCH'
  );

  if (hasMismatch) return 'POTENTIAL AI-POLICY MISMATCH';

  const hasInsufficient = riskFlags.some(f => f.risk_type === 'INSUFFICIENT_DATA');
  if (hasInsufficient) return 'INSUFFICIENT DATA';

  if (riskFlags.length > 0) return 'REQUIRES HUMAN REVIEW';

  return 'NO MISMATCH';
}
