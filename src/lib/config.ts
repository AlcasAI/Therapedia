// App-level feature flags / configuration.

/**
 * Whether the /admin area is exposed. In this MVP admin access is a simple
 * flag, NOT real authentication (see README roadmap → "full authentication").
 * Enabled by default in development for convenience.
 */
export function isAdminEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_ENABLE_ADMIN;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export const APP_NAME = "Clinical Protocol Hub";
export const APP_SHORT_NAME = "Protocols";

/**
 * Base path the app is served from. Empty for local dev / Vercel (root), and
 * set to "/<repo>" for GitHub Pages project sites (configured at build time via
 * NEXT_PUBLIC_BASE_PATH). next/link prefixes this automatically, but RAW asset
 * URLs (PDFs, icons, manifest, service worker) must use `asset()` below.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a same-origin absolute path with BASE_PATH. External URLs pass through. */
export function asset(path: string): string {
  if (/^https?:\/\//.test(path) || path.startsWith("mailto:") || path.startsWith("tel:")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalized}`;
}
