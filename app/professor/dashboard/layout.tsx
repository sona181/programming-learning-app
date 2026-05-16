import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Header from "./_components/header";
import Sidebar from "./_components/sidebar";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sessionUser = await getCurrentSessionUser();

  if (sessionUser?.role !== "instructor") {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      profile: true,
      instructorProfile: true,
    },
  });

  const name = user?.profile?.displayName ?? "Professor";
  const subject = user?.instructorProfile?.specialties ?? user?.instructorProfile?.bio ?? "";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar professorName={name} subject={subject} />
      <div style={{ flex: 1, backgroundColor: "#f9fafb", display: "flex", flexDirection: "column" }}>
        <Header professorName={name} />
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
