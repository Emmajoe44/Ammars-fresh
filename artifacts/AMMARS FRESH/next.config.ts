import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

// BASE_PATH of "/" (the default) means no basePath.
const rawBasePath = process.env.BASE_PATH?.replace(/\/$/, "") ?? "";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  ...(rawBasePath ? { basePath: rawBasePath } : {}),
  // Pin the monorepo root so Next doesn't infer it from stray lockfiles
  // elsewhere on the machine.
  turbopack: { root: workspaceRoot },
  outputFileTracingRoot: workspaceRoot,
  outputFileTracingExcludes: {
    "*": [
      "../../artifacts/agri-market-mobile/**",
      "../../artifacts/mockup-sandbox/**",
      "../../scripts/**",
      "../../docker-compose.yml",
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@radix-ui/react-icons"],
  },
  transpilePackages: [
    "@workspace/api-client-react",
    "@workspace/object-storage-web",
    "@workspace/db",
    "@workspace/api-zod",
  ],
  serverExternalPackages: ["pg", "@google-cloud/storage", "@vercel/blob"],
};

export default nextConfig;
