import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Skip ESLint during "next build" so deployments aren't blocked by lint errors
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: [
      "react-hook-form",
      "zod",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
