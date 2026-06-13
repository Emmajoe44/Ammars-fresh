import { getAppUrl } from "@/lib/app-url";

export function getLocalUploadUrl(relativePath: string): string {
  return `${getAppUrl()}/api/storage/uploads/put/${relativePath}`;
}

export function getBlobUploadUrl(relativePath: string): string {
  return getLocalUploadUrl(relativePath);
}

export function objectPathFromLocalUploadUrl(uploadUrl: string): string | null {
  try {
    const url = new URL(uploadUrl);
    const marker = "/api/storage/uploads/put/";
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const relative = url.pathname.slice(idx + marker.length);
    return `/objects/${relative}`;
  } catch {
    if (uploadUrl.includes("/api/storage/uploads/put/")) {
      const relative = uploadUrl.split("/api/storage/uploads/put/")[1];
      return relative ? `/objects/${relative}` : null;
    }
    return null;
  }
}
