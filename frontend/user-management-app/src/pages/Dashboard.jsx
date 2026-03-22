import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usersService, adService } from "../services/api";
import { dashboardStyles } from "../styles/dashboard.styles";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDbUsers: 0,
    totalAdUsers: 0,
    activeAdUsers: 0,
    disabledAdUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setRefreshing(true);
      const [dbUsers, adUsers] = await Promise.all([
        usersService.getAll(),
        adService.getAll(),
      ]);

      const adData = adUsers.data;
      const activeAd = adData.filter((u) => u.isEnabled).length;
      const disabledAd = adData.filter((u) => !u.isEnabled).length;

      setStats({
        totalDbUsers: dbUsers.data.length,
        totalAdUsers: adData.length,
        activeAdUsers: activeAd,
        disabledAdUsers: disabledAd,
      });

      setRecentUsers(adData.slice(0, 5));
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const statCards = [
    {
      label: "DB Users",
      value: stats.totalDbUsers,
      icon: "🗄️",
      style: dashboardStyles.statCardBlue,
    },
    {
      label: "AD Users",
      value: stats.totalAdUsers,
      icon: "👥",
      style: dashboardStyles.statCardGreen,
    },
    {
      label: "Active AD Users",
      value: stats.activeAdUsers,
      icon: "✅",
      style: dashboardStyles.statCardOrange,
    },
    {
      label: "Disabled AD Users",
      value: stats.disabledAdUsers,
      icon: "🚫",
      style: dashboardStyles.statCardRed,
    },
  ];

  return (
    <div style={dashboardStyles.wrapper}>
      <Sidebar />
      <div style={dashboardStyles.mainContent}>
        <Navbar title="Dashboard" />
        <div style={dashboardStyles.pageContent}>
          {/* Page Title + Refresh */}
          <div style={dashboardStyles.pageTitleRow}>
            <div>
              <h1 style={dashboardStyles.pageTitle}>Welcome back! 👋</h1>
              <p style={dashboardStyles.pageSubtitle}>
                Here's what's happening in your domain
              </p>
            </div>
            <button
              style={
                refreshing
                  ? dashboardStyles.refreshBtnDisabled
                  : dashboardStyles.refreshBtn
              }
              onClick={loadStats}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Refreshing...
                </>
              ) : (
                "🔄 Refresh"
              )}
            </button>
          </div>

          {/* Stat Cards */}
          {loading ? (
            <div style={dashboardStyles.loadingBox}>
              <div className="spinner-border text-primary"></div>
              <p style={dashboardStyles.loadingText}>Loading data...</p>
            </div>
          ) : (
            <>
              <div style={dashboardStyles.statsGrid}>
                {statCards.map((card, index) => (
                  <div
                    key={index}
                    style={{ ...dashboardStyles.statCard, ...card.style }}
                  >
                    <div>
                      <div style={dashboardStyles.statNumber}>{card.value}</div>
                      <div style={dashboardStyles.statLabel}>{card.label}</div>
                    </div>
                    <div style={dashboardStyles.statIcon}>{card.icon}</div>
                  </div>
                ))}
              </div>

              {/* Recent AD Users Table */}
              <div style={dashboardStyles.tableCard}>
                <div style={dashboardStyles.tableHeader}>
                  <div style={dashboardStyles.tableTitle}>Recent AD Users</div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate("/ad-users")}
                  >
                    View All
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={dashboardStyles.tableHead}>
                      <tr>
                        <th style={dashboardStyles.th}>#</th>
                        <th style={dashboardStyles.th}>Username</th>
                        <th style={dashboardStyles.th}>Full Name</th>
                        <th style={dashboardStyles.th}>Email</th>
                        <th style={dashboardStyles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user, index) => (
                        <tr key={user.username}>
                          <td style={dashboardStyles.td}>{index + 1}</td>
                          <td style={dashboardStyles.td}>
                            <strong>{user.username}</strong>
                          </td>
                          <td style={dashboardStyles.td}>{user.fullName}</td>
                          <td style={dashboardStyles.td}>
                            {user.email || "—"}
                          </td>
                          <td style={dashboardStyles.td}>
                            <span
                              style={{
                                ...dashboardStyles.badge,
                                ...(user.isEnabled
                                  ? dashboardStyles.badgeEnabled
                                  : dashboardStyles.badgeDisabled),
                              }}
                            >
                              {user.isEnabled ? "● Active" : "● Disabled"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={dashboardStyles.footer}>
          {new Date().getFullYear()} - User Management Dashboard
        </div>
      </div>
    </div>
  );
}
