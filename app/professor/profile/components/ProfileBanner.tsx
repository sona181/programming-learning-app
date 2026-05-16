interface ProfileBannerProps {
  name: string;
  email: string;
  country?: string | null;
  rating: number;
  reviewsCount: number;
  students: number;
  courses: number;
  earnings: number;
  isVerified?: boolean;
  isAvailable?: boolean;
  hourlyRate?: number | null;
}

export default function ProfileBanner({
  name, email, country, rating, reviewsCount,
  students, courses, earnings, isVerified, isAvailable, hourlyRate,
}: ProfileBannerProps) {
  const safeName = name || "Professor";
  const initials = safeName
    .split(" ").filter(Boolean)
    .map((n) => n[0] ?? "").join("").toUpperCase() || "P";
  const safeRating = Number(rating || 0);

  return (
    <div style={{
      background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
      borderRadius: 20, padding: 20, color: "white",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* blur blob */}
      <div style={{
        position: "absolute", right: "-60px", top: "50%", transform: "translateY(-50%)",
        width: 180, height: 180, borderRadius: "50%",
        background: "rgba(255,255,255,0.12)", filter: "blur(25px)",
      }} />

      {/* Left — avatar + info */}
      <div style={{ display: "flex", gap: 16, zIndex: 1 }}>
        <div style={{
          width: 70, height: 70, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 20,
        }}>
          {initials}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Prof. {safeName}</h2>
            {isVerified && (
              <span style={{
                background: "rgba(255,255,255,0.2)", borderRadius: 999,
                padding: "2px 10px", fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                ✓ Verifikuar
              </span>
            )}
          </div>

          <p style={{ opacity: 0.85, marginBottom: 4, fontSize: 13 }}>
            {email}{country ? ` · ${country}` : ""}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ color: i + 1 <= safeRating ? "#FACC15" : "rgba(255,255,255,0.25)", fontSize: 15 }}>★</span>
            ))}
            <span style={{ fontSize: 12, opacity: 0.9, marginLeft: 6 }}>
              {safeRating.toFixed(1)}{reviewsCount > 0 ? ` (${reviewsCount} reviews)` : ""}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {hourlyRate != null && (
              <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                €{hourlyRate}/sesion
              </span>
            )}
            <span style={{
              background: isAvailable ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.1)",
              color: isAvailable ? "#86efac" : "rgba(255,255,255,0.6)",
              borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600,
            }}>
              {isAvailable ? "● I disponueshëm" : "● Joaktiv"}
            </span>
          </div>
        </div>
      </div>

      {/* Right — stats */}
      <div style={{ display: "flex", gap: 40, zIndex: 1 }}>
        <Stat label="Studentë" value={students} />
        <Stat label="Kurse" value={courses} />
        <Stat label="Muaji" value={`€${earnings}`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
    </div>
  );
}
