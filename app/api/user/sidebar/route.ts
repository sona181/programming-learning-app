import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ user: null, courses: { registered: [] } });
  }

  const [user, xpResult] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        enrollments: true,
      },
    }),
    prisma.xpLog.aggregate({
      where: { userId },
      _sum: { xpAmount: true },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ user: null, courses: { registered: [] } });
  }

  const parts = (user.profile?.displayName ?? "User").split(" ");

  return NextResponse.json({
    user: {
      name: parts[0],
      surname: parts.slice(1).join(" "),
      role: user.role,
      xp: xpResult._sum.xpAmount ?? 0,
    },
    courses: {
      registered: user.enrollments,
    },
  });
}