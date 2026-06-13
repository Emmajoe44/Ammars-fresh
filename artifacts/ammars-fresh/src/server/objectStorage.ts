import { randomUUID } from "crypto";
import type { File } from "@google-cloud/storage";
import { ObjectNotFoundError } from "./objectErrors";
import { usesLocalObjectStorage, usesBlobStorage } from "./objectStorageMode";
import {
  getLocalUploadUrl,
  getBlobUploadUrl,
  objectPathFromLocalUploadUrl,
} from "./objectStorageUrls";
import { downloadBlobObject } from "./blobObjectStorage";
import { downloadLocalObjectViaRegistry } from "./localObjectRegistry";

export { ObjectNotFoundError } from "./objectErrors";

/** Blob/local storage service — no GCS imports (safe for Vercel serverless bundles). */
export class ObjectStorageService {
  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    const relativePath = `uploads/${objectId}`;

    if (usesLocalObjectStorage()) {
      return getLocalUploadUrl(relativePath);
    }

    if (usesBlobStorage()) {
      return getBlobUploadUrl(relativePath);
    }

    const { getGcsObjectStorageService } = await import("./objectStorageGcs");
    return getGcsObjectStorageService().getObjectEntityUploadURL(relativePath);
  }

  normalizeObjectEntityPath(rawPath: string): string {
    const localPath = objectPathFromLocalUploadUrl(rawPath);
    if (localPath) return localPath;

    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      if (rawPath.startsWith("/objects/")) return rawPath;
      return rawPath;
    }

    if (usesBlobStorage() || usesLocalObjectStorage()) {
      return rawPath;
    }

    // GCS signed URL normalization is handled by the GCS module at runtime.
    return rawPath;
  }

  async downloadObjectEntity(objectPath: string, cacheTtlSec: number = 3600): Promise<Response> {
    if (usesLocalObjectStorage()) {
      return await downloadLocalObjectViaRegistry(objectPath);
    }
    if (usesBlobStorage()) {
      return downloadBlobObject(objectPath);
    }

    const { getGcsObjectStorageService } = await import("./objectStorageGcs");
    return getGcsObjectStorageService().downloadObjectEntity(objectPath, cacheTtlSec);
  }

  async searchPublicObject(filePath: string) {
    const { getGcsObjectStorageService } = await import("./objectStorageGcs");
    return getGcsObjectStorageService().searchPublicObject(filePath);
  }

  async downloadObject(file: File, cacheTtlSec: number = 3600): Promise<Response> {
    const { getGcsObjectStorageService } = await import("./objectStorageGcs");
    return getGcsObjectStorageService().downloadObject(file, cacheTtlSec);
  }
}
