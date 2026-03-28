import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2c3e50, #3498db)",
        color: "white",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <div style={{ fontSize: "120px", lineHeight: 1 }}></div>
      <h1
        style={{
          fontSize: "80px",
          fontWeight: "900",
          margin: "10px 0",
          opacity: 0.9,
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "10px" }}>
        Page Not Found
      </h2>
      <p style={{ opacity: 0.8, fontSize: "16px", marginBottom: "30px" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: "15px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "12px 25px",
            borderRadius: "8px",
            border: "2px solid white",
            background: "transparent",
            color: "white",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ← Go Back
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "12px 25px",
            borderRadius: "8px",
            border: "none",
            background: "white",
            color: "#2c3e50",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
