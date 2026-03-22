import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { adService } from "../services/api";
import { adUsersStyles } from "../styles/adUsers.styles";
import { showToast } from "../utils/toast";

export default function AdUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    logonName: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const result = users.filter(
      (u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.fullName.toLowerCase().includes(search.toLowerCase()),
    );
    setFiltered(result);
  }, [search, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adService.getAll();
      setUsers(response.data);
      setFiltered(response.data);
    } catch (err) {
      showToast.error("❌ Failed to load AD users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (username, isEnabled) => {
    try {
      setActionLoading(username);
      if (isEnabled) {
        await adService.disableUser(username);
        showToast.success(`✅ User ${username} disabled successfully`);
      } else {
        await adService.enableUser(username);
        showToast.success(`✅ User ${username} enabled successfully`);
      }
      await loadUsers();
    } catch (err) {
      showToast.error(`❌ Failed to ${isEnabled ? "disable" : "enable"} user`);
    } finally {
      setActionLoading("");
    }
  };

  const handleCreateUser = async () => {
    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.username ||
      !newUser.logonName ||
      !newUser.password ||
      !newUser.confirmPassword
    ) {
      showToast.error("❌ All fields are required");
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      showToast.error("❌ Passwords do not match");
      return;
    }

    try {
      setActionLoading("creating");
      await adService.createUser({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        logonName: newUser.logonName,
        password: newUser.password,
        confirmPassword: newUser.confirmPassword,
      });
      showToast.success(`✅ User ${newUser.username} created successfully!`);
      setShowModal(false);
      setNewUser({
        firstName: "",
        lastName: "",
        username: "",
        logonName: "",
        password: "",
        confirmPassword: "",
      });
      await loadUsers();
    } catch (err) {
      showToast.error(
        err.response?.data?.message || "❌ Failed to create user",
      );
    } finally {
      setActionLoading("");
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setNewUser({
      firstName: "",
      lastName: "",
      username: "",
      logonName: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div style={adUsersStyles.wrapper}>
      <Sidebar />
      <div style={adUsersStyles.mainContent}>
        <Navbar title="AD Users Management" />
        <div style={adUsersStyles.pageContent}>
          {/* Page Title */}
          <div style={adUsersStyles.pageTitleRow}>
            <div>
              <h1 style={adUsersStyles.pageTitle}>Active Directory Users</h1>
              <p style={adUsersStyles.pageSubtitle}>Manage your domain users</p>
            </div>
            <button
              style={adUsersStyles.addBtn}
              onClick={() => setShowModal(true)}
            >
              + Add AD User
            </button>
          </div>

          {/* Table Card */}
          <div style={adUsersStyles.tableCard}>
            <div style={adUsersStyles.tableHeader}>
              <div style={adUsersStyles.tableTitle}>
                {filtered.length} Users Found
              </div>
              <input
                style={adUsersStyles.searchInput}
                placeholder="🔍 Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2 text-muted">Loading AD users...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={adUsersStyles.tableHead}>
                    <tr>
                      <th style={adUsersStyles.th}>#</th>
                      <th style={adUsersStyles.th}>Username</th>
                      <th style={adUsersStyles.th}>Full Name</th>
                      <th style={adUsersStyles.th}>Email</th>
                      <th style={adUsersStyles.th}>Status</th>
                      <th style={adUsersStyles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user, index) => (
                      <tr key={user.username}>
                        <td style={adUsersStyles.td}>{index + 1}</td>
                        <td style={adUsersStyles.td}>
                          <strong>{user.username}</strong>
                        </td>
                        <td style={adUsersStyles.td}>{user.fullName}</td>
                        <td style={adUsersStyles.td}>{user.email || "—"}</td>
                        <td style={adUsersStyles.td}>
                          <span
                            style={{
                              ...adUsersStyles.badge,
                              ...(user.isEnabled
                                ? adUsersStyles.badgeEnabled
                                : adUsersStyles.badgeDisabled),
                            }}
                          >
                            {user.isEnabled ? "● Active" : "● Disabled"}
                          </span>
                        </td>
                        <td style={adUsersStyles.td}>
                          <button
                            style={{
                              ...adUsersStyles.actionBtn,
                              ...(user.isEnabled
                                ? adUsersStyles.disableBtn
                                : adUsersStyles.enableBtn),
                            }}
                            onClick={() =>
                              handleToggleUser(user.username, user.isEnabled)
                            }
                            disabled={actionLoading === user.username}
                          >
                            {actionLoading === user.username ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : user.isEnabled ? (
                              "Disable"
                            ) : (
                              "Enable"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={adUsersStyles.footer}>
          {new Date().getFullYear()} - User Management Dashboard
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div style={adUsersStyles.modalOverlay}>
          <div style={adUsersStyles.modalCard}>
            <h3 style={adUsersStyles.modalTitle}>➕ Create AD User</h3>
            <p style={adUsersStyles.modalSubtitle}>
              Fill in the details to create a new domain user
            </p>

            {/* First Name & Last Name */}
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={adUsersStyles.modalLabel}>First Name</label>
                <input
                  style={adUsersStyles.modalInput}
                  placeholder="John"
                  value={newUser.firstName}
                  onChange={(e) => {
                    const firstName = e.target.value;
                    const lastName = newUser.lastName;
                    setNewUser({
                      ...newUser,
                      firstName,
                      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
                      logonName: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
                    });
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={adUsersStyles.modalLabel}>Last Name</label>
                <input
                  style={adUsersStyles.modalInput}
                  placeholder="Doe"
                  value={newUser.lastName}
                  onChange={(e) => {
                    const lastName = e.target.value;
                    const firstName = newUser.firstName;
                    setNewUser({
                      ...newUser,
                      lastName,
                      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
                      logonName: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
                    });
                  }}
                />
              </div>
            </div>

            <label style={adUsersStyles.modalLabel}>
              Username (SAM Account)
            </label>
            <input
              style={adUsersStyles.modalInput}
              placeholder="john.doe"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
            />

            <label style={adUsersStyles.modalLabel}>
              Logon Name (UPN prefix)
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "15px",
              }}
            >
              <input
                style={{
                  ...adUsersStyles.modalInput,
                  marginBottom: 0,
                  flex: 1,
                }}
                placeholder="john.doe"
                value={newUser.logonName}
                onChange={(e) =>
                  setNewUser({ ...newUser, logonName: e.target.value })
                }
              />
              <span
                style={{
                  color: "#7f8c8d",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                @ad.issam.com
              </span>
            </div>

            <div style={adUsersStyles.divider}></div>

            <label style={adUsersStyles.modalLabel}>Password</label>
            <input
              type="password"
              style={adUsersStyles.modalInput}
              placeholder="Strong password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />

            <label style={adUsersStyles.modalLabel}>Confirm Password</label>
            <input
              type="password"
              style={adUsersStyles.modalInput}
              placeholder="Repeat password"
              value={newUser.confirmPassword}
              onChange={(e) =>
                setNewUser({ ...newUser, confirmPassword: e.target.value })
              }
            />

            {newUser.confirmPassword && (
              <p
                style={
                  newUser.password === newUser.confirmPassword
                    ? adUsersStyles.passwordMatch
                    : adUsersStyles.errorText
                }
              >
                {newUser.password === newUser.confirmPassword
                  ? "✅ Passwords match"
                  : "❌ Passwords do not match"}
              </p>
            )}

            <div style={adUsersStyles.modalFooter}>
              <button style={adUsersStyles.cancelBtn} onClick={resetModal}>
                Cancel
              </button>
              <button
                style={adUsersStyles.submitBtn}
                onClick={handleCreateUser}
                disabled={
                  actionLoading === "creating" ||
                  newUser.password !== newUser.confirmPassword
                }
              >
                {actionLoading === "creating" ? (
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
    </div>
  );
}
