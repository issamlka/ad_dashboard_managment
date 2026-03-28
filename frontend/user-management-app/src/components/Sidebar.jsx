import { useNavigate, useLocation } from "react-router-dom";
import { sidebarStyles } from "../styles/sidebar.styles";
import { useConfig } from "../hooks/useConfig";
import { useRole } from "../hooks/useRole";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { config, loading } = useConfig();
  const { role } = useRole(); // ← add role

  const menuItems = [
    {
      path: "/dashboard",
      icon: "",
      label: "Dashboard",
      roles: ["Admin", "User"],
    },
    { path: "/users", icon: "", label: "DB Users", roles: ["Admin"] },
    {
      path: "/ad-users",
      icon: "",
      label: "AD Users",
      roles: ["Admin", "User"],
    },
    { path: "/audit-logs", icon: "", label: "Audit Logs", roles: ["Admin"] },
    {
      path: "/profile",
      icon: "",
      label: "My Profile",
      roles: ["Admin", "User"],
    },
    {
      path: "/ad-structure",
      icon: "",
      label: "AD Structure",
      roles: ["Admin"],
    },
  ];

  // Filter menu based on role
  const visibleItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <div style={sidebarStyles.sidebar}>
      <div style={sidebarStyles.logo}>Nx AccessHub</div>
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
            <div>{config.domain}</div>
            <div style={sidebarStyles.footerSub}>{config.server}</div>
            <div style={{ ...sidebarStyles.footerSub, marginTop: "4px" }}>
              AD Connected
            </div>
          </>
        )}
      </div>
    </div>
  );
}
