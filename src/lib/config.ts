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
