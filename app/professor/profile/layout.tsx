import { prisma } from "@/lib/prisma";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";


export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userEmail = "timdoe@gmail.com"; // later from auth

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      profile: true,
      instructorProfile: true,
    },
  });

  const name = user?.profile?.displayName || "Professor";
  const subject = user?.instructorProfile?.bio || "";

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

        <Header professorName={name} />


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