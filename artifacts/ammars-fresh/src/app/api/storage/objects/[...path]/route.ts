import { type NextRequest, NextResponse } from "next/server";
import { ObjectStorageService, ObjectNotFoundError } from "@/server/objectStorage";

export const dynamic = "force-dynamic";

const objectStorageService = new ObjectStorageService();

/**
 * GET /api/storage/objects/...
 *
 * Serve object entities from PRIVATE_OBJECT_DIR.
 *
 * NOTE: Intentionally public — product images are shown to anonymous visitors
 * on the landing page and `<img>` tags cannot send Authorization headers. The
 * upload endpoint (POST /api/storage/uploads/request-url) is auth-gated, so
 * only logged-in users can put new objects into the bucket.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await context.params;
    const objectPath = `/objects/${path.join("/")}`;
    return objectStorageService.downloadObjectEntity(objectPath);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      console.warn("Object not found", error);
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }
    console.error("Error serving object", error);
    return NextResponse.json({ error: "Failed to serve object" }, { status: 500 });
  }
}
