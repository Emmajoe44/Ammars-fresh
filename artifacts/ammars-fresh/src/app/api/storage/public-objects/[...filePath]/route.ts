import { type NextRequest, NextResponse } from "next/server";
import { ObjectStorageService } from "@/server/objectStorage";

export const dynamic = "force-dynamic";

const objectStorageService = new ObjectStorageService();

/**
 * GET /api/storage/public-objects/...
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * These are unconditionally public — no authentication or ACL checks.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filePath: string[] }> },
) {
  try {
    const { filePath } = await context.params;
    const file = await objectStorageService.searchPublicObject(filePath.join("/"));
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    return objectStorageService.downloadObject(file);
  } catch (error) {
    console.error("Error serving public object", error);
    return NextResponse.json({ error: "Failed to serve public object" }, { status: 500 });
  }
}
