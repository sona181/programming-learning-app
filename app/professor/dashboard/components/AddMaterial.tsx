"use client";

import React from "react";

export default function AddMaterial() {
  const handleAddVideo = () => {
    alert("Add Video clicked!");
  };

  const handleAddPDF = () => {
    alert("Add PDF clicked!");
  };

  return (
    <div
      style={{
        marginTop: "20px",
        fontFamily: "'Inter', sans-serif",
        color: "#111827",
      }}
    >
      <h3
        style={{
          marginBottom: "12px",
          fontWeight: 700,
          fontSize: "20px",
          color: "#111827",
        }}
      >
        Add New Material
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          background: "white",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        {/* Video Button */}
        <button
          onClick={handleAddVideo}
          style={{
            padding: "20px",
            border: "2px dashed #7c3aed",
            borderRadius: "12px",
            textAlign: "center",
            cursor: "pointer",
            background: "white",
            fontFamily: "'Inter', sans-serif",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            transition: "all 0.2s",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "16px", color: "#111827" }}>
            + Add Video
          </span>
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            Upload your teaching video here
          </span>
        </button>

        {/* PDF Button */}
        <button
          onClick={handleAddPDF}
          style={{
            padding: "20px",
            border: "2px dashed #7c3aed",
            borderRadius: "12px",
            textAlign: "center",
            cursor: "pointer",
            background: "white",
            fontFamily: "'Inter', sans-serif",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            transition: "all 0.2s",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "16px", color: "#111827" }}>
            + Add PDF
          </span>
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            Upload your PDF document here
          </span>
        </button>
      </div>
    </div>
  );
}