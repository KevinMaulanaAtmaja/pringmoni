import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    resolveAlias: {
      "@prisma/client": path.resolve(__dirname, "./prisma/generated/client/client"),
    },
  },
};

export default nextConfig;
