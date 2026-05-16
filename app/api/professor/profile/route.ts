import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getCurrentSessionUser(req);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name?: string; bio?: string; specialties?: string;
    languages?: string; hourlyRate?: number | null; isAvailable?: boolean;
    country?: string | null;
  };
  try { body = await req.json(); } catch { body = {}; }

  const { name, bio, specialties, languages, hourlyRate, isAvailable, country } = body;
  const now = new Date();

  // Upsert UserProfile
  await prisma.userProfile.upsert({
    where: { userId: session.id },
    create: { userId: session.id, displayName: name ?? "", bio: bio ?? "", createdAt: now, updatedAt: now },
    update: {
      ...(name !== undefined && { displayName: name }),
      ...(bio !== undefined && { bio }),
      ...(country !== undefined && { country: country || null }),
      updatedAt: now,
    },
  });

  // Upsert InstructorProfile
  await prisma.instructorProfile.upsert({
    where: { userId: session.id },
    create: {
      userId: session.id,
      bio: bio ?? "",
      specialties: specialties ?? "",
      languages: languages ?? "",
      hourlyRate: hourlyRate ?? null,
      isVerified: false,
      isAvailable: isAvailable ?? true,
      createdAt: now,
      updatedAt: now,
    },
    update: {
      ...(bio !== undefined && { bio }),
      ...(specialties !== undefined && { specialties }),
      ...(languages !== undefined && { languages }),
      ...(hourlyRate !== undefined && { hourlyRate }),
      ...(isAvailable !== undefined && { isAvailable }),
      updatedAt: now,
    },
  });

  return NextResponse.json({ success: true });
}
