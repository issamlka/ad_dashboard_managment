import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { usersService } from "../services/api";
import { profileStyles } from "../styles/profile.styles";

export default function Profile() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dbUsers = await usersService.getAll();

      // Find current logged in user
      const me = dbUsers.data.find((u) => u.username === username);
      setCurrentUser(me);
    } catch (err) {
      console.error("Failed to load profile data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={profileStyles.wrapper}>
      <Sidebar />
      <div style={profileStyles.mainContent}>
        <Navbar title="My Profile" />
        <div style={profileStyles.pageContent}>
          <h1 style={profileStyles.pageTitle}>My Profile</h1>
          <p style={profileStyles.pageSubtitle}>
            Your account information and statistics
          </p>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <>
              {/* Profile Card */}
              <div style={profileStyles.profileCard}>
                {/* Header */}
                <div style={profileStyles.profileHeader}>
                  <div style={profileStyles.avatar}>
                    {username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={profileStyles.profileName}>
                      {currentUser
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : username}
                    </div>
                    <div style={profileStyles.profileRole}>
                      {role === "Admin" ? "Administrator" : "User"}
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div style={profileStyles.profileBody}>
                  <div style={profileStyles.infoGrid}>
                    <div style={profileStyles.infoItem}>
                      <div style={profileStyles.infoLabel}>Username</div>
                      <div style={profileStyles.infoValue}>{username}</div>
                    </div>
                    <div style={profileStyles.infoItem}>
                      <div style={profileStyles.infoLabel}>Role</div>
                      <div style={profileStyles.infoValue}>{role}</div>
                    </div>
                    <div style={profileStyles.infoItem}>
                      <div style={profileStyles.infoLabel}>Email</div>
                      <div style={profileStyles.infoValue}>
                        {currentUser?.email || "—"}
                      </div>
                    </div>
                    <div style={profileStyles.infoItem}>
                      <div style={profileStyles.infoLabel}>Full Name</div>
                      <div style={profileStyles.infoValue}>
                        {currentUser
                          ? `${currentUser.firstName} ${currentUser.lastName}`
                          : "—"}
                      </div>
                    </div>
                    <div style={profileStyles.infoItem}>
                      <div style={profileStyles.infoLabel}>Account Status</div>
                      <div
                        style={{
                          ...profileStyles.infoValue,
                          color: currentUser?.isActive ? "#27ae60" : "#e74c3c",
                        }}
                      >
                        {currentUser?.isActive ? "● Active" : "● Inactive"}
                      </div>
                    </div>
                    <div style={profileStyles.infoItem}>
                      <div style={profileStyles.infoLabel}>Member Since</div>
                      <div style={profileStyles.infoValue}>
                        {currentUser
                          ? new Date(currentUser.createdAt).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={profileStyles.footer}>
          {new Date().getFullYear()} - User Management Dashboard
        </div>
      </div>
    </div>
  );
}
