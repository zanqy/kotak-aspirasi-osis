import { createServerClient } from "@supabase/ssr";

export function createServerSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() {
          // Server-side: cookies not available in this context
          return "";
        },
        set() {},
        remove() {},
      },
    }
  );
}