import { useRole } from "../hooks/useRole";

export default function ReadOnlyBanner() {
  const { isUser } = useRole();

  if (!isUser) return null;

  return (
    <div
      style={{
        backgroundColor: "#ebf5fb",
        border: "1px solid #3498db",
        borderRadius: "8px",
        padding: "12px 20px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "14px",
        color: "#2980b9",
      }}
    >
      <span style={{ fontSize: "18px" }}>ℹ️</span>
      <span>
        You have <strong>read-only access</strong> — contact an Administrator to
        make changes.
      </span>
    </div>
  );
}
