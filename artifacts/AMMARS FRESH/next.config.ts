import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

// BASE_PATH of "/" (the default) means no basePath.
const rawBasePath = process.env.BASE_PATH?.replace(/\/$/, "") ?? "";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appDir = path.dirname(fileURLToPath(import.meta.url));
const localObjectStorageStub = path.join(appDir, "src/server/localObjectStorage.stub.ts");

const vercelStorageAliases: Record<string, string> | undefined = process.env.VERCEL
  ? {
      "@/server/localObjectStorage": "./src/server/localObjectStorage.stub.ts",
      "./localObjectStorage": "./src/server/localObjectStorage.stub.ts",
    }
  : undefined;

const nextConfig: NextConfig = {
  ...(rawBasePath ? { basePath: rawBasePath } : {}),
  // Pin the monorepo root so Next doesn't infer it from stray lockfiles
  // elsewhere on the machine.
  turbopack: {
    root: workspaceRoot,
    ...(vercelStorageAliases ? { resolveAlias: vercelStorageAliases } : {}),
  },
  outputFileTracingRoot: workspaceRoot,
  outputFileTracingExcludes: {
    "*": [
      "../../artifacts/agri-market-mobile/**",
      "../../artifacts/AMMARS FRESH-mobile/**",
      "../../artifacts/mockup-sandbox/**",
      "../../artifacts/AMMARS FRESH/.local-storage/**",
      "../../scripts/**",
      "../../docker-compose.yml",
    ],
  },
  webpack(config) {
    if (process.env.VERCEL) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@/server/localObjectStorage": localObjectStorageStub,
        [path.join(appDir, "src/server/localObjectStorage")]: localObjectStorageStub,
        [path.join(appDir, "src/server/localObjectStorage.ts")]: localObjectStorageStub,
      };
    }
    return config;
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
