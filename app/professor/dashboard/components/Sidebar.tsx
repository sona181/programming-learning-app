"use client";

import { useRouter } from "next/navigation";
import { Home, BookOpen, CalendarCheck, MessageCircle, User, GraduationCap } from "lucide-react";

interface SidebarProps {
<<<<<<< HEAD
  professorName?: string; // mund të jetë undefined në fillim
=======
  professorName?: string; 
>>>>>>> 779b782 (Professor dashboard)
  subject?: string;
}

export default function Sidebar({ professorName, subject }: SidebarProps) {
  const router = useRouter();

  const menuItems = [
    { label: "Dashboard", icon: <Home size={18} />, path: "/professor/dashboard" },
    { label: "My Courses", icon: <BookOpen size={18} />, path: "/professor/courses" },
    { label: "Sessions", icon: <CalendarCheck size={18} />, path: "/professor/sessions" },
    { label: "Messages", icon: <MessageCircle size={18} />, path: "/professor/messages" },
    { label: "Profile", icon: <User size={18} />, path: "/professor/profile" },
  ];

<<<<<<< HEAD
  // safe name
=======
>>>>>>> 779b782 (Professor dashboard)
  const safeName = professorName?.trim() || "Professor";
  const initials = safeName
    .split(" ")
    .map((n) => n[0].toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div style={{
      width: "250px",
      background: "#160650ff",
      color: "white",
      padding: "20px",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "30px", gap: "10px" }}>
        <GraduationCap size={24} />
        <h2 style={{ fontWeight: 700, fontSize: "22px", letterSpacing: "1px", margin: 0 }}>
          UniLearn
        </h2>
      </div>

      {/* Menu */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px" }}>
        {menuItems.map((item) => (
          <div
            key={item.label}
            onClick={() => router.push(item.path)}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              borderRadius: "8px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2e1f61")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {item.icon}
            <span style={{ fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "auto" }}>
        <div style={{ height: "1px", backgroundColor: "#2e1f61", marginBottom: "10px", opacity: 0.5 }} />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #c084fc)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "16px",
            color: "white"
          }}>
            {initials}
          </div>
          <div style={{ lineHeight: "1.2" }}>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>{safeName}</div>
            <div style={{ fontSize: "12px", fontWeight: 400, color: "#c4c4c4" }}>{subject || ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}