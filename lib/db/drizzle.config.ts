import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Run `pnpm db:push` from the repo root (loads artifacts/AMMARS FRESH/.env).",
  );
}

export default defineConfig({
  // Forward slashes required: drizzle-kit treats this as a glob, which
  // doesn't match Windows backslash paths.
  schema: path.join(__dirname, "./src/schema/index.ts").replace(/\\/g, "/"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
