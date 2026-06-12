import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@radix-ui/react-*", "lucide-react"],
  },
  // Force cache invalidation - 2026-06-13T03:58:00Z
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  },
};

export default nextConfig;
