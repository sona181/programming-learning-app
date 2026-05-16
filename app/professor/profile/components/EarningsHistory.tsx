type EarningEntry = {
  id: string;
  date: Date;
  label: string;
  amount: number;
};

export default function EarningsHistory({
  entries,
  monthlyTotal,
}: {
  entries: EarningEntry[];
  monthlyTotal: number;
}) {
  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h3 style={{ fontWeight: 700, color: "#111827", marginBottom: 16 }}>
        Historia e Pagesave
      </h3>

      {entries.length === 0 ? (
        <p style={{ fontSize: 14, color: "#9CA3AF", margin: 0 }}>
          Nuk ka pagesa ende.
        </p>
      ) : (
        entries.map((e) => (
          <div
            key={e.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "#374151" }}>
              {e.date.toLocaleDateString("sq-AL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · {e.label}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>
              +€{e.amount.toFixed(0)}
            </span>
          </div>
        ))
      )}

      <div
        style={{
          borderTop: "1px solid #E5E7EB",
          marginTop: entries.length > 0 ? 12 : 0,
          paddingTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
          Total Muajit
        </span>
        <span style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>
          €{monthlyTotal.toFixed(0)}
        </span>
      </div>
    </div>
  );
}
