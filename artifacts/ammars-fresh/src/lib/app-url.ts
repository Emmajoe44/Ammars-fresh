/** Canonical public URL for the app (upload callbacks, metadata, Open Graph). */
export function getAppUrl(): string {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;

  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}

export function isProductionDeploy(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}
