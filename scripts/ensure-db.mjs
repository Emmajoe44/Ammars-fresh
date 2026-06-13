import fs from "node:fs";
import net from "node:net";
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

loadEnvFile(path.join(repoRoot, "artifacts", "ammars-fresh", ".env"));

function parsePort(url) {
  try {
    const u = new URL(url);
    return Number(u.port || 5432);
  } catch {
    return 5433;
  }
}

function portOpen(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host }, () => {
      socket.end();
      resolve(true);
    });
    socket.setTimeout(1500);
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function hasDocker() {
  const r = spawnSync("docker", ["compose", "version"], { shell: true, stdio: "ignore" });
  return r.status === 0;
}

async function main() {
  const url = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5433/agrimarket";
  const port = parsePort(url);

  const fallbackPort = port === 5433 ? 5432 : null;
  if (await portOpen(port)) {
    console.log(`Database port ${port} is reachable.`);
    return;
  }
  if (fallbackPort && (await portOpen(fallbackPort))) {
    console.warn(
      `PostgreSQL is on port ${fallbackPort} but DATABASE_URL uses ${port}.`,
    );
    console.warn(
      `Update artifacts/ammars-fresh/.env to: postgres://postgres:postgres@localhost:${fallbackPort}/agrimarket`,
    );
    return;
  }

  console.warn(`PostgreSQL is not listening on port ${port}.`);

  if (hasDocker()) {
    console.log("Starting Docker Postgres (docker compose up -d)...");
    const up = spawnSync("docker", ["compose", "up", "-d"], { cwd: repoRoot, stdio: "inherit", shell: true });
    if (up.status === 0) {
      for (let i = 0; i < 20; i++) {
        if (await portOpen(port)) {
          console.log("Docker Postgres is ready.");
          return;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  console.error(`
Cannot connect to PostgreSQL on port ${port}.

Fix options:
  1. Docker:  install Docker Desktop, then run  pnpm db:up
  2. Native:  install PostgreSQL 17, start the service, create database "agrimarket",
              then set DATABASE_URL in artifacts/ammars-fresh/.env
  3. Schema:  after Postgres is running, run  pnpm db:push

Default URL: postgres://postgres:postgres@localhost:5433/agrimarket
`);
  process.exit(1);
}

await main();
