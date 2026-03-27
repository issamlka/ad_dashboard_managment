import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { usersService, adService, auditLogService } from "../services/api";
import { dashboardStyles } from "../styles/dashboard.styles";
import { useRole } from "../hooks/useRole";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";

export default function Dashboard() {
  const { role } = useRole();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDbUsers: 0,
    totalAdUsers: 0,
    activeAdUsers: 0,
    disabledAdUsers: 0,
  });
  const [chartStats, setChartStats] = useState({
    activityData: [],
    mostActiveUsers: [],
    totalActions: 0,
    successActions: 0,
    failedActions: 0,
    todayActions: 0,
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

      // Base calls for everyone
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

      // Only fetch audit stats for Admin
      if (role === "Admin") {
        const auditStats = await auditLogService.getStats();
        setChartStats(auditStats.data);
      }
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
      subLabel: "Total app users",
      icon: "🗄️",
      style: dashboardStyles.statCardBlue,
      adminOnly: true,
    },
    {
      label: "AD Users",
      value: stats.totalAdUsers,
      subLabel: `${stats.activeAdUsers} active`,
      icon: "👥",
      style: dashboardStyles.statCardGreen,
      adminOnly: true,
    },
    {
      label: "Active AD Users",
      value: stats.activeAdUsers,
      subLabel: "Currently enabled",
      icon: "✅",
      style: dashboardStyles.statCardOrange,
      adminOnly: false,
    },
    {
      label: "Disabled AD Users",
      value: stats.disabledAdUsers,
      subLabel: "Currently disabled",
      icon: "🚫",
      style: dashboardStyles.statCardRed,
      adminOnly: false,
    },
  ];

  const COLORS = ["#3498db", "#2ecc71", "#e67e22", "#e74c3c", "#9b59b6"];

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

          {loading ? (
            <div style={dashboardStyles.loadingBox}>
              <div className="spinner-border text-primary"></div>
              <p style={dashboardStyles.loadingText}>Loading data...</p>
            </div>
          ) : (
            <>
              {/* Enhanced Stat Cards */}
              <div style={dashboardStyles.statsGrid}>
                {statCards
                  .filter((card) => !card.adminOnly || role === "Admin")
                  .map((card, index) => (
                    <div
                      key={index}
                      style={{ ...dashboardStyles.statCard, ...card.style }}
                    >
                      <div>
                        <div style={dashboardStyles.statNumber}>
                          {card.value}
                        </div>
                        <div style={dashboardStyles.statLabel}>
                          {card.label}
                        </div>
                        <div style={dashboardStyles.statSubLabel}>
                          {card.subLabel}
                        </div>
                      </div>
                      <div style={dashboardStyles.statIcon}>{card.icon}</div>
                    </div>
                  ))}
              </div>

              {/* Mini Stats Row — Admin only */}
              {role === "Admin" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "15px",
                    marginBottom: "25px",
                  }}
                >
                  {[
                    {
                      label: "Total Actions",
                      value: chartStats.totalActions,
                      color: "#2c3e50",
                    },
                    {
                      label: "Today's Actions",
                      value: chartStats.todayActions,
                      color: "#3498db",
                    },
                    {
                      label: "Failed Actions",
                      value: chartStats.failedActions,
                      color: "#e74c3c",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: "white",
                        borderRadius: "10px",
                        padding: "15px 20px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderLeft: `4px solid ${item.color}`,
                      }}
                    >
                      <div style={{ fontSize: "13px", color: "#7f8c8d" }}>
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "22px",
                          fontWeight: "700",
                          color: item.color,
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Charts Grid */}
              {role === "Admin" && (
                <div style={dashboardStyles.chartsGrid}>
                  {/* Line Chart — Activity Last 7 Days */}
                  <div style={dashboardStyles.chartCard}>
                    <div style={dashboardStyles.chartTitle}>
                      📈 Activity — Last 7 Days
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartStats.activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: "#7f8c8d" }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#7f8c8d" }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="actions"
                          stroke="#3498db"
                          strokeWidth={3}
                          dot={{ fill: "#3498db", r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bar Chart — Most Active Users */}
                  <div style={dashboardStyles.chartCard}>
                    <div style={dashboardStyles.chartTitle}>
                      👥 Most Active Users
                    </div>
                    {chartStats.mostActiveUsers.length === 0 ? (
                      <div
                        style={{
                          height: "250px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#7f8c8d",
                          fontSize: "14px",
                        }}
                      >
                        No activity data yet
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartStats.mostActiveUsers}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="username"
                            tick={{ fontSize: 12, fill: "#7f8c8d" }}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: "#7f8c8d" }}
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "8px",
                              border: "none",
                              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Bar dataKey="actions" radius={[6, 6, 0, 0]}>
                            {chartStats.mostActiveUsers.map((_, index) => (
                              <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              )}

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
