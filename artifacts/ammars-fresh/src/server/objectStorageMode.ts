export function usesLocalObjectStorage(): boolean {
  if (process.env.USE_LOCAL_OBJECT_STORAGE === "false") return false;
  // Serverless: ephemeral filesystem — use Vercel Blob or GCS instead.
  if (process.env.VERCEL) return false;
  return !process.env.PRIVATE_OBJECT_DIR;
}

export function usesBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
