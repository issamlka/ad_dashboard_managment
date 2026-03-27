export const dashboardStyles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  mainContent: {
    marginLeft: "250px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  pageContent: {
    padding: "25px",
    flex: 1,
  },
  pageTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "5px",
  },
  pageSubtitle: {
    color: "#7f8c8d",
    fontSize: "14px",
    marginBottom: "0",
  },
  refreshBtn: {
    background: "white",
    border: "1px solid #3498db",
    color: "#3498db",
    borderRadius: "8px",
    padding: "8px 18px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  refreshBtnDisabled: {
    background: "#f0f0f0",
    border: "1px solid #ccc",
    color: "#999",
    borderRadius: "8px",
    padding: "8px 18px",
    cursor: "not-allowed",
    fontSize: "14px",
    fontWeight: "500",
  },
  loadingBox: {
    textAlign: "center",
    padding: "60px 0",
  },
  loadingText: {
    color: "#7f8c8d",
    marginTop: "10px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    borderRadius: "12px",
    padding: "20px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  statCardBlue: {
    background: "linear-gradient(135deg, #3498db, #2980b9)",
  },
  statCardGreen: {
    background: "linear-gradient(135deg, #2ecc71, #27ae60)",
  },
  statCardOrange: {
    background: "linear-gradient(135deg, #e67e22, #d35400)",
  },
  statCardRed: {
    background: "linear-gradient(135deg, #e74c3c, #c0392b)",
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "13px",
    opacity: 0.9,
    marginTop: "5px",
  },
  statIcon: {
    fontSize: "40px",
    opacity: 0.8,
  },
  tableCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "20px 25px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  tableHead: {
    backgroundColor: "#f8f9fa",
  },
  th: {
    padding: "12px 20px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#7f8c8d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "14px 20px",
    fontSize: "14px",
    color: "#2c3e50",
    verticalAlign: "middle",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  badgeEnabled: {
    backgroundColor: "#eafaf1",
    color: "#27ae60",
  },
  badgeDisabled: {
    backgroundColor: "#fdecea",
    color: "#e74c3c",
  },
  footer: {
    textAlign: "center",
    padding: "15px",
    color: "#95a5a6",
    fontSize: "13px",
    borderTop: "1px solid #f0f0f0",
    backgroundColor: "white",
  },

  // Add to existing dashboard.styles.js
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    padding: "20px",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "20px",
  },
  statCardEnhanced: {
    borderRadius: "12px",
    padding: "20px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  statSubLabel: {
    fontSize: "11px",
    opacity: 0.8,
    marginTop: "3px",
  },
};
