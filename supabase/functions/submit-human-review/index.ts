import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { 
      case_id, 
      application_id, 
      reviewer_id, 
      reviewer_name, 
      action_type, 
      human_finding, 
      mandatory_rationale, 
      evidence_references, 
      original_ai_recommendation 
    } = await req.json();

    // 1. Mandatory Rationale check
    if (!mandatory_rationale || mandatory_rationale.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Mandatory rationale cannot be empty. Human reviewers must state an explicit justification." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map action to resulting status
    let updatedStatus = "Resolved";
    switch (action_type) {
      case "CONFIRM_AI":
        updatedStatus = "Confirmed";
        break;
      case "OVERRIDE_AI":
        updatedStatus = "Overridden";
        break;
      case "REQUEST_EVIDENCE":
        updatedStatus = "Evidence Requested";
        break;
      case "PLACE_ON_HOLD":
        updatedStatus = "On Hold";
        break;
      case "MARK_INCONCLUSIVE":
        updatedStatus = "Inconclusive";
        break;
    }

    const reviewActionRecord = {
      id: `act_${Date.now()}`,
      case_id,
      application_id,
      reviewer_id,
      reviewer_name,
      action_type,
      human_finding,
      mandatory_rationale: mandatory_rationale.trim(),
      evidence_references: evidence_references || [],
      original_ai_recommendation, // NEVER overwritten!
      created_at: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      success: true,
      actionRecord: reviewActionRecord,
      newCaseStatus: updatedStatus
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
