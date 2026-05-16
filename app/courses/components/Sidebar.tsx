"use client";

import type { JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  userId: string | null;
  userName: string | null;
}

export default function Sidebar({ userId, userName }: SidebarProps): JSX.Element {
  const pathname = usePathname();
  const [xp, setXp] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/user/sidebar?userId=${userId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        setXp(data.user?.xp ?? 0);
        setEnrolledCount((data.courses?.registered ?? []).length);
      })
      .catch(() => {});
  }, [userId]);

  const navItems = [
    {
      label: "Dashboard",
      href: "/student/dashboard",
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <rect x="3"  y="3"  width="8" height="8" rx="1.5" />
          <rect x="13" y="3"  width="8" height="8" rx="1.5" />
          <rect x="3"  y="13" width="8" height="8" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
        </svg>
      ),
    },
    {
      label: "Shfleto Kurset",
      href: "/courses",
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Kurset e Mia",
      href: "/my-courses",
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
  ];

  const displayName = userName ?? "Student";
  const initials = displayName
    .split(" ")
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .nav-link { text-decoration: none; transition: background 0.12s, color 0.12s; }
        .nav-link:hover { background: rgba(255,255,255,0.06) !important; }
        .nav-link:hover .nav-icon { color: #fff !important; }
        .nav-link:hover .nav-label { color: #fff !important; }
      `}</style>

      <aside
        style={{
          width: 220,
          minHeight: "100vh",
          background: "linear-gradient(180deg, #0F172A 0%, #0B1120 100%)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              width: 34, height: 34,
              background: "#2563EB",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polygon points="12,4 23,9.5 12,15 1,9.5" fill="white" />
              <path d="M6 11.5v5.5c0 0 2 2.5 6 2.5s6-2.5 6-2.5V11.5" stroke="white" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
              <line x1="23" y1="9.5" x2="23" y2="15.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="23" cy="16.2" r="1.1" fill="white" />
            </svg>
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>UniLearn</span>
          <span
            style={{
              color: "#93C5FD", fontSize: 11, fontWeight: 500,
              padding: "2px 8px", borderRadius: 20,
              border: "1px solid rgba(37,99,235,0.5)",
              background: "rgba(37,99,235,0.15)",
              whiteSpace: "nowrap",
            }}
          >
            Student
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/student/dashboard" && pathname.startsWith(item.href));

            const href = userId ? `${item.href}?userId=${userId}` : item.href;

            return (
              <Link
                key={item.href}
                href={href}
                className="nav-link"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 7,
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? "#1E3A5F" : "transparent",
                }}
              >
                <span className="nav-icon" style={{ color: isActive ? "#fff" : "#64748B", display: "flex", alignItems: "center" }}>
                  {item.icon}
                </span>
                <span className="nav-label" style={{ flex: 1, color: isActive ? "#fff" : "#64748B" }}>
                  {item.label}
                </span>
                {item.href === "/my-courses" && enrolledCount > 0 && (
                  <span
                    style={{
                      background: "#2563EB", color: "#fff", fontSize: 10, fontWeight: 700,
                      minWidth: 18, height: 18, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {enrolledCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "#7C3AED",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}
            >
              {initials || "S"}
            </div>
            <div style={{ lineHeight: 1.4, minWidth: 0 }}>
              <p
                style={{
                  color: "#F1F5F9", fontSize: 13, fontWeight: 600, margin: 0,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}
              >
                {displayName}
              </p>
              <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>
                Student{xp > 0 ? ` · ${xp.toLocaleString()} XP` : ""}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
