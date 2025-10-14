import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "react-hook-form",
      "zod",
    ],
  },
};

export default nextConfig;
