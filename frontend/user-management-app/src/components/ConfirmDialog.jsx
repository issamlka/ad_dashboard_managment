import { dbUsersStyles } from "../styles/dbUsers.styles";

export default function ConfirmDialog({
  show,
  title,
  message,
  confirmText,
  confirmColor,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!show) return null;

  return (
    <div style={dbUsersStyles.modalOverlay}>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "30px",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: "50px", marginBottom: "15px" }}>
          {confirmColor === "red" ? "⚠️" : "✅"}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#2c3e50",
            marginBottom: "10px",
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          style={{
            color: "#7f8c8d",
            fontSize: "14px",
            marginBottom: "25px",
            lineHeight: "1.5",
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            style={{
              padding: "10px 25px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "white",
              color: "#7f8c8d",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            style={{
              padding: "10px 25px",
              borderRadius: "8px",
              border: "none",
              background:
                confirmColor === "red"
                  ? "linear-gradient(135deg, #e74c3c, #c0392b)"
                  : "linear-gradient(135deg, #2ecc71, #27ae60)",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
