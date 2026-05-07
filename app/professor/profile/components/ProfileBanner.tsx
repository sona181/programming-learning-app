interface ProfileBannerProps {
  name: string;
  email: string;
  university?: string;
  bio?: string;
  rating: number;
  reviewsCount: number;
  students: number;
  courses: number;
  earnings: number;
}

export default function ProfileBanner({
  name,
  email,
  university,
  bio,
  rating,
  reviewsCount,
  students,
  courses,
  earnings,
}: ProfileBannerProps) {
  const safeName = name || "Professor";

  const initials =
    safeName
      ?.split(" ")
      ?.filter(Boolean)
      ?.map((n) => n?.[0] || "")
      ?.join("")
      ?.toUpperCase() || "P";

  const safeRating = Number(rating || 0);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
        borderRadius: 20,
        padding: 20,
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "-60px",
          top: "50%",
          transform: "translateY(-50%)",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          filter: "blur(25px)",
        }}
      />
      <div style={{ display: "flex", gap: 16, zIndex: 1 }}>
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          {initials}
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>
            Prof. {safeName}
          </h2>
          <p style={{ opacity: 0.85, marginBottom: 4 }}>
            {email} {university && `• ${university}`}
          </p>

          {bio && (
            <p
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: "#c4c4c4",
                marginBottom: 6,
              }}
            >
              {bio}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;

              return (
                <span
                  key={i}
                  style={{
                    color:
                      value <= safeRating
                        ? "#FACC15"
                        : "rgba(255,255,255,0.25)",
                    fontSize: 15,
                  }}
                >
                  ★
                </span>
              );
            })}

            <span style={{ fontSize: 12, opacity: 0.9, marginLeft: 6 }}>
              {safeRating.toFixed(1)} ({reviewsCount} reviews)
            </span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 40, zIndex: 1 }}>
        <Stat label="Students" value={students} />
        <Stat label="Courses" value={courses} />
        <Stat label="Monthly" value={`€${earnings}`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
    </div>
  );
}