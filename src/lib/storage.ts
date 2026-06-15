// =============================================================================
// Client-side localStorage helpers.
//
// Used for data that is intentionally device-local in this MVP:
//   - favorites
//   - the local physician profile (mock mode)
//   - submitted contact requests (mock mode)
//   - admin protocol overrides (mock mode CRUD persistence)
//
// All functions are SSR-safe: they no-op / return defaults when `window` is
// not available.
// =============================================================================

import type { ContactRequest, Protocol, UserProfile } from "@/lib/types";

const KEYS = {
  favorites: "cph.favorites",
  profile: "cph.profile",
  requests: "cph.contactRequests",
  protocolOverrides: "cph.protocolOverrides",
} as const;

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — ignore in MVP */
  }
}

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export function getFavorites(): string[] {
  return read<string[]>(KEYS.favorites, []);
}

export function isFavorite(protocolId: string): boolean {
  return getFavorites().includes(protocolId);
}

export function toggleFavorite(protocolId: string): string[] {
  const current = getFavorites();
  const next = current.includes(protocolId)
    ? current.filter((id) => id !== protocolId)
    : [...current, protocolId];
  write(KEYS.favorites, next);
  return next;
}

// ---------------------------------------------------------------------------
// Profile (mock mode)
// ---------------------------------------------------------------------------

export function getStoredProfile(): UserProfile | null {
  return read<UserProfile | null>(KEYS.profile, null);
}

export function saveStoredProfile(profile: UserProfile): void {
  write(KEYS.profile, profile);
}

// ---------------------------------------------------------------------------
// Contact requests (mock mode)
// ---------------------------------------------------------------------------

export function getStoredRequests(): ContactRequest[] {
  return read<ContactRequest[]>(KEYS.requests, []);
}

export function addStoredRequest(request: ContactRequest): void {
  write(KEYS.requests, [request, ...getStoredRequests()]);
}

// ---------------------------------------------------------------------------
// Admin protocol overrides (mock mode CRUD persistence)
//
// Stored as a map keyed by protocol id. An entry replaces the base mock
// protocol of the same id, or adds a brand-new one. Archiving is represented
// by status: "archived".
// ---------------------------------------------------------------------------

export function getProtocolOverrides(): Record<string, Protocol> {
  return read<Record<string, Protocol>>(KEYS.protocolOverrides, {});
}

export function saveProtocolOverride(protocol: Protocol): void {
  const all = getProtocolOverrides();
  all[protocol.id] = protocol;
  write(KEYS.protocolOverrides, all);
}
