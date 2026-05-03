"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

interface HeaderProps {
  professorName: string;
}

const COLORS = {
  primaryGradient: "linear-gradient(135deg, #ec4899, #8b5cf6)",
  background: "#ffffff",
  text: "#111827",
  border: "#e5e7eb",
  iconBg: "#f3f4f6",
};

export default function Header({ professorName }: HeaderProps) {
  const router = useRouter();

  const getInitials = (name: string) => {
    if (!name) return "P";

    const parts = name.trim().split(" ").filter(Boolean);

    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";

    return (first + last).toUpperCase();
  };

  const initials = getInitials(professorName);

  return (
    <div
      style={{
        marginTop: "30px",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* TITLE */}
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "600",
            color: COLORS.text,
            marginLeft: "40px",
          }}
        >
          Professor Dashboard
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginRight: "45px",
          }}
        >
          {/* ADD COURSE */}
          <button
            onClick={() => router.push("/professor/courses/new")}
            style={{
              background: "linear-gradient(135deg, #6f33e3, #743ee4)",
              color: "white",
              padding: "10px 18px",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              border: "none",
              boxShadow: "0 4px 12px rgba(111, 51, 227, 0.25)",
            }}
          >
            + Add Course
          </button>

          {/* NOTIFICATIONS */}
          <div
            onClick={() => router.push("/professor/notifications")}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: COLORS.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Bell size={20} color="#111827" />
          </div>

          {/* AVATAR */}
          <div
            onClick={() => router.push("/professor/profile")}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: COLORS.primaryGradient,
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
        </div>
      </div>

      <div
        style={{
          height: "1px",
          backgroundColor: COLORS.border,
          marginTop: "12px",
        }}
      />
    </div>
  );
}
