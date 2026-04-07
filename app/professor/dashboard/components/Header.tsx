"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

interface HeaderProps {
  professorName: string;
}

export default function Header({ professorName }: HeaderProps) {
  const router = useRouter();
  const initials = professorName
    .split(" ")
    .map((n) => n[0].toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div style={{ marginBottom: "25px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#000" }}>
          Professor Dashboard
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={() => router.push("/professor/courses/new")}
            style={{
              background: "#7c3aed",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            + Add Course
          </button>
          <div
            onClick={() => router.push("/professor/notifications")}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#000",
            }}
          >
            <Bell size={20} />
          </div>
          <div
            onClick={() => router.push("/professor/profile")}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {initials}
          </div>
        </div>
      </div>
      <div style={{ height: "1px", backgroundColor: "#d1d5db", marginTop: "12px" }} />
    </div>
  );
}