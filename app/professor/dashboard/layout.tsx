import { prisma } from "@/lib/prisma";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  subject?: string;
}

export default async function DashboardLayout({
  children,
  subject,
}: LayoutProps) {
  const instructor = await prisma.instructorProfile.findFirst({
    include: {
      user: { include: { profile: true } },
    },
  });

  const professorName =
    instructor?.user?.profile?.displayName || "Professor";

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