import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { transcript, userRole = "reviewer", stats } = await req.json();

    if (!transcript) {
      return new Response(JSON.stringify({ error: "Voice transcript input is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const lower = transcript.toLowerCase();
    let responseText = "";
    let intentIdentified = "GENERAL_QUERY";
    let actionTaken = undefined;

    if (lower.includes("analyse") || lower.includes("analyze") || lower.includes("evaluate")) {
      intentIdentified = "NAVIGATE_WORKSPACE";
      responseText = "Opening the AI Workspace. You can paste multiple applicant profiles to run an automated policy and Gemini evaluation.";
      actionTaken = "NAVIGATE_TO_WORKSPACE";
    } else if (lower.includes("how many") || lower.includes("flagged") || lower.includes("risk alert")) {
      intentIdentified = "QUERY_FLAGGED_COUNT";
      const count = stats?.flaggedApplications ?? 6;
      responseText = `Currently, there are ${count} loan applications flagged with risk alerts in TrustTrack requiring review.`;
    } else if (lower.includes("pending") || lower.includes("human review") || lower.includes("review queue")) {
      intentIdentified = "QUERY_PENDING_REVIEWS";
      const count = stats?.pendingReviews ?? 5;
      responseText = `There are ${count} human review cases currently pending action on the credit underwriting desk.`;
      actionTaken = "NAVIGATE_TO_REVIEWS";
    } else if (lower.includes("decision log") || lower.includes("today's") || lower.includes("show applications")) {
      intentIdentified = "QUERY_APPLICATIONS";
      responseText = "Navigating to the AI Decision Log. All processed loan applications and original recommendations are listed.";
      actionTaken = "NAVIGATE_TO_DECISION_LOG";
    } else if (lower.includes("audit report") || lower.includes("pdf")) {
      intentIdentified = "GENERATE_AUDIT_REPORT";
      responseText = "Opening the Audit Reports engine. You can inspect complete hash-chained event logs and generate certified PDF reports.";
      actionTaken = "NAVIGATE_TO_AUDIT";
    } else if (lower.includes("policy") || lower.includes("threshold")) {
      intentIdentified = "QUERY_POLICIES";
      if (userRole === "admin") {
        responseText = "Opening Loan Policy Management. You can configure minimum income, maximum DTI, and credit score thresholds.";
        actionTaken = "NAVIGATE_TO_POLICIES";
      } else {
        responseText = "Viewing current loan policies. As a Human Reviewer, you can inspect policy parameters. Administrative privilege is required to modify them.";
        actionTaken = "NAVIGATE_TO_POLICIES";
      }
    } else {
      intentIdentified = "ASSISTANT_HELP";
      responseText = "I can assist you with loan monitoring. Try asking: 'Show pending human reviews', 'How many applications are flagged?', 'Analyse loan applications', or 'Generate an audit report'.";
    }

    return new Response(JSON.stringify({
      success: true,
      transcript_in: transcript,
      response_text: responseText,
      intent_identified: intentIdentified,
      action_taken: actionTaken
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
