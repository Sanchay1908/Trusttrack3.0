import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { aiDecision, verificationResults, application } = await req.json();

    const riskAlerts = [];
    const allPassed = verificationResults.every((r: any) => r.status === "PASSED");
    const failedChecks = verificationResults.filter((r: any) => r.status === "FAILED");
    const insufficientChecks = verificationResults.filter((r: any) => r.status === "INSUFFICIENT DATA");

    // Scenario 1: Potential AI-Policy Mismatch (AI says Not Recommended, but all policies pass)
    if (aiDecision.recommendation === "Not Recommended" && allPassed) {
      riskAlerts.push({
        risk_type: "POTENTIAL_AI_POLICY_MISMATCH",
        severity: "High",
        title: "Potential AI-Policy Mismatch Detected",
        description: `AI recommended rejection, yet applicant ${application.full_name} passes all configured numerical policies. Sent to Human Review to prevent unintended unfair rejection.`,
        policy_mismatch_details: `Applicant satisfies: ${verificationResults.map((v: any) => v.policy_name).join(", ")}. Model reasoning indicates potential hallucination or extraneous criteria.`
      });
    }

    // Scenario 4: AI Recommends but Policy Fails
    if (aiDecision.recommendation === "Recommended" && failedChecks.length > 0) {
      riskAlerts.push({
        risk_type: "AI_RECOMMENDS_POLICY_FAILS",
        severity: "High",
        title: "AI Recommendation Overlooks Policy Failures",
        description: `AI generated positive recommendation for ${application.full_name}, but applicant breached ${failedChecks.length} configured policy requirement(s). Immediate review required.`,
        policy_mismatch_details: failedChecks.map((f: any) => `${f.policy_name}: threshold is ${f.configured_threshold}, actual is ${f.actual_applicant_value}`).join("; ")
      });
    }

    // Scenario 2: Policy Failures
    if (failedChecks.length > 0 && aiDecision.recommendation !== "Recommended") {
      riskAlerts.push({
        risk_type: "POLICY_FAILURE",
        severity: failedChecks.length >= 2 ? "High" : "Medium",
        title: `Policy Failure: ${failedChecks.map((f: any) => f.policy_name).join(", ")}`,
        description: `Applicant failed ${failedChecks.length} configured institutional credit policy check(s).`,
        policy_mismatch_details: failedChecks.map((f: any) => f.explanation).join(" ")
      });
    }

    // Scenario 3: Insufficient Information
    if (insufficientChecks.length > 0) {
      riskAlerts.push({
        risk_type: "INSUFFICIENT_DATA",
        severity: "Medium",
        title: "Insufficient Data: Additional Verification Required",
        description: `Crucial financial details are missing: ${insufficientChecks.map((i: any) => i.policy_name).join(", ")}. Note: Missing information is not treated as automatic failure.`,
        policy_mismatch_details: "Request supplementary evidence from applicant."
      });
    }

    return new Response(JSON.stringify({ success: true, alerts: riskAlerts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
