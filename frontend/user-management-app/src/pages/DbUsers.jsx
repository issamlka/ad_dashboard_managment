import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ReadOnlyBanner from "../components/ReadOnlyBanner";
import { usersService, permissionsService } from "../services/api";
import { dbUsersStyles } from "../styles/dbUsers.styles";
import { showToast } from "../utils/toast";
import { useRole } from "../hooks/useRole";

export default function DbUsers() {
  const { isAdmin, permissions } = useRole();

  const canCreate = isAdmin || permissions.canCreateDbUsers;
  const canEdit = isAdmin || permissions.canEditDbUsers;
  const canDelete = isAdmin || permissions.canDeleteDbUsers;
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState({
    canCreateAdUsers: false,
    canDisableEnableAdUsers: false,
    canCreateDbUsers: false,
    canEditDbUsers: false,
    canDeleteDbUsers: false,
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "", // ← add this
    role: "User",
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const result = users.filter(
      (u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.firstName.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()),
    );
    setFiltered(result);
  }, [search, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getAll();
      setUsers(response.data);
      setFiltered(response.data);
    } catch (err) {
      showToast.error("❌ Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "", // ← add this
      role: "User",
      isActive: true,
    });
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleCreate = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.username ||
      !formData.password
    ) {
      showToast.error("❌ All fields are required");
      return;
    }

    // ← add this check
    if (formData.password !== formData.confirmPassword) {
      showToast.error("❌ Passwords do not match");
      return;
    }

    try {
      setActionLoading(true);
      await usersService.create(formData);
      showToast.success(`✅ User ${formData.username} created successfully!`);
      setShowCreateModal(false);
      resetForm();
      await loadUsers();
    } catch (err) {
      showToast.error("❌ Failed to create user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.username
    ) {
      showToast.error("❌ All fields are required");
      return;
    }

    // Only validate password if user entered something
    if (formData.password && formData.password !== formData.confirmPassword) {
      showToast.error("❌ Passwords do not match");
      return;
    }

    try {
      setActionLoading(true);
      await usersService.update(selectedUser.id, formData);
      showToast.success(`✅ User ${formData.username} updated successfully!`);
      setShowEditModal(false);
      resetForm();
      await loadUsers();
    } catch (err) {
      showToast.error("❌ Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await usersService.delete(selectedUser.id);
      showToast.success(
        `✅ User ${selectedUser.username} deleted successfully!`,
      );
      setShowDeleteModal(false);
      await loadUsers();
    } catch (err) {
      showToast.error("❌ Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPermissions = async (user) => {
    setSelectedUser(user);
    try {
      const response = await permissionsService.getByUserId(user.id);
      setSelectedPermissions({
        canCreateAdUsers: response.data.canCreateAdUsers,
        canDisableEnableAdUsers: response.data.canDisableEnableAdUsers,
        canCreateDbUsers: response.data.canCreateDbUsers,
        canEditDbUsers: response.data.canEditDbUsers,
        canDeleteDbUsers: response.data.canDeleteDbUsers,
      });
    } catch {
      setSelectedPermissions({
        canCreateAdUsers: false,
        canDisableEnableAdUsers: false,
        canCreateDbUsers: false,
        canEditDbUsers: false,
        canDeleteDbUsers: false,
      });
    }
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = async () => {
    try {
      setActionLoading(true);
      await permissionsService.update(selectedUser.id, selectedPermissions);
      showToast.success(`✅ Permissions updated for ${selectedUser.username}`);
      setShowPermissionsModal(false);
    } catch (err) {
      showToast.error("❌ Failed to update permissions");
    } finally {
      setActionLoading(false);
    }
  };

  // Reusable form fields for create and edit
  const renderFormFields = (isEdit = false) => (
    <>
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <label style={dbUsersStyles.modalLabel}>First Name</label>
          <input
            style={dbUsersStyles.modalInput}
            placeholder="John"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={dbUsersStyles.modalLabel}>Last Name</label>
          <input
            style={dbUsersStyles.modalInput}
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
        </div>
      </div>

      <label style={dbUsersStyles.modalLabel}>Email</label>
      <input
        style={dbUsersStyles.modalInput}
        placeholder="john@example.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <label style={dbUsersStyles.modalLabel}>Username</label>
      <input
        style={dbUsersStyles.modalInput}
        placeholder="johndoe"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />

      {/* Password section */}
      <label style={dbUsersStyles.modalLabel}>
        {isEdit ? "New Password (leave blank to keep current)" : "Password"}
      </label>
      <input
        type="password"
        style={dbUsersStyles.modalInput}
        placeholder={
          isEdit ? "Enter new password or leave blank" : "Strong password"
        }
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />

      <label style={dbUsersStyles.modalLabel}>
        {isEdit ? "Confirm New Password" : "Confirm Password"}
      </label>
      <input
        type="password"
        style={dbUsersStyles.modalInput}
        placeholder={isEdit ? "Confirm new password" : "Repeat password"}
        value={formData.confirmPassword}
        onChange={(e) =>
          setFormData({ ...formData, confirmPassword: e.target.value })
        }
      />

      {/* Password match indicator */}
      {formData.confirmPassword && (
        <p
          style={{
            fontSize: "12px",
            marginTop: "-10px",
            marginBottom: "10px",
            color:
              formData.password === formData.confirmPassword
                ? "#27ae60"
                : "#e74c3c",
          }}
        >
          {formData.password === formData.confirmPassword
            ? "✅ Passwords match"
            : "❌ Passwords do not match"}
        </p>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <label style={dbUsersStyles.modalLabel}>Role</label>
          <select
            style={dbUsersStyles.modalSelect}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={dbUsersStyles.modalLabel}>Status</label>
          <select
            style={dbUsersStyles.modalSelect}
            value={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.value === "true" })
            }
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
    </>
  );

  return (
    <div style={dbUsersStyles.wrapper}>
      <Sidebar />
      <div style={dbUsersStyles.mainContent}>
        <Navbar title="DB Users Management" />
        <div style={dbUsersStyles.pageContent}>
          {/* Page Title */}
          <div style={dbUsersStyles.pageTitleRow}>
            <div>
              <h1 style={dbUsersStyles.pageTitle}>Database Users</h1>
              <p style={dbUsersStyles.pageSubtitle}>
                Manage application login users
              </p>
            </div>
            {canCreate && (
              <button
                style={dbUsersStyles.addBtn}
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
              >
                + Add DB User
              </button>
            )}
          </div>

          <ReadOnlyBanner />

          {/* Table Card */}
          <div style={dbUsersStyles.tableCard}>
            <div style={dbUsersStyles.tableHeader}>
              <div style={dbUsersStyles.tableTitle}>
                {filtered.length} Users Found
              </div>
              <input
                style={dbUsersStyles.searchInput}
                placeholder="🔍 Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success"></div>
                <p className="mt-2 text-muted">Loading users...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={dbUsersStyles.tableHead}>
                    <tr>
                      <th style={dbUsersStyles.th}>#</th>
                      <th style={dbUsersStyles.th}>Name</th>
                      <th style={dbUsersStyles.th}>Username</th>
                      <th style={dbUsersStyles.th}>Email</th>
                      <th style={dbUsersStyles.th}>Role</th>
                      <th style={dbUsersStyles.th}>Status</th>
                      <th style={dbUsersStyles.th}>Created</th>
                      {(canEdit || canDelete) && (
                        <th style={dbUsersStyles.th}>Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user, index) => (
                      <tr key={user.id}>
                        <td style={dbUsersStyles.td}>{index + 1}</td>
                        <td style={dbUsersStyles.td}>
                          <strong>
                            {user.firstName} {user.lastName}
                          </strong>
                        </td>
                        <td style={dbUsersStyles.td}>{user.username}</td>
                        <td style={dbUsersStyles.td}>{user.email}</td>
                        <td style={dbUsersStyles.td}>
                          <span
                            style={{
                              ...dbUsersStyles.badge,
                              ...(user.role === "Admin"
                                ? dbUsersStyles.badgeAdmin
                                : dbUsersStyles.badgeUser),
                            }}
                          >
                            {user.role === "Admin" ? "👑 Admin" : "👤 User"}
                          </span>
                        </td>
                        <td style={dbUsersStyles.td}>
                          <span
                            style={{
                              ...dbUsersStyles.badge,
                              ...(user.isActive
                                ? dbUsersStyles.badgeActive
                                : dbUsersStyles.badgeInactive),
                            }}
                          >
                            {user.isActive ? "● Active" : "● Inactive"}
                          </span>
                        </td>
                        <td style={dbUsersStyles.td}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        {(canEdit || canDelete) && (
                          <td style={dbUsersStyles.td}>
                            {canEdit && (
                              <button
                                style={{
                                  ...dbUsersStyles.actionBtn,
                                  ...dbUsersStyles.editBtn,
                                }}
                                onClick={() => handleOpenEdit(user)}
                              >
                                ✏️ Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                style={{
                                  ...dbUsersStyles.actionBtn,
                                  ...dbUsersStyles.deleteBtn,
                                }}
                                onClick={() => handleOpenDelete(user)}
                              >
                                🗑️ Delete
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                style={{
                                  ...dbUsersStyles.actionBtn,
                                  backgroundColor: "#f0e6ff",
                                  color: "#8e44ad",
                                }}
                                onClick={() => handleOpenPermissions(user)}
                              >
                                🔑 Permissions
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={dbUsersStyles.footer}>
          {new Date().getFullYear()} - User Management Dashboard
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={dbUsersStyles.modalOverlay}>
          <div style={dbUsersStyles.modalCard}>
            <h3 style={dbUsersStyles.modalTitle}>➕ Create DB User</h3>
            <p style={dbUsersStyles.modalSubtitle}>
              Create a new application login user
            </p>
            {renderFormFields(true)}
            <div style={dbUsersStyles.modalFooter}>
              <button
                style={dbUsersStyles.cancelBtn}
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                style={dbUsersStyles.submitBtn}
                onClick={handleCreate}
                disabled={
                  actionLoading ||
                  formData.password !== formData.confirmPassword // ← add this
                }
              >
                {actionLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={dbUsersStyles.modalOverlay}>
          <div style={dbUsersStyles.modalCard}>
            <h3 style={dbUsersStyles.modalTitle}>Edit User</h3>
            <p style={dbUsersStyles.modalSubtitle}>
              Editing: <strong>{selectedUser?.username}</strong>
            </p>
            {renderFormFields(true)}
            <div style={dbUsersStyles.modalFooter}>
              <button
                style={dbUsersStyles.cancelBtn}
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                style={dbUsersStyles.submitBtn}
                onClick={handleEdit}
                disabled={
                  actionLoading ||
                  // only block if password entered but doesn't match
                  (formData.password !== "" &&
                    formData.password !== formData.confirmPassword)
                }
              >
                {actionLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={dbUsersStyles.modalOverlay}>
          <div style={{ ...dbUsersStyles.modalCard, maxWidth: "380px" }}>
            <h3 style={dbUsersStyles.modalTitle}>🗑️ Delete User</h3>
            <p
              style={{
                color: "#7f8c8d",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              Are you sure you want to delete{" "}
              <strong style={{ color: "#e74c3c" }}>
                {selectedUser?.username}
              </strong>
              ? This action cannot be undone!
            </p>
            <div style={dbUsersStyles.modalFooter}>
              <button
                style={dbUsersStyles.cancelBtn}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                style={dbUsersStyles.deleteConfirmBtn}
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && (
        <div style={dbUsersStyles.modalOverlay}>
          <div style={dbUsersStyles.modalCard}>
            <h3 style={dbUsersStyles.modalTitle}>🔑 User Permissions</h3>
            <p style={dbUsersStyles.modalSubtitle}>
              Managing permissions for <strong>{selectedUser?.username}</strong>
            </p>

            {/* AD Permissions */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#7f8c8d",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                🖥️ Active Directory
              </div>

              {[
                { key: "canCreateAdUsers", label: "Create AD Users" },
                {
                  key: "canDisableEnableAdUsers",
                  label: "Disable/Enable AD Users",
                },
              ].map((perm) => (
                <div
                  key={perm.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#2c3e50" }}>
                    {perm.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedPermissions[perm.key]}
                    onChange={(e) =>
                      setSelectedPermissions({
                        ...selectedPermissions,
                        [perm.key]: e.target.checked,
                      })
                    }
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                </div>
              ))}
            </div>

            <div style={dbUsersStyles.modalFooter}>
              <button
                style={dbUsersStyles.cancelBtn}
                onClick={() => setShowPermissionsModal(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  ...dbUsersStyles.submitBtn,
                  background: "linear-gradient(135deg, #8e44ad, #6c3483)",
                }}
                onClick={handleSavePermissions}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  "🔑 Save Permissions"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
