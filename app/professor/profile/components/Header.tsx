"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  readonly professorName: string;
  readonly userId: string;
}

const COLORS = {
  border: "#e5e7eb",
  text: "#111827",
};

export default function Header({ professorName, userId }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/auth/login");
    router.refresh();
  }

  return (
    <div style={{ marginTop: "30px", marginBottom: "8px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 60px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: "600",
              color: COLORS.text,
              margin: 0,
            }}
          >
            Profili i Profesorit
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "13px" }}>
            Identifikuar si {professorName}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => router.push("/professor/profile/edit")}
            style={{
              background: "linear-gradient(135deg, #6f33e3, #743ee4)",
              color: "white",
              padding: "10px 18px",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              border: "none",
              boxShadow: "0 4px 12px rgba(111, 51, 227, 0.25)",
              fontSize: "14px",
            }}
          >
            Ndrysho Profilin
          </button>

          <button
            onClick={() => router.push(`/instructors/${userId}`)}
            style={{
              background: "#fff",
              color: "#374151",
              padding: "10px 18px",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              border: "1px solid #E5E7EB",
              fontSize: "14px",
            }}
          >
            Shiko Profilin Publik
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "#fff",
              color: "#DC2626",
              padding: "10px 16px",
              borderRadius: "12px",
              fontWeight: "700",
              cursor: "pointer",
              border: "1px solid #FCA5A5",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <LogOut size={16} />
            Dil
          </button>
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
