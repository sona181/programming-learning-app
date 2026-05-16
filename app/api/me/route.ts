import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getCurrentSessionUser();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.id },
    select: { displayName: true },
  });

  const name = profile?.displayName ?? session.email;

  return NextResponse.json({
    user: { id: session.id, name, role: session.role },
  });
}
