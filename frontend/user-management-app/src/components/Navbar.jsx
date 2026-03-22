import { useNavigate } from "react-router-dom";
import { navbarStyles } from "../styles/navbar.styles";

export default function Navbar({ title }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
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
