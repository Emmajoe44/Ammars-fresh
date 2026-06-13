import { type NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/server/auth";
import { usesLocalObjectStorage, usesBlobStorage } from "@/server/objectStorageMode";
import { saveBlobObject } from "@/server/blobObjectStorage";

export const dynamic = "force-dynamic";

/**
 * PUT /api/storage/uploads/put/...
 * Local-dev or Vercel Blob upload target (when GCS is not configured).
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const blobMode = usesBlobStorage();
  if (!usesLocalObjectStorage() && !blobMode) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const { path } = await context.params;
  if (!path.length) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const relativePath = path.join("/");
    const data = Buffer.from(await req.arrayBuffer());
    if (data.length === 0) {
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }
    const contentType =
      req.headers.get("content-type") ?? "application/octet-stream";
    if (blobMode) {
      await saveBlobObject(relativePath, data, contentType);
    } else {
      const { saveLocalObject } = await import("@/server/localObjectStorage");
      saveLocalObject(relativePath, data, contentType);
    }
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Local upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
