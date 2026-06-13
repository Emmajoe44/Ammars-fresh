import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

for (const file of [
  path.join(repoRoot, "artifacts", "ammars-fresh", ".env"),
  path.join(repoRoot, ".env"),
]) {
  loadEnvFile(file);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const artifactDir = path.join(repoRoot, "artifacts", "ammars-fresh");
const result = spawnSync("pnpm", ["exec", "tsx", "src/server/seed-cli.ts"], {
  cwd: artifactDir,
  env: process.env,
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
