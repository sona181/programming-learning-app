"use client";

type Note = {
  id: string;
  studentName: string;
  studentInitials: string;
  avatarColor: string;
  content: string;
  createdAt: string;
  isSharedWithStudent: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sq-AL", { day: "numeric", month: "long" });
}

export default function SessionNotes({ notes }: Readonly<{ notes: Note[] }>) {
  return (
    <div>
      <h3 style={{ marginBottom: "10px", fontWeight: 700, fontSize: "18px", color: "#111827" }}>
        Shënimet e Sesioneve
      </h3>
      <div
        style={{
          background: "white", padding: "16px", borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #F3F4F6",
        }}
      >
        {notes.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#9CA3AF", padding: "8px 0" }}>
            Nuk ka shënime sesionesh ende.
          </p>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              style={{
                padding: "12px", marginBottom: "10px", borderRadius: "12px",
                borderLeft: "3px solid #7C3AED", background: "#FAFAFA",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <div
                  style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: n.avatarColor, color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "11px", flexShrink: 0,
                  }}
                >
                  {n.studentInitials}
                </div>
                <span style={{ fontWeight: 600, fontSize: "14px", color: "#7C3AED" }}>
                  {n.studentName} — {formatDate(n.createdAt)}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#374151", margin: "0 0 6px", lineHeight: 1.5 }}>
                {n.content}
              </p>
              <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                {n.isSharedWithStudent ? "Indarë me studentin ✓" : "Private — jo indarë"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
