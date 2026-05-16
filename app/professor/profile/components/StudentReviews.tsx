type Review = {
  id: string;
  rating: number;
  comment: string | null;
  userName: string | null;
};

export default function StudentReviews({ reviews }: { reviews: Review[] }) {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: 20,
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h3 style={{ marginBottom: 16, fontWeight: 700, color: "#111827" }}>
        Vlerësimet
      </h3>

      {reviews.length === 0 ? (
        <div
          style={{
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9CA3AF",
            fontSize: 14,
          }}
        >
          Nuk ka vlerësime ende.
        </div>
      ) : (
        reviews.map((r, i) => {
          const initials = r.userName
            ? r.userName
                .split(" ")
                .filter(Boolean)
                .map((p) => p[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "?";

          return (
            <div
              key={r.id}
              style={{
                marginBottom: i < reviews.length - 1 ? 16 : 0,
                paddingBottom: i < reviews.length - 1 ? 16 : 0,
                borderBottom: i < reviews.length - 1 ? "1px solid #F3F4F6" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: r.comment ? 6 : 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
                    {r.userName ?? "Anonim"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span
                      key={idx}
                      style={{
                        color: idx < r.rating ? "#FACC15" : "#E5E7EB",
                        fontSize: 15,
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              {r.comment && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    margin: 0,
                    paddingLeft: 44,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{r.comment}&rdquo;
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
