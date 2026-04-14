"use client";

import { useState } from "react";
import { Video, FileText } from "lucide-react";

export default function AddMaterial() {
  const [active, setActive] = useState<"video" | "pdf" | null>(null);

  const boxStyle = (type: "video" | "pdf") => ({
    border: `2px dashed ${
      active === type ? "#3B82F6" : "#D1D5DB"
    }`,

    background: active === type ? "#EFF6FF" : "#F9FAFB",

    borderRadius: "16px",
    padding: "30px",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "0.2s",
  });

  return (
    <div style={{ marginTop: "20px" }}>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: "#111827",
          marginBottom: "12px",
        }}
      >
        Add New Content
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

        {/* VIDEO */}
        <div onClick={() => setActive("video")} style={boxStyle("video")}>
          
          <Video size={28} color="#3B82F6" style={{ marginBottom: "8px" }} />

          <p
            style={{
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              fontSize: "16px",
            }}
          >
            Add Video Material
          </p>

          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "6px" }}>
            MP4, MOV up to 2GB · Drag and drop or click
          </p>
        </div>

        {/* PDF */}
        <div onClick={() => setActive("pdf")} style={boxStyle("pdf")}>
          
          <FileText size={28} color="#6B7280" style={{ marginBottom: "8px" }} />

          <p
            style={{
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              fontSize: "16px",
            }}
          >
            Add PDF, DOCX, PPTX Material
          </p>

          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "6px" }}>
            PDF, DOCX, PPTX up to 50MB
          </p>
        </div>

      </div>
    </div>
  );
}