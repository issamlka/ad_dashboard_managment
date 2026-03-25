import { jwtDecode } from "jwt-decode";

export function useRole() {
  const role = localStorage.getItem("role");

  // Read permissions from JWT token
  const token = localStorage.getItem("token");
  let permissions = {
    canCreateAdUsers: false,
    canDisableEnableAdUsers: false,
    canCreateDbUsers: false,
    canEditDbUsers: false,
    canDeleteDbUsers: false,
  };

  if (token) {
    try {
      const decoded = jwtDecode(token);
      permissions = {
        canCreateAdUsers: decoded.CanCreateAdUsers === "True",
        canDisableEnableAdUsers: decoded.CanDisableEnableAdUsers === "True",
        canCreateDbUsers: decoded.CanCreateDbUsers === "True",
        canEditDbUsers: decoded.CanEditDbUsers === "True",
        canDeleteDbUsers: decoded.CanDeleteDbUsers === "True",
      };
    } catch (err) {
      console.error("Failed to decode token", err);
    }
  }

  return {
    role,
    isAdmin: role === "Admin",
    isUser: role === "User",
    permissions,
  };
}
