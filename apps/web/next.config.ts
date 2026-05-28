import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ludoproof/shared"],
  // Lint and type-check are run separately in dev/CI; skip in the prod build
  // so deploys aren't blocked by warnings.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

export default nextConfig;
