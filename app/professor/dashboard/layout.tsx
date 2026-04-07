"use client";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  professorName?: string; // vjen nga DB
  subject?: string;
}

export default function DashboardLayout({ children, professorName, subject }: LayoutProps) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <Sidebar professorName={professorName} subject={subject} />

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#f9fafb" }}>
        <Header professorName={professorName || "Professor"} />
        {children}
      </div>
    </div>
  );
}