import { type NextRequest, NextResponse } from "next/server";
import { RequestUploadUrlBody, RequestUploadUrlResponse } from "@workspace/api-zod";
import { ObjectStorageService } from "@/server/objectStorage";
import { authenticate, readJsonBody } from "@/server/auth";

export const dynamic = "force-dynamic";

const objectStorageService = new ObjectStorageService();

/**
 * POST /api/storage/uploads/request-url
 *
 * Request a presigned URL for file upload.
 * The client sends JSON metadata (name, size, contentType) — NOT the file.
 * Then uploads the file directly to the returned presigned URL.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth instanceof NextResponse) return auth;

  const parsed = RequestUploadUrlBody.safeParse(await readJsonBody(req));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid required fields" },
      { status: 400 },
    );
  }

  try {
    const { name, size, contentType } = parsed.data;

    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    return NextResponse.json(
      RequestUploadUrlResponse.parse({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      }),
    );
  } catch (error) {
    console.error("Error generating upload URL", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
