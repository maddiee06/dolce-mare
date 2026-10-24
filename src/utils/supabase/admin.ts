import { createClient } from "@supabase/supabase-js";

/** SOLO para código de servidor. Salta RLS: nunca importarlo desde un componente "use client". */
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );