import { createBrowserClient } from "@supabase/ssr";

function getPublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getPublishableKey());
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getPublishableKey()
  );
}

/** @deprecated Prefer createClient() */
export async function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  return createClient();
}
