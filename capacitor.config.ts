import type { CapacitorConfig } from "@capacitor/cli";

// =============================================================================
// Capacitor configuration — turns the PWA into a real Android/iOS app.
//
// Approach used here (fastest & most reliable): the native app loads the live
// deployed PWA over HTTPS. You get a real, installable app that always shows
// the latest version, with zero code changes.
//
// 1. Deploy the web app first (see README → Deployment, e.g. Vercel).
// 2. Put your HTTPS URL below, or export CAP_SERVER_URL in your shell.
// 3. Follow MOBILE.md to generate and build the Android/iOS projects.
//
// For a fully OFFLINE bundled app instead, see MOBILE.md → "Approach B".
// =============================================================================

// 👉 EDIT THIS: your deployed URL, e.g. "https://clinical-protocol-hub.vercel.app"
const SERVER_URL =
  process.env.CAP_SERVER_URL || "https://REPLACE-WITH-YOUR-DEPLOYED-URL";

const usingRemote = !SERVER_URL.includes("REPLACE-WITH");

const config: CapacitorConfig = {
  appId: "com.therapedia.protocols",
  appName: "Clinical Protocol Hub",
  // Minimal local fallback shown if the remote URL is not set / unreachable.
  webDir: "capacitor-shell",
  server: usingRemote
    ? { url: SERVER_URL, androidScheme: "https" }
    : undefined,
};

export default config;
