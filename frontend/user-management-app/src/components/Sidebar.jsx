import { useNavigate, useLocation } from "react-router-dom";
import { sidebarStyles } from "../styles/sidebar.styles";
import { useConfig } from "../hooks/useConfig";
import { useRole } from "../hooks/useRole";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { config, loading } = useConfig();
  const { isAdmin } = useRole();

  const menuItems = [
    { path: "/dashboard", icon: "📊", label: "Dashboard", adminOnly: false },
    { path: "/users", icon: "👥", label: "DB Users", adminOnly: true },
    { path: "/ad-users", icon: "🖥️", label: "AD Users", adminOnly: false },
    { path: "/audit-logs", icon: "📋", label: "Audit Logs", adminOnly: true },
    { path: "/profile", icon: "👤", label: "My Profile", adminOnly: false },
  ];

  // Filter menu based on role
  const visibleItems = menuItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div style={sidebarStyles.sidebar}>
      <div style={sidebarStyles.logo}>🛡️ UserManager</div>
      <div style={sidebarStyles.menu}>
        {visibleItems.map((item) => (
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

      {/* Dynamic Footer */}
      <div style={sidebarStyles.footer}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div>🌐 {config.domain}</div>
            <div style={sidebarStyles.footerSub}>🖥️ {config.server}</div>
            <div style={{ ...sidebarStyles.footerSub, marginTop: "4px" }}>
              ✅ AD Connected
            </div>
          </>
        )}
      </div>
    </div>
  );
}
