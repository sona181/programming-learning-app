import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    const { name, bio, specialties } = await req.json();
    const userEmail = "timdoe@gmail.com";

    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: { profile: true, instructorProfile: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.profile) {
        await prisma.userProfile.update({
            where: { userId: user.id },
            data: { displayName: name, bio },
        });
    } else {
        await prisma.userProfile.create({
            data: {
                userId: user.id,
                displayName: name,
                bio,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    if (user.instructorProfile) {
        await prisma.instructorProfile.update({
            where: { userId: user.id },
            data: { bio, specialties },
        });
    } else {
        await prisma.instructorProfile.create({
            data: {
                userId: user.id,
                bio,
                specialties,
                isVerified: false,
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    return NextResponse.json({ success: true });
}