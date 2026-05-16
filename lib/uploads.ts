import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES: Record<string, string[]> = {
  video: ["video/mp4", "video/webm"],
  pdf: ["application/pdf"],
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  zip: ["application/zip", "application/x-zip-compressed"],
};

const MAX_SIZES: Record<string, number> = {
  video: 500 * 1024 * 1024,  // 500 MB
  pdf:   20  * 1024 * 1024,  // 20 MB
  image: 5   * 1024 * 1024,  // 5 MB
  zip:   100 * 1024 * 1024,  // 100 MB
};

export type UploadType = keyof typeof ALLOWED_TYPES;

export class UploadError extends Error {}

export async function saveUpload(
  file: File,
  type: UploadType,
  subDir = "",
): Promise<{ fileUrl: string; fileName: string; fileSize: number; mimeType: string }> {
  const allowed = ALLOWED_TYPES[type];
  if (!allowed.includes(file.type)) {
    throw new UploadError(`Invalid file type: ${file.type}. Allowed: ${allowed.join(", ")}`);
  }

  const maxSize = MAX_SIZES[type];
  if (file.size > maxSize) {
    throw new UploadError(`File too large. Max ${maxSize / 1024 / 1024} MB.`);
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const uniqueName = `${randomUUID()}.${ext}`;
  const dir = join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", subDir);
  await mkdir(dir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(join(dir, uniqueName), Buffer.from(bytes));

  const fileUrl = subDir ? `/uploads/${subDir}/${uniqueName}` : `/uploads/${uniqueName}`;
  return { fileUrl, fileName: file.name, fileSize: file.size, mimeType: file.type };
}
