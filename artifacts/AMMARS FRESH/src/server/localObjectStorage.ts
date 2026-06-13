import fs from "fs";
import path from "path";
import { getAppUrl } from "@/lib/app-url";
import { ObjectNotFoundError } from "./objectErrors";

export function usesLocalObjectStorage(): boolean {
  if (process.env.USE_LOCAL_OBJECT_STORAGE === "false") return false;
  // Serverless: ephemeral filesystem — use Vercel Blob or GCS instead.
  if (process.env.VERCEL) return false;
  return !process.env.PRIVATE_OBJECT_DIR;
}

export function getLocalStorageRoot(): string {
  const root =
    process.env.LOCAL_OBJECT_STORAGE_DIR ??
    path.join(/* turbopackIgnore: true */ process.cwd(), ".local-storage");
  fs.mkdirSync(root, { recursive: true });
  return root;
}

export function localPathFromObjectPath(objectPath: string): string | null {
  if (!objectPath.startsWith("/objects/")) return null;
  const relative = objectPath.slice("/objects/".length);
  return path.join(getLocalStorageRoot(), relative);
}

export function saveLocalObject(
  relativePath: string,
  data: Buffer,
  contentType: string,
): void {
  const filePath = path.join(getLocalStorageRoot(), relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, data);
  fs.writeFileSync(
    `${filePath}.meta.json`,
    JSON.stringify({ contentType }),
  );
}

export function downloadLocalObject(objectPath: string): Response {
  const filePath = localPathFromObjectPath(objectPath);
  if (!filePath || !fs.existsSync(filePath)) {
    throw new ObjectNotFoundError();
  }

  const data = fs.readFileSync(filePath);
  const metaPath = `${filePath}.meta.json`;
  let contentType = "application/octet-stream";
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
        contentType?: string;
      };
      contentType = meta.contentType ?? contentType;
    } catch {
      // ignore invalid metadata
    }
  }

  return new Response(data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
      "Content-Length": String(data.length),
    },
  });
}

export function getLocalUploadUrl(relativePath: string): string {
  return `${getAppUrl()}/api/storage/uploads/put/${relativePath}`;
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
