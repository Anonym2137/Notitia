import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a cookie-free Supabase client for use inside cached functions
 * (e.g. unstable_cache). This client cannot access auth state via cookies,
 * but can run public read queries. Pass user IDs explicitly if needed.
 */
export function createStaticClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
