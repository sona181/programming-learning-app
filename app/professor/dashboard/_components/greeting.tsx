type GreetingProps = {
  name: string;
  monthlyEarnings: number;
  todaySessions: number;
  timeGreeting: string;
  minutesUntilNext: number | null;
};

export default function Greeting({
  name,
  monthlyEarnings,
  todaySessions,
  timeGreeting,
  minutesUntilNext,
}: Readonly<GreetingProps>) {
  const firstName = name.split(" ")[0] ?? name;

  let subtext = `Ke ${todaySessions} sesione sot.`;
  if (todaySessions === 0) {
    subtext = "Nuk ke sesione sot. Shto disponueshmëri për të marrë rezervime.";
  } else if (minutesUntilNext !== null && minutesUntilNext > 0) {
    subtext = `Ke ${todaySessions} sesione sot. Studenti tjetër fillon në ${minutesUntilNext} min.`;
  }

  return (
    <div
      style={{
        borderRadius: "20px",
        padding: "28px 32px",
        marginBottom: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #6425ca 0%, #7C3AED 45%, #6D28D9 100%)",
        color: "#fff",
        boxShadow: "0 18px 50px rgba(91,33,182,0.3)",
      }}
    >
      {/* decorative circle */}
      <div
        style={{
          position: "absolute", right: "-90px", top: "-90px",
          width: "260px", height: "260px",
          background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <h2 style={{ fontSize: "26px", fontWeight: 800, margin: 0 }}>
          {timeGreeting}, Prof. {firstName}! 👨‍🏫
        </h2>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.88)", margin: "6px 0 0" }}>
          {subtext}
        </p>
      </div>

      <div
        style={{
          position: "relative", zIndex: 2,
          borderRadius: "16px", padding: "14px 22px",
          minWidth: "160px", textAlign: "center",
          background: "rgba(255,255,255,0.18)",
          border: "1px solid rgba(255,255,255,0.3)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <p style={{ fontSize: "12px", opacity: 0.9, margin: 0 }}>Këtë muaj</p>
        <p style={{ fontSize: "24px", fontWeight: 800, margin: "4px 0 0" }}>
          €{monthlyEarnings.toFixed(0)}
        </p>
      </div>
    </div>
  );
}
