import { put, head } from "@vercel/blob";
import { getAppUrl } from "@/lib/app-url";

export function usesBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function getBlobUploadUrl(relativePath: string): string {
  return `${getAppUrl()}/api/storage/uploads/put/${relativePath}`;
}

function blobKey(relativePath: string): string {
  return relativePath.replace(/^\/+/, "");
}

export async function saveBlobObject(
  relativePath: string,
  data: Buffer,
  contentType: string,
): Promise<void> {
  await put(blobKey(relativePath), data, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
}

export async function downloadBlobObject(objectPath: string): Promise<Response> {
  const relative = objectPath.startsWith("/objects/")
    ? objectPath.slice("/objects/".length)
    : objectPath.replace(/^\/+/, "");

  const meta = await head(blobKey(relative));
  if (!meta) {
    return new Response("Not found", { status: 404 });
  }

  const res = await fetch(meta.url);
  if (!res.ok) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = await res.arrayBuffer();
  return new Response(bytes, {
    headers: {
      "Content-Type": meta.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
      "Content-Length": String(meta.size),
    },
  });
}
