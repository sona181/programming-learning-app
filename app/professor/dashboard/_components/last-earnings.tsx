"use client";

type Earning = Readonly<{
  id: string;
  studentName: string;
  studentInitials: string;
  avatarColor: string;
  type: "session" | "course";
  amount: number;
  currency: string;
}>;

const TYPE_LABEL: Record<string, string> = {
  session: "Sesion 1-on-1",
  course: "Kurs",
};

export default function LastEarnings({ earnings }: { readonly earnings: readonly Earning[] }) {
  return (
    <div>
      <h3 style={{ marginBottom: "10px", fontWeight: 700, fontSize: "18px", color: "#111827" }}>
        Fitimet e Fundit
      </h3>
      <div
        style={{
          background: "white", padding: "16px", borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #F3F4F6",
        }}
      >
        {earnings.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#9CA3AF", padding: "8px 0" }}>
            Nuk ka të ardhura ende.
          </p>
        ) : (
          earnings.map((e) => (
            <div
              key={e.id}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: "1px solid #F3F4F6",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: e.avatarColor, color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "13px", flexShrink: 0,
                  }}
                >
                  {e.studentInitials}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#111827" }}>
                    {e.studentName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
                    {TYPE_LABEL[e.type] ?? e.type}
                  </div>
                </div>
              </div>
              <span style={{ fontWeight: 700, fontSize: "15px", color: "#10B981" }}>
                +€{e.amount.toFixed(0)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
