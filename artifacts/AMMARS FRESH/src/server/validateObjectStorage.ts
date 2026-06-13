import { usesLocalObjectStorage } from "./localObjectStorage";
import { usesBlobStorage } from "./blobObjectStorage";

export function validateObjectStorageConfig(): void {
  if (usesLocalObjectStorage()) {
    console.log(
      "[storage] Using local filesystem (.local-storage/). " +
        "Set PRIVATE_OBJECT_DIR + GOOGLE_APPLICATION_CREDENTIALS for GCS.",
    );
    return;
  }

  if (usesBlobStorage()) {
    console.log("[storage] Using Vercel Blob (BLOB_READ_WRITE_TOKEN).");
    return;
  }

  if (process.env.VERCEL) {
    console.warn(
      "[storage] On Vercel without Blob or GCS — image uploads will fail. " +
        "Add Vercel Blob (Storage → Blob) or configure GCS env vars.",
    );
    return;
  }

  const missing: string[] = [];
  if (!process.env.PRIVATE_OBJECT_DIR) missing.push("PRIVATE_OBJECT_DIR");
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    missing.push("GOOGLE_APPLICATION_CREDENTIALS");
  }

  if (missing.length) {
    console.warn(
      `[storage] GCS mode incomplete — missing: ${missing.join(", ")}. ` +
        "Uploads may fail until these are set.",
    );
    return;
  }

  console.log(
    `[storage] Using Google Cloud Storage (bucket prefix: ${process.env.PRIVATE_OBJECT_DIR}).`,
  );
}
