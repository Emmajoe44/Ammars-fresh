export type LocalObjectSaveFn = (
  relativePath: string,
  data: Buffer,
  contentType: string,
) => void;

export type LocalObjectDownloadFn = (objectPath: string) => Response;

let saveFn: LocalObjectSaveFn | null = null;
let downloadFn: LocalObjectDownloadFn | null = null;
let initPromise: Promise<void> | null = null;

async function ensureLocalHandlers(): Promise<void> {
  if (process.env.VERCEL || saveFn) return;
  if (!initPromise) {
    initPromise = (async () => {
      const { usesLocalObjectStorage } = await import("./objectStorageMode");
      if (!usesLocalObjectStorage()) return;
      const { saveLocalObject, downloadLocalObject } = await import(
        "./localObjectStorage"
      );
      saveFn = saveLocalObject;
      downloadFn = downloadLocalObject;
    })();
  }
  await initPromise;
}

export async function saveLocalObjectViaRegistry(
  relativePath: string,
  data: Buffer,
  contentType: string,
): Promise<void> {
  await ensureLocalHandlers();
  if (!saveFn) {
    throw new Error("Local object storage is not configured on this runtime");
  }
  saveFn(relativePath, data, contentType);
}

export async function downloadLocalObjectViaRegistry(
  objectPath: string,
): Promise<Response> {
  await ensureLocalHandlers();
  if (!downloadFn) {
    throw new Error("Local object storage is not configured on this runtime");
  }
  return downloadFn(objectPath);
}
