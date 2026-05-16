import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditProfileForm from "./_components/EditProfileForm";

export const dynamic = "force-dynamic";

export default async function EditProfessorProfilePage() {
  const session = await getCurrentSessionUser();

  if (session?.role !== "instructor") {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      profile: true,
      instructorProfile: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <section style={{ maxWidth: "880px", margin: "0 auto" }}>
      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#111827", margin: 0 }}>
          Edit Professor Profile
        </h2>
        <p style={{ color: "#6B7280", fontSize: "14px", margin: "6px 0 0" }}>
          Update the information students see on your public professor profile.
        </p>
      </div>

      <EditProfileForm
        initialValues={{
          name: user.profile?.displayName ?? "",
          country: user.profile?.country ?? "",
          bio: user.instructorProfile?.bio ?? user.profile?.bio ?? "",
          specialties: user.instructorProfile?.specialties ?? "",
          languages: user.instructorProfile?.languages ?? "",
          hourlyRate: user.instructorProfile?.hourlyRate
            ? String(Number(user.instructorProfile.hourlyRate))
            : "",
          isAvailable: user.instructorProfile?.isAvailable ?? false,
        }}
      />
    </section>
  );
}
