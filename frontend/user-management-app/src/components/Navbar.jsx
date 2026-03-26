import { useNavigate } from "react-router-dom";
import { navbarStyles } from "../styles/navbar.styles";
import { authService } from "../services/api";
import { showToast } from "../utils/toast";

export default function Navbar({ title }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "User";

  const handleLogout = async () => {
    try {
      await authService.logout(); // ← log it first
    } catch (err) {
      // silent fail — still logout even if API fails
      showToast.warn("⚠️ Logout API call failed, continuing with local logout");
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <div style={navbarStyles.navbar}>
      <div style={navbarStyles.title}>{title}</div>
      <div style={navbarStyles.userSection}>
        <div style={navbarStyles.avatar}>
          {username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={navbarStyles.username}>{username}</div>
          <div style={navbarStyles.role}>{role}</div>
        </div>
        <button style={navbarStyles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
