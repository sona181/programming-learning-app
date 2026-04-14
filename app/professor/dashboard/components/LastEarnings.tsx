"use client";
import React from "react";

type Payment = {
  id?: string;
  amount?: number | string;
  student?: { name?: string; email?: string } | null;
  createdAt?: string | Date | null;
};

export default function LastEarnings({ payments }: { payments: Payment[] }) {
  return (
    <div style={{ marginTop: "20px", fontFamily: "'Inter', sans-serif", color: "#111827" }}>
      
      <h3
        style={{
          marginBottom: "8px",
          fontSize: "20px",
          fontWeight: 700,
          color: "#111827",
        }}
      >
        Last Earnings
      </h3>

      {/* Box */}
      <section
        style={{
          background: "#fff",
          padding: "16px",
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        {payments.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No payments yet</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {payments.map((p) => {
              const amount = Number(p.amount ?? 0).toFixed(2); 
              const date = p.createdAt ? new Date(p.createdAt).toLocaleString() : "—";
              const student = p.student?.name ?? p.student?.email ?? "Student";

              return (
                <li
                  key={p.id ?? `${amount}-${date}`} 
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#111827" }}>{student}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{date}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: "#111827" }}>${amount}</div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}