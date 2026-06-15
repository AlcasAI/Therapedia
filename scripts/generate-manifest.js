// Generates public/manifest.webmanifest with paths prefixed by the deploy base
// path. Runs automatically before `dev` and `build` (see package.json), reading
// NEXT_PUBLIC_BASE_PATH:
//   - unset / empty  → root paths (local dev, Vercel)
//   - "/therapedia"  → subdirectory paths (GitHub Pages project site)
const fs = require("fs");
const path = require("path");

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const p = (rel) => `${base}${rel}`;

const manifest = {
  name: "Clinical Protocol Hub",
  short_name: "Protocols",
  description:
    "Mobile reference library of clinical protocols for healthcare professionals.",
  start_url: `${base}/`,
  scope: `${base}/`,
  display: "standalone",
  orientation: "portrait",
  background_color: "#f8fafc",
  theme_color: "#256d70",
  categories: ["medical", "productivity", "reference"],
  icons: [
    { src: p("/icons/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
    { src: p("/icons/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
    { src: p("/icons/maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

const out = path.join(__dirname, "..", "public", "manifest.webmanifest");
fs.writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote public/manifest.webmanifest (base="${base || "/"}")`);
