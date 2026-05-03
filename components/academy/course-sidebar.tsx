"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, BookOpen } from "lucide-react";

interface CourseSidebarProps {
  streak?: number;
  xp?: number;
  userName?: string;
}

function getLevel(xp: number): { level: number; name: string } {
  if (xp >= 1000) return { level: 5, name: "Ekspert" };
  if (xp >= 500) return { level: 4, name: "Avancuar" };
  if (xp >= 250) return { level: 3, name: "Praktikant" };
  if (xp >= 100) return { level: 2, name: "Nxënës" };
  return { level: 1, name: "Fillestar" };
}

export default function CourseSidebar({
  streak = 0,
  xp = 0,
  userName = "Student",
}: CourseSidebarProps) {
  const pathname = usePathname();
  const initials = userName.slice(0, 2).toUpperCase();
  const { level, name } = getLevel(xp);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/" },
    { href: "/browse", label: "Browse", icon: Search, match: (p: string) => p === "/browse" },
    {
      href: "/course",
      label: "My Courses",
      icon: BookOpen,
      match: (p: string) => p.startsWith("/course"),
    },
  ];

  return (
    <aside
      style={{
        width: 220,
        background: "var(--bg-sidebar)",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🚀</span>
          <span
            style={{
              color: "white",
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: -0.4,
            }}
          >
            CodeQuest
          </span>
        </div>
      </div>

      {/* User info */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                color: "white",
                fontWeight: 600,
                fontSize: 13,
                margin: "0 0 3px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userName}
            </p>
            <span
              style={{
                background: "rgba(26,86,219,0.3)",
                color: "#93c5fd",
                borderRadius: 4,
                padding: "1px 7px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              Student
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "8px 0" }}>
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const isActive = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                color: isActive ? "white" : "rgba(255,255,255,0.5)",
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                borderLeft: isActive
                  ? "3px solid var(--accent-primary)"
                  : "3px solid transparent",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: "all 150ms",
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: streak + XP */}
      <div
        style={{
          padding: "14px 20px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <p style={{ color: "var(--streak-color)", fontSize: 13, fontWeight: 600, margin: "0 0 5px" }}>
          🔥 {streak} ditë
        </p>
        <p style={{ color: "var(--xp-color)", fontSize: 13, fontWeight: 600, margin: "0 0 5px" }}>
          ⭐ {xp} XP
        </p>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>
          Level {level} · {name}
        </p>
      </div>
    </aside>
  );
}
