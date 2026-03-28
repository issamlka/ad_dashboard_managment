import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { auditLogService } from "../services/api";
import { auditLogsStyles } from "../styles/auditLogs.styles";
import { showToast } from "../utils/toast";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: "",
    performedBy: "",
    status: "",
  });

  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  const loadLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await auditLogService.getAll({
        ...filters,
        page,
        pageSize: 8,
      });
      setLogs(response.data.logs);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      showToast.error("❌ Failed to load audit logs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getActionStyle = (action) => {
    const map = {
      LOGIN: auditLogsStyles.actionLogin,
      CREATE_DB_USER: auditLogsStyles.actionCreate,
      EDIT_DB_USER: auditLogsStyles.actionEdit,
      DELETE_DB_USER: auditLogsStyles.actionDelete,
      CREATE_AD_USER: auditLogsStyles.actionCreate,
      DISABLE_AD_USER: auditLogsStyles.actionDisable,
      ENABLE_AD_USER: auditLogsStyles.actionEnable,
      LOGOUT: auditLogsStyles.actionLogin,
      CREATE_AD_GROUP: auditLogsStyles.actionCreate,
      ADD_USER_TO_GROUP: auditLogsStyles.actionCreate,
      REMOVE_USER_FROM_GROUP: auditLogsStyles.actionDelete,
    };
    return map[action] || auditLogsStyles.actionLogin;
  };

  const getActionIcon = (action) => {
    const map = {
      LOGIN: "",
      CREATE_DB_USER: "",
      EDIT_DB_USER: "",
      DELETE_DB_USER: "",
      CREATE_AD_USER: "",
      DISABLE_AD_USER: "",
      ENABLE_AD_USER: "",
      LOGOUT: "",
      CREATE_AD_GROUP: "",
      ADD_USER_TO_GROUP: "",
      REMOVE_USER_FROM_GROUP: "",
    };
    return map[action] || "";
  };

  return (
    <div style={auditLogsStyles.wrapper}>
      <Sidebar />
      <div style={auditLogsStyles.mainContent}>
        <Navbar title="Audit Logs" />
        <div style={auditLogsStyles.pageContent}>
          {/* Page Title */}
          <div style={auditLogsStyles.pageTitleRow}>
            <div>
              <h1 style={auditLogsStyles.pageTitle}>Audit Logs</h1>
              <p style={auditLogsStyles.pageSubtitle}>
                {total} total actions recorded
              </p>
            </div>
            <button
              style={{
                background: "white",
                border: "1px solid #3498db",
                color: "#3498db",
                borderRadius: "8px",
                padding: "8px 18px",
                cursor: refreshing ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                opacity: refreshing ? 0.7 : 1,
              }}
              onClick={() => loadLogs(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </button>
          </div>

          {/* Filters */}
          <div style={auditLogsStyles.filtersRow}>
            <select
              style={auditLogsStyles.filterSelect}
              value={filters.action}
              onChange={(e) => {
                setFilters({ ...filters, action: e.target.value });
                setPage(1);
              }}
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="CREATE_DB_USER">Create DB User</option>
              <option value="EDIT_DB_USER">Edit DB User</option>
              <option value="DELETE_DB_USER">Delete DB User</option>
              <option value="CREATE_AD_USER">Create AD User</option>
              <option value="DISABLE_AD_USER">Disable AD User</option>
              <option value="ENABLE_AD_USER">Enable AD User</option>
              <option value="CREATE_AD_GROUP">Create AD Group</option>
              <option value="ADD_USER_TO_GROUP">Add to Group</option>
              <option value="REMOVE_USER_FROM_GROUP">Remove from Group</option>
            </select>

            <select
              style={auditLogsStyles.filterSelect}
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>

            <input
              style={auditLogsStyles.filterInput}
              placeholder="Filter by user..."
              value={filters.performedBy}
              onChange={(e) => {
                setFilters({ ...filters, performedBy: e.target.value });
                setPage(1);
              }}
            />

            <button
              style={auditLogsStyles.clearBtn}
              onClick={() => {
                setFilters({ action: "", performedBy: "", status: "" });
                setPage(1);
              }}
            >
              ✕ Clear
            </button>
          </div>

          {/* Table */}
          <div style={auditLogsStyles.tableCard}>
            <div style={auditLogsStyles.tableHeader}>
              <div style={auditLogsStyles.tableTitle}>
                Showing {logs.length} of {total} logs
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2 text-muted">Loading audit logs...</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={auditLogsStyles.tableHead}>
                      <tr>
                        <th style={auditLogsStyles.th}>#</th>
                        <th style={auditLogsStyles.th}>Action</th>
                        <th style={auditLogsStyles.th}>Performed By</th>
                        <th style={auditLogsStyles.th}>Target</th>
                        <th style={auditLogsStyles.th}>Details</th>
                        <th style={auditLogsStyles.th}>IP Address</th>
                        <th style={auditLogsStyles.th}>Status</th>
                        <th style={auditLogsStyles.th}>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            style={{
                              textAlign: "center",
                              padding: "40px",
                              color: "#7f8c8d",
                            }}
                          >
                            No logs found
                          </td>
                        </tr>
                      ) : (
                        logs.map((log, index) => (
                          <tr key={log.id}>
                            <td style={auditLogsStyles.td}>
                              {(page - 1) * 8 + index + 1}
                            </td>
                            <td style={auditLogsStyles.td}>
                              <span
                                style={{
                                  ...auditLogsStyles.actionBadge,
                                  ...getActionStyle(log.action),
                                }}
                              >
                                {getActionIcon(log.action)}{" "}
                                {log.action.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td style={auditLogsStyles.td}>
                              <strong>{log.performedBy}</strong>
                            </td>
                            <td style={auditLogsStyles.td}>{log.target}</td>
                            <td style={auditLogsStyles.td}>{log.details}</td>
                            <td style={auditLogsStyles.td}>{log.ipAddress}</td>
                            <td style={auditLogsStyles.td}>
                              <span
                                style={{
                                  ...auditLogsStyles.badge,
                                  ...(log.status === "SUCCESS"
                                    ? auditLogsStyles.badgeSuccess
                                    : auditLogsStyles.badgeFailed),
                                }}
                              >
                                {log.status === "SUCCESS"
                                  ? "Success"
                                  : "Failed"}
                              </span>
                            </td>
                            <td style={auditLogsStyles.td}>
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={auditLogsStyles.pagination}>
                    <button
                      style={auditLogsStyles.pageBtn}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalPages ||
                          (p >= page - 1 && p <= page + 1),
                      )
                      .map((p, idx, arr) => (
                        <>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span style={{ color: "#7f8c8d" }}>...</span>
                          )}
                          <button
                            key={p}
                            style={
                              p === page
                                ? auditLogsStyles.pageBtnActive
                                : auditLogsStyles.pageBtn
                            }
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </button>
                        </>
                      ))}
                    <button
                      style={auditLogsStyles.pageBtn}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div style={auditLogsStyles.footer}>
          {new Date().getFullYear()} - User Management Dashboard
        </div>
      </div>
    </div>
  );
}
