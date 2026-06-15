import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True when both Supabase env vars are present. The data layer uses this to
 * decide between Supabase mode and mock mode. The app never blocks when these
 * are missing — it simply falls back to local mock data.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

let cached: SupabaseClient<Database> | null = null;

/**
 * Returns a singleton Supabase client, or null when not configured.
 * Safe to call on both server and client (anon key only).
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createClient<Database>(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return cached;
}
