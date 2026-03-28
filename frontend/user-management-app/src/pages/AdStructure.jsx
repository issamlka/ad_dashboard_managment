import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { adStructureService, adService } from "../services/api";
import { adStructureStyles } from "../styles/adStructure.styles";
import { showToast } from "../utils/toast";
import { useModalKeyboard } from "../hooks/useModalKeyboard";

export default function AdStructure() {
  const [activeTab, setActiveTab] = useState("groups");
  const [groups, setGroups] = useState([]);
  const [ous, setOUs] = useState([]);
  const [adUsers, setAdUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedOU, setSelectedOU] = useState(null);
  const [ouUsers, setOuUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  // Modals
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showCreateOUModal, setShowCreateOUModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Forms
  const [groupForm, setGroupForm] = useState({ name: "", description: "" });
  const [ouForm, setOuForm] = useState({ name: "", description: "" });
  const [selectedUsername, setSelectedUsername] = useState("");

  // Keyboard shortcuts
  useModalKeyboard({
    isOpen: showCreateGroupModal,
    onEscape: () => {
      setShowCreateGroupModal(false);
      setGroupForm({ name: "", description: "" });
    },
    onEnter: handleCreateGroup,
  });

  useModalKeyboard({
    isOpen: showCreateOUModal,
    onEscape: () => {
      setShowCreateOUModal(false);
      setOuForm({ name: "", description: "" });
    },
    onEnter: handleCreateOU,
  });

  useModalKeyboard({
    isOpen: showAddMemberModal,
    onEscape: () => {
      setShowAddMemberModal(false);
      setSelectedUsername("");
    },
    onEnter: handleAddMember,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupsRes, ousRes, usersRes] = await Promise.all([
        adStructureService.getGroups(),
        adStructureService.getOUs(),
        adService.getAll(),
      ]);
      setGroups(groupsRes.data);
      setOUs(ousRes.data.filter((ou) => ou.name !== "Domain Controllers"));
      setAdUsers(usersRes.data);
    } catch (err) {
      showToast.error("❌ Failed to load AD structure");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
  };

  const handleSelectOU = async (ou) => {
    setSelectedOU(ou);
    try {
      const response = await adStructureService.getUsersInOU(
        ou.distinguishedName,
      );
      setOuUsers(response.data);
    } catch (err) {
      setOuUsers([]);
    }
  };

  function handleCreateGroup() {
    if (!groupForm.name) {
      showToast.error("❌ Group name is required");
      return;
    }
    (async () => {
      try {
        setActionLoading("creating-group");
        await adStructureService.createGroup(groupForm);
        showToast.success(`✅ Group ${groupForm.name} created!`);
        setShowCreateGroupModal(false);
        setGroupForm({ name: "", description: "" });
        await loadData();
      } catch (err) {
        showToast.error("❌ Failed to create group");
      } finally {
        setActionLoading("");
      }
    })();
  }

  function handleCreateOU() {
    if (!ouForm.name) {
      showToast.error("❌ OU name is required");
      return;
    }
    (async () => {
      try {
        setActionLoading("creating-ou");
        await adStructureService.createOU(ouForm);
        showToast.success(`✅ OU ${ouForm.name} created!`);
        setShowCreateOUModal(false);
        setOuForm({ name: "", description: "" });
        await loadData();
      } catch (err) {
        showToast.error("❌ Failed to create OU");
      } finally {
        setActionLoading("");
      }
    })();
  }

  function handleAddMember() {
    if (!selectedUsername) {
      showToast.error("❌ Please select a user");
      return;
    }
    (async () => {
      try {
        setActionLoading("adding-member");
        await adStructureService.addUserToGroup(
          selectedGroup.name,
          selectedUsername,
        );
        showToast.success(
          `✅ ${selectedUsername} added to ${selectedGroup.name}`,
        );
        setShowAddMemberModal(false);
        setSelectedUsername("");
        await loadData();
        // Refresh selected group
        const updated = await adStructureService.getGroups();
        const refreshed = updated.data.find(
          (g) => g.name === selectedGroup.name,
        );
        if (refreshed) setSelectedGroup(refreshed);
      } catch (err) {
        showToast.error("❌ Failed to add member");
      } finally {
        setActionLoading("");
      }
    })();
  }

  const handleRemoveMember = async (username) => {
    try {
      setActionLoading(username);
      await adStructureService.removeUserFromGroup(
        selectedGroup.name,
        username,
      );
      showToast.success(`✅ ${username} removed from ${selectedGroup.name}`);
      await loadData();
      const updated = await adStructureService.getGroups();
      const refreshed = updated.data.find((g) => g.name === selectedGroup.name);
      if (refreshed) setSelectedGroup(refreshed);
    } catch (err) {
      showToast.error("❌ Failed to remove member");
    } finally {
      setActionLoading("");
    }
  };

  // Filter out users already in the group
  const availableUsers = adUsers.filter(
    (u) => !selectedGroup?.members.includes(u.username),
  );

  const tabs = [
    { key: "groups", label: "Groups", count: groups.length },
    { key: "ous", label: "OUs", count: ous.length },
  ];

  return (
    <div style={adStructureStyles.wrapper}>
      <Sidebar />
      <div style={adStructureStyles.mainContent}>
        <Navbar title="AD Structure" />
        <div style={adStructureStyles.pageContent}>
          {/* Page Title */}
          <div style={adStructureStyles.pageTitleRow}>
            <div>
              <h1 style={adStructureStyles.pageTitle}>AD Structure</h1>
              <p style={adStructureStyles.pageSubtitle}>
                Manage Groups and Organizational Units
              </p>
            </div>
            {activeTab === "groups" && (
              <button
                style={adStructureStyles.createBtn}
                onClick={() => setShowCreateGroupModal(true)}
              >
                + Create Group
              </button>
            )}
            {activeTab === "ous" && (
              <button
                style={adStructureStyles.createBtn}
                onClick={() => setShowCreateOUModal(true)}
              >
                + Create OU
              </button>
            )}
          </div>

          {/* Tabs */}
          <div style={adStructureStyles.tabsRow}>
            {tabs.map((tab) => (
              <div
                key={tab.key}
                style={
                  activeTab === tab.key
                    ? adStructureStyles.tabActive
                    : adStructureStyles.tab
                }
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedGroup(null);
                  setSelectedOU(null);
                }}
              >
                {tab.label} ({tab.count})
              </div>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">Loading AD structure...</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* Left — Groups/OUs list */}
              <div>
                {activeTab === "groups" && (
                  <>
                    <div style={adStructureStyles.cardsGrid}>
                      {groups.map((group) => (
                        <div
                          key={group.name}
                          style={
                            selectedGroup?.name === group.name
                              ? adStructureStyles.cardActive
                              : adStructureStyles.card
                          }
                          onClick={() => handleSelectGroup(group)}
                        >
                          <div style={adStructureStyles.cardName}>
                            {group.name}
                          </div>
                          <div style={adStructureStyles.cardDesc}>
                            {group.description || "No description"}
                          </div>
                          <span style={adStructureStyles.cardBadge}>
                            {group.memberCount} members
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === "ous" && (
                  <>
                    <div style={adStructureStyles.cardsGrid}>
                      {ous.map((ou) => (
                        <div
                          key={ou.distinguishedName}
                          style={
                            selectedOU?.name === ou.name
                              ? adStructureStyles.cardActive
                              : adStructureStyles.card
                          }
                          onClick={() => handleSelectOU(ou)}
                        >
                          <div style={adStructureStyles.cardName}>
                            📁 {ou.name}
                          </div>
                          {/* <div style={adStructureStyles.cardDesc}>
                            {ou.distinguishedName}
                          </div> */}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right — Members/Users panel */}
              <div>
                {activeTab === "groups" && selectedGroup && (
                  <div style={adStructureStyles.membersPanel}>
                    <div style={adStructureStyles.membersPanelHeader}>
                      <div>
                        <div style={adStructureStyles.membersPanelTitle}>
                          {selectedGroup.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#7f8c8d",
                            marginTop: "3px",
                          }}
                        >
                          {selectedGroup.memberCount} members
                        </div>
                      </div>
                      <button
                        style={adStructureStyles.addBtn}
                        onClick={() => setShowAddMemberModal(true)}
                      >
                        + Add Member
                      </button>
                    </div>

                    {selectedGroup.members.length === 0 ? (
                      <div style={adStructureStyles.emptyState}>
                        No members in this group yet
                      </div>
                    ) : (
                      selectedGroup.members.map((member) => (
                        <div key={member} style={adStructureStyles.memberRow}>
                          <div style={adStructureStyles.memberName}>
                            👤 {member}
                          </div>
                          <button
                            style={adStructureStyles.removeBtn}
                            onClick={() => handleRemoveMember(member)}
                            disabled={actionLoading === member}
                          >
                            {actionLoading === member ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              "✕ Remove"
                            )}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "ous" && selectedOU && (
                  <div style={adStructureStyles.membersPanel}>
                    <div style={adStructureStyles.membersPanelHeader}>
                      <div>
                        <div style={adStructureStyles.membersPanelTitle}>
                          📁 {selectedOU.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#7f8c8d",
                            marginTop: "3px",
                          }}
                        >
                          {ouUsers.length} users
                        </div>
                      </div>
                    </div>

                    {ouUsers.length === 0 ? (
                      <div style={adStructureStyles.emptyState}>
                        No users in this OU yet
                      </div>
                    ) : (
                      ouUsers.map((user) => (
                        <div
                          key={user.username}
                          style={adStructureStyles.memberRow}
                        >
                          <div>
                            <div style={adStructureStyles.memberName}>
                              👤 {user.username}
                            </div>
                            <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                              {user.fullName}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {!selectedGroup && !selectedOU && (
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      padding: "60px 40px",
                      textAlign: "center",
                      color: "#7f8c8d",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "15px" }}>
                      {activeTab === "groups" ? "👥" : "📁"}
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        marginBottom: "8px",
                      }}
                    >
                      Select a {activeTab === "groups" ? "Group" : "OU"}
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      Click on any {activeTab === "groups" ? "group" : "OU"} on
                      the left to see details
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={adStructureStyles.footer}>
          {new Date().getFullYear()} - User Management Dashboard
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div style={adStructureStyles.modalOverlay}>
          <div style={adStructureStyles.modalCard}>
            <h3 style={adStructureStyles.modalTitle}>➕ Create Group</h3>
            <p style={adStructureStyles.modalSubtitle}>
              Create a new AD security group
            </p>
            <label style={adStructureStyles.modalLabel}>Group Name</label>
            <input
              style={adStructureStyles.modalInput}
              placeholder="e.g. Dev-Team"
              value={groupForm.name}
              onChange={(e) =>
                setGroupForm({ ...groupForm, name: e.target.value })
              }
            />
            <label style={adStructureStyles.modalLabel}>
              Description (optional)
            </label>
            <input
              style={adStructureStyles.modalInput}
              placeholder="e.g. Development team members"
              value={groupForm.description}
              onChange={(e) =>
                setGroupForm({ ...groupForm, description: e.target.value })
              }
            />
            <div style={adStructureStyles.modalFooter}>
              <button
                style={adStructureStyles.cancelBtn}
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setGroupForm({ name: "", description: "" });
                }}
              >
                Cancel
              </button>
              <button
                style={adStructureStyles.submitBtn}
                onClick={handleCreateGroup}
                disabled={actionLoading === "creating-group"}
              >
                {actionLoading === "creating-group" ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating...
                  </>
                ) : (
                  "Create Group"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create OU Modal */}
      {showCreateOUModal && (
        <div style={adStructureStyles.modalOverlay}>
          <div style={adStructureStyles.modalCard}>
            <h3 style={adStructureStyles.modalTitle}>📁 Create OU</h3>
            <p style={adStructureStyles.modalSubtitle}>
              Create a new Organizational Unit
            </p>
            <label style={adStructureStyles.modalLabel}>OU Name</label>
            <input
              style={adStructureStyles.modalInput}
              placeholder="e.g. Finance Department"
              value={ouForm.name}
              onChange={(e) => setOuForm({ ...ouForm, name: e.target.value })}
            />
            <label style={adStructureStyles.modalLabel}>
              Description (optional)
            </label>
            <input
              style={adStructureStyles.modalInput}
              placeholder="e.g. Finance department users"
              value={ouForm.description}
              onChange={(e) =>
                setOuForm({ ...ouForm, description: e.target.value })
              }
            />
            <div style={adStructureStyles.modalFooter}>
              <button
                style={adStructureStyles.cancelBtn}
                onClick={() => {
                  setShowCreateOUModal(false);
                  setOuForm({ name: "", description: "" });
                }}
              >
                Cancel
              </button>
              <button
                style={adStructureStyles.submitBtn}
                onClick={handleCreateOU}
                disabled={actionLoading === "creating-ou"}
              >
                {actionLoading === "creating-ou" ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating...
                  </>
                ) : (
                  "Create OU"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div style={adStructureStyles.modalOverlay}>
          <div style={adStructureStyles.modalCard}>
            <h3 style={adStructureStyles.modalTitle}>➕ Add Member</h3>
            <p style={adStructureStyles.modalSubtitle}>
              Add a user to <strong>{selectedGroup?.name}</strong>
            </p>
            <label style={adStructureStyles.modalLabel}>Select User</label>
            <select
              style={adStructureStyles.modalSelect}
              value={selectedUsername}
              onChange={(e) => setSelectedUsername(e.target.value)}
            >
              <option value="">-- Select a user --</option>
              {availableUsers.map((user) => (
                <option key={user.username} value={user.username}>
                  {user.username} — {user.fullName}
                </option>
              ))}
            </select>
            <div style={adStructureStyles.modalFooter}>
              <button
                style={adStructureStyles.cancelBtn}
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedUsername("");
                }}
              >
                Cancel
              </button>
              <button
                style={adStructureStyles.submitBtn}
                onClick={handleAddMember}
                disabled={
                  actionLoading === "adding-member" || !selectedUsername
                }
              >
                {actionLoading === "adding-member" ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Adding...
                  </>
                ) : (
                  "Add Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
