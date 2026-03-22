import { useNavigate, useLocation } from "react-router-dom";
import { sidebarStyles } from "../styles/sidebar.styles";
import { useConfig } from "../hooks/useConfig";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { config, loading } = useConfig();

  const menuItems = [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/users", icon: "👥", label: "DB Users" },
    { path: "/ad-users", icon: "🖥️", label: "AD Users" },
  ];

  return (
    <div style={sidebarStyles.sidebar}>
      <div style={sidebarStyles.logo}>🛡️ UserManager</div>
      <div style={sidebarStyles.menu}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            style={
              location.pathname === item.path
                ? sidebarStyles.menuItemActive
                : sidebarStyles.menuItem
            }
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Dynamic Footer from API */}
      <div style={sidebarStyles.footer}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div>🌐 {config.domain}</div>
            <div style={sidebarStyles.footerSub}>🖥️ {config.server}</div>
          </>
        )}
      </div>
    </div>
  );
}
