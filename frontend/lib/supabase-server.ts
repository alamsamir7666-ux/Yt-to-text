import { createClient } from "@supabase/supabase-js";

// Service role — only use server-side, never expose to client
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
