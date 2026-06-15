// =============================================================================
// Data-access abstraction (the single source of truth for the UI).
//
// The UI never imports mock data or the Supabase client directly — it calls
// these functions. Each function picks its backend at runtime:
//
//   - SUPABASE MODE  → when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are set.
//   - MOCK MODE      → otherwise (local TypeScript data + localStorage).
//
// All functions are async so swapping backends never changes call sites.
// =============================================================================

import {
  getSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import {
  mockCategories,
  mockContacts,
  mockProtocols,
} from "@/lib/data/mock-data";
import {
  addStoredRequest,
  getProtocolOverrides,
  saveProtocolOverride,
} from "@/lib/storage";
import type {
  Category,
  Contact,
  ContactRequest,
  Protocol,
  ProtocolInput,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

export function getDataMode(): "supabase" | "mock" {
  return isSupabaseConfigured() ? "supabase" : "mock";
}

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

/** Merge base mock protocols with any localStorage admin overrides. */
function resolveMockProtocols(): Protocol[] {
  const overrides = getProtocolOverrides();
  const byId = new Map<string, Protocol>();
  for (const p of mockProtocols) byId.set(p.id, p);
  for (const id of Object.keys(overrides)) byId.set(id, overrides[id]);
  return Array.from(byId.values());
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw error;
    return data ?? [];
  }
  return mockCategories;
}

// ---------------------------------------------------------------------------
// Protocols
// ---------------------------------------------------------------------------

export interface ProtocolQuery {
  /** Include archived/draft protocols (admin views). Default: published only. */
  includeAllStatuses?: boolean;
}

export async function getProtocols(
  query: ProtocolQuery = {}
): Promise<Protocol[]> {
  const { includeAllStatuses = false } = query;
  const supabase = getSupabaseClient();

  if (supabase) {
    let q = supabase.from("protocols").select("*");
    if (!includeAllStatuses) q = q.eq("status", "published");
    const { data, error } = await q.order("lastUpdated", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  const all = resolveMockProtocols().sort((a, b) =>
    b.lastUpdated.localeCompare(a.lastUpdated)
  );
  return includeAllStatuses
    ? all
    : all.filter((p) => p.status === "published");
}

export async function getProtocolBySlug(
  slug: string
): Promise<Protocol | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("protocols")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  }
  return resolveMockProtocols().find((p) => p.slug === slug) ?? null;
}

export async function getProtocolById(id: string): Promise<Protocol | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("protocols")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  }
  return resolveMockProtocols().find((p) => p.id === id) ?? null;
}

/**
 * Server-side search (prepared for Supabase mode). The protocols list page
 * uses client-side search for the MVP, but this is wired up so search can move
 * server-side without changing call sites.
 */
export async function searchProtocols(term: string): Promise<Protocol[]> {
  const trimmed = term.trim();
  const supabase = getSupabaseClient();

  if (supabase) {
    let q = supabase.from("protocols").select("*").eq("status", "published");
    if (trimmed) {
      // Match title/description; extend with full-text search as needed.
      q = q.or(`title.ilike.%${trimmed}%,description.ilike.%${trimmed}%`);
    }
    const { data, error } = await q.order("lastUpdated", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  const all = await getProtocols();
  if (!trimmed) return all;
  const needle = trimmed.toLowerCase();
  return all.filter((p) =>
    [p.title, p.description, p.categoryName, p.author, p.reviewer, ...p.tags]
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
}

/** Protocols in the same category, excluding the given one. */
export async function getRelatedProtocols(
  protocol: Protocol,
  limit = 4
): Promise<Protocol[]> {
  const all = await getProtocols();
  return all
    .filter(
      (p) => p.categoryId === protocol.categoryId && p.id !== protocol.id
    )
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Admin: create / edit / archive
// ---------------------------------------------------------------------------

export async function createProtocol(input: ProtocolInput): Promise<Protocol> {
  const protocol: Protocol = {
    ...input,
    id: generateId("prot"),
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("protocols").insert(protocol);
    if (error) throw error;
    return protocol;
  }
  saveProtocolOverride(protocol);
  return protocol;
}

export async function updateProtocol(
  id: string,
  input: ProtocolInput
): Promise<Protocol> {
  const existing = await getProtocolById(id);
  const protocol: Protocol = {
    ...input,
    id,
    createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
  };
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from("protocols")
      .update(protocol)
      .eq("id", id);
    if (error) throw error;
    return protocol;
  }
  saveProtocolOverride(protocol);
  return protocol;
}

export async function archiveProtocol(id: string): Promise<void> {
  const existing = await getProtocolById(id);
  if (!existing) return;
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from("protocols")
      .update({ status: "archived" })
      .eq("id", id);
    if (error) throw error;
    return;
  }
  saveProtocolOverride({ ...existing, status: "archived" });
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export async function getContacts(): Promise<Contact[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("name");
    if (error) throw error;
    return data ?? [];
  }
  return mockContacts;
}

// ---------------------------------------------------------------------------
// Contact requests
// ---------------------------------------------------------------------------

export type ContactRequestInput = Omit<ContactRequest, "id" | "createdAt">;

export async function createContactRequest(
  input: ContactRequestInput
): Promise<ContactRequest> {
  const request: ContactRequest = {
    ...input,
    id: generateId("req"),
    createdAt: new Date().toISOString(),
  };
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("contact_requests").insert(request);
    if (error) throw error;
    return request;
  }
  addStoredRequest(request);
  return request;
}
