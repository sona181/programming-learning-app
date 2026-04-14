"use client";

import { useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  CalendarCheck,
  MessageCircle,
  User,
  GraduationCap,
} from "lucide-react";

interface SidebarProps {
  professorName?: string;
  subject?: string;
}

export default function Sidebar({
  professorName,
  subject,
}: SidebarProps) {
  const router = useRouter();

  const menuItems = [
    { label: "Dashboard", icon: <Home size={18} />, path: "/professor/dashboard" },
    { label: "My Courses", icon: <BookOpen size={18} />, path: "/professor/courses" },
    { label: "Sessions", icon: <CalendarCheck size={18} />, path: "/professor/sessions" },
    { label: "Messages", icon: <MessageCircle size={18} />, path: "/professor/messages" },
    { label: "Profile", icon: <User size={18} />, path: "/professor/profile" },
  ];

  const safeName = professorName?.trim() || "Professor";

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ").filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
  };

  const initials = getInitials(safeName);

  const displayName = `Prof. ${safeName}`;
  const displaySubject = subject ? `Professor of ${subject}` : "";

  return (
    <div
      style={{
        width: "250px",
        background: "#1a1a3a",
        color: "white",
        padding: "20px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* LOGO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "30px",
          gap: "10px",
        }}
      >
        {/* ICON */}
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            background: "#5f3dc4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GraduationCap size={20} color="white" />
        </div>

        {/* TEXT + BADGE */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <h2 style={{ fontWeight: 700, fontSize: "22px", margin: 0 }}>
            UniLearn
          </h2>

          {/* PROF BADGE*/}
          <div
            style={{
              background: "#5f3dc4",
              color: "white",
              fontSize: "8px",
              fontWeight: 700,
              padding: "1px 5px",
              borderRadius: "4px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            prof
          </div>
        </div>
      </div>

      {/* MENU */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#5f3dc4")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {item.icon}
            <span style={{ fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: "auto" }}>
        <div
          style={{
            height: "1px",
            backgroundColor: "#2e1f61",
            marginBottom: "10px",
            opacity: 0.5,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            onClick={() => router.push("/professor/profile")}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            {initials}
          </div>

          <div style={{ lineHeight: "1.2" }}>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              {displayName}
            </div>

            <div
              style={{
                fontSize: "12px",
                fontWeight: 400,
                color: "#c4c4c4",
              }}
            >
              {displaySubject}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}