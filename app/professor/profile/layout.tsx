import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";


export default async function ProfessorLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
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

  const name = user?.profile?.displayName || "Professor";
  const subject = user?.instructorProfile?.specialties || user?.instructorProfile?.bio || "";

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#F8FAFC",
      }}
    >
  
      <Sidebar professorName={name} subject={subject} />


      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >

        <Header professorName={name} userId={user?.id ?? ""} />


        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 30px 30px 30px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
