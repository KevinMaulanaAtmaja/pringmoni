import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    resolveAlias: {
      "@prisma/client": "@prisma/client",
    },
  },
};

export default nextConfig;
