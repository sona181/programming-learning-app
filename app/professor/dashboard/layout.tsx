import { prisma } from "@/lib/prisma";
import Header from "./_components/header";
import Sidebar from "./_components/sidebar";

interface LayoutProps {
  children: React.ReactNode;
  subject?: string;
}

export default async function DashboardLayout({
  children,
  subject,
}: LayoutProps) {
  const userEmail = "john.doe@gmail.com";//will be replaced

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      profile: true,
      instructorProfile: true,
    },
  });

  const professorName =
    user?.profile?.displayName || "Professor";

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Sidebar professorName={professorName} subject={subject} />

      <div
        style={{
          flex: 1,
          backgroundColor: "#f9fafb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header professorName={professorName} />

        <div
          style={{
            padding: "20px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}