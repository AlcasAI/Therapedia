/** @type {import('next').NextConfig} */

// basePath/export are enabled only for the GitHub Pages build (set in the
// deploy workflow). Local dev and Vercel keep the default server behaviour at
// the root path, so nothing changes for those targets.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const isStaticExport = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  ...(isStaticExport && {
    output: "export",
    images: { unoptimized: true },
  }),
  ...(basePath && { basePath, assetPrefix: basePath }),
};

module.exports = nextConfig;
