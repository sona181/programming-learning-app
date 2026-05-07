"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  professorName: string;
}

const COLORS = {
  primaryGradient: "linear-gradient(135deg, #ec4899, #8b5cf6)",
  background: "#ffffff",
  text: "#111827",
  border: "#e5e7eb",
};

export default function Header({ professorName }: HeaderProps) {
  const router = useRouter();

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
          padding: "15px 60px",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "600",
            color: COLORS.text,
            margin: 0, 
          }}
        >
          Professor Profile
        </h1>
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
          }}
        >
          Change Your Profile
        </button>
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