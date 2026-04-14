type GreetingProps = {
  name: string;
  monthlyEarnings: number | string;
  todaySessions: number;
  timeGreeting: string;
};

export default function Greeting({
  name,
  monthlyEarnings,
  todaySessions,
  timeGreeting,
}: GreetingProps) {
  return (
    <div
      style={{
        borderRadius: "20px",
        padding: "28px",
        marginBottom: "10px",
        marginTop: "1px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",

        background:
          "linear-gradient(135deg, #6425caff 0%, #7C3AED 45%, #6D28D9 100%)",
        color: "#fff",
        boxShadow: "0 18px 50px rgba(91, 33, 182, 0.35)",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "-90px",
          top: "-90px",
          width: "260px",
          height: "260px",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(2px)",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <h2 style={{ fontSize: "26px", fontWeight: 800 }}>
          {timeGreeting}, {name} 👨‍🏫
        </h2>

        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)" }}>
          You have {todaySessions} sessions today. Another student joins in  hours.
        </p>
      </div>

      {/* earnings box */}
      <div
        style={{
          position: "relative",
          zIndex: 2,

          borderRadius: "16px",
          padding: "14px 18px",
          minWidth: "160px",
          textAlign: "center",

          background: "rgba(255,255,255,0.18)",
          border: "1px solid rgba(255,255,255,0.3)",

          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",

          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <p style={{ fontSize: "12px", opacity: 0.9 }}>
          This Month's Earnings
        </p>

        <p style={{ fontSize: "22px", fontWeight: 800 }}>
          €{monthlyEarnings}
        </p>
      </div>
    </div>
  );
}