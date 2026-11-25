import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicantInput {
  applicant_id: string;
  name: string;
  monthly_income: number;
  monthly_debt: number;
  credit_score: number;
  loan_amount: number;
  employment: string;
  income_proof: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { applicants, model = "gemini-1.5-pro" } = await req.json();

    if (!applicants || !Array.isArray(applicants) || applicants.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid input: applicants array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    // Process each applicant
    const results = [];

    for (const applicant of applicants) {
      const dti = applicant.monthly_income > 0 
        ? ((applicant.monthly_debt / applicant.monthly_income) * 100).toFixed(2)
        : "0.00";

      let aiEvaluation;

      if (GEMINI_API_KEY) {
        // Construct prompt for Gemini
        const prompt = `You are the AI Underwriting Evaluator for TrustTrack Loan Decision Platform.
Evaluate this loan application objectively:
- Applicant ID: ${applicant.applicant_id}
- Full Name: ${applicant.name}
- Loan Amount: ₹${applicant.loan_amount}
- Monthly Income: ₹${applicant.monthly_income}
- Monthly Debt: ₹${applicant.monthly_debt}
- Debt-to-Income (DTI): ${dti}%
- Credit Score: ${applicant.credit_score}
- Employment: ${applicant.employment}
- Income Proof: ${applicant.income_proof}

Return ONLY valid JSON matching this exact structure:
{
  "recommendation": "Recommended" | "Not Recommended" | "Needs More Information" | "Inconclusive",
  "confidence_score": number between 0 and 100,
  "explanation": "Detailed professional banking underwriting reasoning",
  "positive_factors": ["list of positive aspects"],
  "risk_factors": ["list of risk flags or vulnerabilities"],
  "missing_information": ["list of missing data items"],
  "additional_verification_requirements": ["list of required steps"]
}`;

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
              }
            })
          }
        );

        const geminiData = await geminiResponse.json();
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        aiEvaluation = JSON.parse(responseText);
      } else {
        // Deterministic Fallback if Gemini key is not configured in environment
        const isIncomeProofAvailable = applicant.income_proof?.toLowerCase().includes("avail");
        const numDti = parseFloat(dti);

        if (!isIncomeProofAvailable) {
          aiEvaluation = {
            recommendation: "Needs More Information",
            confidence_score: 65,
            explanation: `Income proof is unverified or missing for ${applicant.name}. Audited documents are required.`,
            positive_factors: [`Credit score: ${applicant.credit_score}`],
            risk_factors: ["Missing verifiable proof of income"],
            missing_information: ["Recent 3-month salary slips or Form 16 / ITR filing"],
            additional_verification_requirements: ["Obtain signed employer verification certificate"]
          };
        } else if (applicant.credit_score >= 650 && numDti <= 35 && applicant.monthly_income >= 40000) {
          aiEvaluation = {
            recommendation: "Recommended",
            confidence_score: 92,
            explanation: `The applicant has a monthly income of ₹${applicant.monthly_income.toLocaleString()}, a credit score of ${applicant.credit_score}, and a debt-to-income ratio of ${dti}%. Financial parameters meet illustrative institutional criteria.`,
            positive_factors: [
              `Solid disposable income: ₹${applicant.monthly_income}`,
              `Credit score ${applicant.credit_score} satisfies threshold`,
              `Prudent debt ratio (${dti}%)`
            ],
            risk_factors: ["Standard credit risk exposure"],
            missing_information: [],
            additional_verification_requirements: ["Geo-tagged residence verification"]
          };
        } else {
          aiEvaluation = {
            recommendation: "Not Recommended",
            confidence_score: 88,
            explanation: `The application falls outside illustrative underwriting tolerances. DTI is ${dti}% (max 35%) and Credit Score is ${applicant.credit_score} (min 650).`,
            positive_factors: [],
            risk_factors: [
              applicant.credit_score < 650 ? `Subprime credit score of ${applicant.credit_score}` : null,
              numDti > 35 ? `High debt burden (${dti}%)` : null,
              applicant.monthly_income < 40000 ? `Income below ₹40,000 threshold` : null
            ].filter(Boolean),
            missing_information: [],
            additional_verification_requirements: ["Co-applicant introduction or collateral pledge"]
          };
        }
      }

      results.push({
        applicant_id: applicant.applicant_id,
        applicant_name: applicant.name,
        loan_amount: applicant.loan_amount,
        monthly_income: applicant.monthly_income,
        monthly_debt: applicant.monthly_debt,
        credit_score: applicant.credit_score,
        employment: applicant.employment,
        income_proof: applicant.income_proof,
        dti_ratio: dti,
        model_name: model,
        model_version: `${model}-002`,
        is_demo_fallback: !GEMINI_API_KEY,
        ...aiEvaluation
      });
    }

    return new Response(JSON.stringify({ success: true, evaluations: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
