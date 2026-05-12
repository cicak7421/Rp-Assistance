// lib/supabase.js
// Supabase client — gunakan service_role key (server-side only)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.SUPABASE_URL;
const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY; // JANGAN expose ke client

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

// Singleton — reuse connection di serverless environment
let _client;
export function getSupabase() {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return _client;
}
