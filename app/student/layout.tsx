import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Header from "./dashboard/_components/header";
import Sidebar from "./dashboard/_components/sidebar";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getCurrentSessionUser();

  if (sessionUser?.role !== "student") {
    redirect("/auth/login");
  }

  const [user, xpTotal] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { profile: true },
    }),
    prisma.xpLog.aggregate({
      where: { userId: sessionUser.id },
      _sum: { xpAmount: true },
    }),
  ]);

  const studentName = user?.profile?.displayName ?? user?.email ?? "Student";
  const xp = xpTotal._sum.xpAmount ?? 0;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Inter', Arial, Helvetica, sans-serif",
      }}
    >
      <Sidebar studentName={studentName} xp={xp} />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: "#f8fafc",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header studentName={studentName} />

        <main
          style={{
            padding: "20px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .student-dashboard-sidebar {
            display: none !important;
          }

          .student-dashboard-header {
            padding: 0 18px !important;
          }

          .student-dashboard-search {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
