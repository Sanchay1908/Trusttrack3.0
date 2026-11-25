import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage keys for robust offline persistence & zero-config local development
export const STORAGE_KEYS = {
  APPLICATIONS: 'trusttrack_applications_v1',
  AI_DECISIONS: 'trusttrack_ai_decisions_v1',
  POLICIES: 'trusttrack_policies_v1',
  POLICY_VERSIONS: 'trusttrack_policy_versions_v1',
  POLICY_RESULTS: 'trusttrack_policy_results_v1',
  RISK_FLAGS: 'trusttrack_risk_flags_v1',
  HUMAN_REVIEWS: 'trusttrack_human_reviews_v1',
  REVIEW_ACTIONS: 'trusttrack_review_actions_v1',
  AUDIT_EVENTS: 'trusttrack_audit_events_v1',
  NOTIFICATIONS: 'trusttrack_notifications_v1',
  CURRENT_USER: 'trusttrack_current_user_v1',
  GEMINI_API_KEY: 'trusttrack_gemini_api_key_v1'
};
