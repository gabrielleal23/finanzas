import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export async function ensureDefaultProfiles(supabase: SupabaseClient<Database>) {
  await supabase.rpc("ensure_default_profiles");
}
