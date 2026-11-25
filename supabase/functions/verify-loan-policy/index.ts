import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { application, policies } = await req.json();
    if (!application || !policies) {
      return new Response(JSON.stringify({ error: "Application and policies required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const verificationResults = [];

    for (const policy of policies) {
      if (!policy.is_active) continue;

      let status = "PASSED";
      let explanation = "";
      let actualValue = "";

      switch (policy.policy_key) {
        case "min_monthly_income": {
          const threshold = parseFloat(policy.threshold_value);
          actualValue = `₹${application.monthly_income?.toLocaleString()}`;
          if (application.monthly_income === undefined || application.monthly_income === null) {
            status = "INSUFFICIENT DATA";
            explanation = "Monthly income is unstated in the applicant profile.";
          } else if (application.monthly_income >= threshold) {
            status = "PASSED";
            explanation = `Monthly income of ₹${application.monthly_income.toLocaleString()} meets or exceeds threshold of ₹${threshold.toLocaleString()}.`;
          } else {
            status = "FAILED";
            explanation = `Monthly income of ₹${application.monthly_income.toLocaleString()} is below threshold of ₹${threshold.toLocaleString()} by ₹${(threshold - application.monthly_income).toLocaleString()}.`;
          }
          break;
        }

        case "max_dti_ratio": {
          const threshold = parseFloat(policy.threshold_value);
          const dti = application.monthly_income > 0 
            ? (application.monthly_debt / application.monthly_income) * 100 
            : null;
          
          if (dti === null || application.monthly_debt === undefined) {
            actualValue = "Unstated";
            status = "INSUFFICIENT DATA";
            explanation = "Debt obligations are missing; cannot compute debt-to-income ratio accurately.";
          } else {
            actualValue = `${dti.toFixed(2)}%`;
            if (dti <= threshold) {
              status = "PASSED";
              explanation = `DTI ratio of ${dti.toFixed(2)}% is within configured maximum of ${threshold}%.`;
            } else {
              status = "FAILED";
              explanation = `DTI ratio of ${dti.toFixed(2)}% exceeds configured maximum limit of ${threshold}% by ${(dti - threshold).toFixed(2)}%.`;
            }
          }
          break;
        }

        case "min_credit_score": {
          const threshold = parseInt(policy.threshold_value, 10);
          actualValue = `${application.credit_score}`;
          if (!application.credit_score) {
            status = "INSUFFICIENT DATA";
            explanation = "Credit bureau score not provided.";
          } else if (application.credit_score >= threshold) {
            status = "PASSED";
            explanation = `Credit bureau score of ${application.credit_score} satisfies minimum threshold of ${threshold}.`;
          } else {
            status = "FAILED";
            explanation = `Credit score of ${application.credit_score} fails minimum requirement of ${threshold} by ${threshold - application.credit_score} points.`;
          }
          break;
        }

        case "income_proof_required": {
          actualValue = application.income_proof_status || "Missing";
          const isAvailable = actualValue.toLowerCase().includes("avail");
          if (isAvailable) {
            status = "PASSED";
            explanation = "Mandatory income proof documentation is submitted and verified.";
          } else if (actualValue === "Pending Verification") {
            status = "INSUFFICIENT DATA";
            explanation = "Income documents are currently undergoing employer verification.";
          } else {
            status = "FAILED";
            explanation = "Income proof is missing. Audited tax or salary slips required.";
          }
          break;
        }

        default:
          status = "PASSED";
          actualValue = "N/A";
          explanation = "Standard policy check satisfied.";
      }

      verificationResults.push({
        policy_id: policy.id,
        policy_key: policy.policy_key,
        policy_name: policy.policy_name,
        policy_version_used: policy.version_number || 1,
        configured_threshold: `${policy.operator} ${policy.threshold_value} ${policy.threshold_unit || ''}`.trim(),
        actual_applicant_value: actualValue,
        status,
        explanation
      });
    }

    return new Response(JSON.stringify({ success: true, results: verificationResults }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
