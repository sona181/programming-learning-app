"use client";

import {
  BookOpen,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Home,
  MessageCircle,
  Search,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type SidebarProps = {
  studentName?: string;
  xp?: number;
};

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "S";
}

export default function Sidebar({ studentName, xp = 0 }: Readonly<SidebarProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const safeName = studentName?.trim() || "Student";

  const menuItems = [
    { label: "Dashboard", icon: <Home size={18} />, path: "/student/dashboard" },
    { label: "Browse Courses", icon: <Search size={18} />, path: "/courses" },
    { label: "My Courses", icon: <BookOpen size={18} />, path: "/my-courses" },
    { label: "Sessions", icon: <CalendarCheck size={18} />, path: "/student/sessions" },
    { label: "Messages", icon: <MessageCircle size={18} />, path: "/student/messages" },
    { label: "Billing", icon: <CreditCard size={18} />, path: "/subscribe" },
    { label: "Profile", icon: <User size={18} />, path: "/student/profile" },
  ];

  return (
    <aside
      className="student-dashboard-sidebar"
      style={{
        width: "250px",
        background: "#111827",
        color: "white",
        padding: "20px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GraduationCap size={20} />
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 800, margin: 0 }}>UniLearn</h2>

        <span
          style={{
            fontSize: "10px",
            background: "#2563eb",
            padding: "2px 7px",
            borderRadius: "999px",
            fontWeight: 700,
          }}
        >
          Student
        </span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              style={{
                border: "none",
                background: isActive ? "#1d4ed8" : "transparent",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 12px",
                borderRadius: "10px",
                fontWeight: 600,
                textAlign: "left",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid #374151", paddingTop: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            aria-label="Open student profile"
            onClick={() => router.push("/student/profile")}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              border: "none",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {getInitials(safeName)}
          </button>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>
              {safeName}
            </div>
            <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
              Student · {xp.toLocaleString("en-US")} XP
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
