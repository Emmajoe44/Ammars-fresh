export type LocalObjectSaveFn = (
  relativePath: string,
  data: Buffer,
  contentType: string,
) => void;

export type LocalObjectDownloadFn = (objectPath: string) => Response;

let saveFn: LocalObjectSaveFn | null = null;
let downloadFn: LocalObjectDownloadFn | null = null;

export function registerLocalObjectHandlers(handlers: {
  save: LocalObjectSaveFn;
  download: LocalObjectDownloadFn;
}): void {
  saveFn = handlers.save;
  downloadFn = handlers.download;
}

export function saveLocalObjectViaRegistry(
  relativePath: string,
  data: Buffer,
  contentType: string,
): void {
  if (!saveFn) {
    throw new Error("Local object storage is not configured on this runtime");
  }
  saveFn(relativePath, data, contentType);
}

export function downloadLocalObjectViaRegistry(objectPath: string): Response {
  if (!downloadFn) {
    throw new Error("Local object storage is not configured on this runtime");
  }
  return downloadFn(objectPath);
}
