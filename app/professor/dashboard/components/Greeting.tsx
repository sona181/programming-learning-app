interface GreetingProps {
  name: string;
  monthlyEarnings: number;
  todaySessions: number;
  timeGreeting: string;
}

export default function Greeting({ name, monthlyEarnings, todaySessions, timeGreeting }: GreetingProps) {
  return (
    <div style={{
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#5b21b6",
      color: "#fff",
      fontFamily: "'Inter', sans-serif",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
    }}>
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.5px" }}>
          {timeGreeting}, {name}!
        </h2>
        <p style={{ fontSize: "15px", color: "#e0d7f5" }}>
          You have <strong>{todaySessions}</strong> session{todaySessions !== 1 ? "s" : ""} today.
        </p>
      </div>

      <div style={{
        borderRadius: "12px",
        backgroundColor: "#f3e8ff",
        padding: "14px 18px",
        textAlign: "center",
        minWidth: "130px",
        color: "#6b21a8",
        fontWeight: 500,
      }}>
        <p style={{ fontSize: "12px", marginBottom: "6px", letterSpacing: "0.5px" }}>Monthly Earnings</p>
        <p style={{ fontSize: "18px", fontWeight: 700 }}>€{monthlyEarnings.toFixed(2)}</p>
      </div>
    </div>
  );
}