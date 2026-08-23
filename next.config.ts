import type { NextConfig } from "next";

// GitHub Pages serves this repo at /clean-grid-uk/, not the domain root — GITHUB_ACTIONS
// is set automatically by GitHub's CI runner, so `npm run dev` locally is unaffected.
const isGithubPages = process.env.GITHUB_ACTIONS === "true";
const repoBasePath = "/clean-grid-uk";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGithubPages ? repoBasePath : undefined,
  assetPrefix: isGithubPages ? repoBasePath : undefined,
};

export default nextConfig;
