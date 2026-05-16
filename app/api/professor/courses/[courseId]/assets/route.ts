import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { saveUpload, UploadError, type UploadType } from "@/lib/uploads";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ courseId: string }> };

// POST — upload a file asset for this course
// FormData fields: file (File), assetType ("video"|"pdf"|"image"|"zip"), lessonId? (string)
export async function POST(request: Request, { params }: Params) {
  const { courseId } = await params;
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findFirst({ where: { id: courseId, authorId: session.id } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 }); }

  const file = formData.get("file");
  const assetType = (formData.get("assetType") as UploadType) ?? "image";
  const lessonId = (formData.get("lessonId") as string) || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const { fileUrl, fileName, fileSize, mimeType } = await saveUpload(file, assetType, courseId);

    const asset = await prisma.courseAsset.create({
      data: {
        courseId,
        lessonId,
        assetType,
        fileName,
        fileUrl,
        fileSize,
        mimeType,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
