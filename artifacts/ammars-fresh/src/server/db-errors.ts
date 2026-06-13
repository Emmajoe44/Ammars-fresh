export function isDbConnectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (code === "ECONNREFUSED" || code === "ECONNRESET" || code === "ETIMEDOUT" || code === "ENOTFOUND") {
    return true;
  }
  const cause = (err as { cause?: unknown }).cause;
  if (cause && cause !== err) return isDbConnectionError(cause);
  if (Array.isArray((cause as { errors?: unknown[] })?.errors)) {
    return (cause as { errors: unknown[] }).errors.some(isDbConnectionError);
  }
  const message = String((err as { message?: string }).message ?? "");
  return /ECONNREFUSED|ECONNRESET|connection terminated|Failed query/i.test(message);
}

export function dbUnavailableResponse() {
  return Response.json(
    {
      error:
        "Database is not available. Start PostgreSQL (pnpm db:up) and ensure DATABASE_URL in artifacts/ammars-fresh/.env is correct.",
    },
    { status: 503 },
  );
}
