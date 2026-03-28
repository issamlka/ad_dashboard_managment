import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { adGroupsService, adService } from "../services/api";
import { adGroupsStyles } from "../styles/adGroups.styles";
import { showToast } from "../utils/toast";
import { useRole } from "../hooks/useRole";
import { useModalKeyboard } from "../hooks/useModalKeyboard";

export default function AdGroups() {
  const { isAdmin } = useRole();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [selectedUsername, setSelectedUsername] = useState("");

  useModalKeyboard({
    isOpen: showCreateModal,
    onEscape: () => {
      setShowCreateModal(false);
      setNewGroup({ name: "", description: "" });
    },
    onEnter: handleCreateGroup,
  });

  useModalKeyboard({
    isOpen: showAddMemberModal,
    onEscape: () => setShowAddMemberModal(false),
    onEnter: handleAddMember,
  });

  useEffect(() => {
    loadGroups();
    loadAllUsers();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await adGroupsService.getAll();
      setGroups(response.data);
    } catch (err) {
      showToast.error("❌ Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await adService.getAll();
      setAllUsers(response.data);
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    try {
      setMembersLoading(true);
      const response = await adGroupsService.getMembers(group.name);
      setMembers(response.data);
    } catch (err) {
      showToast.error("❌ Failed to load group members");
    } finally {
      setMembersLoading(false);
    }
  };

  function handleCreateGroup() {
    if (!newGroup.name) {
      showToast.error("❌ Group name is required");
      return;
    }
    (async () => {
      try {
        setActionLoading("creating");
        await adGroupsService.create(newGroup);
        showToast.success(`✅ Group ${newGroup.name} created successfully!`);
        setShowCreateModal(false);
        setNewGroup({ name: "", description: "" });
        await loadGroups();
      } catch (err) {
        showToast.error("❌ Failed to create group");
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
        setActionLoading("adding");
        await adGroupsService.addMember(selectedGroup.name, selectedUsername);
        showToast.success(
          `✅ User ${selectedUsername} added to ${selectedGroup.name}!`,
        );
        setShowAddMemberModal(false);
        setSelectedUsername("");
        await handleSelectGroup(selectedGroup);
        await loadGroups();
      } catch (err) {
        showToast.error("❌ Failed to add user to group");
      } finally {
        setActionLoading("");
      }
    })();
  }

  const handleRemoveMember = async (username) => {
    try {
      setActionLoading(username);
      await adGroupsService.removeMember(selectedGroup.name, username);
      showToast.success(
        `✅ User ${username} removed from ${selectedGroup.name}!`,
      );
      await handleSelectGroup(selectedGroup);
      await loadGroups();
    } catch (err) {
      showToast.error("❌ Failed to remove user from group");
    } finally {
      setActionLoading("");
    }
  };

  // Filter users not already in the group
  const availableUsers = allUsers.filter(
    (u) => !members.some((m) => m.username === u.username),
  );

  return (
    <div style={adGroupsStyles.wrapper}>
      <Sidebar />
      <div style={adGroupsStyles.mainContent}>
        <Navbar title="AD Group Management" />
        <div style={adGroupsStyles.pageContent}>
          {/* Page Title */}
          <div style={adGroupsStyles.pageTitleRow}>
            <div>
              <h1 style={adGroupsStyles.pageTitle}>AD Group Management</h1>
              <p style={adGroupsStyles.pageSubtitle}>
                {groups.length} groups in <strong>ad.issam.com</strong>
              </p>
            </div>
            {isAdmin && (
              <button
                style={adGroupsStyles.addBtn}
                onClick={() => setShowCreateModal(true)}
              >
                + Create Group
              </button>
            )}
          </div>

          {/* Groups Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2 text-muted">Loading groups...</p>
            </div>
          ) : (
            <div style={adGroupsStyles.grid}>
              {groups.map((group) => (
                <div
                  key={group.name}
                  style={
                    selectedGroup?.name === group.name
                      ? adGroupsStyles.groupCardActive
                      : adGroupsStyles.groupCard
                  }
                  onClick={() => handleSelectGroup(group)}
                >
                  <div style={adGroupsStyles.groupIcon}>👥</div>
                  <div style={adGroupsStyles.groupName}>{group.name}</div>
                  <div style={adGroupsStyles.groupDescription}>
                    {group.description || "No description"}
                  </div>
                  <span style={adGroupsStyles.groupMemberCount}>
                    {group.memberCount} members
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Members Table */}
          {selectedGroup && (
            <div style={adGroupsStyles.tableCard}>
              <div style={adGroupsStyles.tableHeader}>
                <div style={adGroupsStyles.tableTitle}>
                  👥 {selectedGroup.name} — Members ({members.length})
                </div>
                {isAdmin && (
                  <button
                    style={adGroupsStyles.addMemberBtn}
                    onClick={() => setShowAddMemberModal(true)}
                  >
                    + Add Member
                  </button>
                )}
              </div>

              {membersLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={adGroupsStyles.tableHead}>
                      <tr>
                        <th style={adGroupsStyles.th}>#</th>
                        <th style={adGroupsStyles.th}>Username</th>
                        <th style={adGroupsStyles.th}>Full Name</th>
                        <th style={adGroupsStyles.th}>Email</th>
                        <th style={adGroupsStyles.th}>Status</th>
                        {isAdmin && <th style={adGroupsStyles.th}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {members.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            style={{
                              textAlign: "center",
                              padding: "30px",
                              color: "#7f8c8d",
                            }}
                          >
                            No members in this group
                          </td>
                        </tr>
                      ) : (
                        members.map((member, index) => (
                          <tr key={member.username}>
                            <td style={adGroupsStyles.td}>{index + 1}</td>
                            <td style={adGroupsStyles.td}>
                              <strong>{member.username}</strong>
                            </td>
                            <td style={adGroupsStyles.td}>{member.fullName}</td>
                            <td style={adGroupsStyles.td}>
                              {member.email || "—"}
                            </td>
                            <td style={adGroupsStyles.td}>
                              <span
                                style={{
                                  ...adGroupsStyles.badge,
                                  ...(member.isEnabled
                                    ? adGroupsStyles.badgeEnabled
                                    : adGroupsStyles.badgeDisabled),
                                }}
                              >
                                {member.isEnabled ? "● Active" : "● Disabled"}
                              </span>
                            </td>
                            {isAdmin && (
                              <td style={adGroupsStyles.td}>
                                <button
                                  style={adGroupsStyles.removeBtn}
                                  onClick={() =>
                                    handleRemoveMember(member.username)
                                  }
                                  disabled={actionLoading === member.username}
                                >
                                  {actionLoading === member.username ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : (
                                    "Remove"
                                  )}
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={adGroupsStyles.footer}>
          {new Date().getFullYear()} - User Management Dashboard
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div style={adGroupsStyles.modalOverlay}>
          <div style={adGroupsStyles.modalCard}>
            <h3 style={adGroupsStyles.modalTitle}>➕ Create AD Group</h3>
            <p style={adGroupsStyles.modalSubtitle}>
              Create a new security group in Active Directory
            </p>

            <label style={adGroupsStyles.modalLabel}>Group Name</label>
            <input
              style={adGroupsStyles.modalInput}
              placeholder="e.g. IT Department"
              value={newGroup.name}
              onChange={(e) =>
                setNewGroup({ ...newGroup, name: e.target.value })
              }
            />

            <label style={adGroupsStyles.modalLabel}>
              Description (optional)
            </label>
            <input
              style={adGroupsStyles.modalInput}
              placeholder="e.g. IT Department users"
              value={newGroup.description}
              onChange={(e) =>
                setNewGroup({ ...newGroup, description: e.target.value })
              }
            />

            <div style={adGroupsStyles.modalFooter}>
              <button
                style={adGroupsStyles.cancelBtn}
                onClick={() => {
                  setShowCreateModal(false);
                  setNewGroup({ name: "", description: "" });
                }}
              >
                Cancel
              </button>
              <button
                style={adGroupsStyles.submitBtn}
                onClick={handleCreateGroup}
                disabled={actionLoading === "creating"}
              >
                {actionLoading === "creating" ? (
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

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div style={adGroupsStyles.modalOverlay}>
          <div style={adGroupsStyles.modalCard}>
            <h3 style={adGroupsStyles.modalTitle}>➕ Add Member</h3>
            <p style={adGroupsStyles.modalSubtitle}>
              Add a user to <strong>{selectedGroup?.name}</strong>
            </p>

            <label style={adGroupsStyles.modalLabel}>Select User</label>
            <select
              style={adGroupsStyles.modalSelect}
              value={selectedUsername}
              onChange={(e) => setSelectedUsername(e.target.value)}
            >
              <option value="">— Select a user —</option>
              {availableUsers.map((user) => (
                <option key={user.username} value={user.username}>
                  {user.username} ({user.fullName})
                </option>
              ))}
            </select>

            {availableUsers.length === 0 && (
              <p style={{ color: "#7f8c8d", fontSize: "13px" }}>
                All users are already members of this group
              </p>
            )}

            <div style={adGroupsStyles.modalFooter}>
              <button
                style={adGroupsStyles.cancelBtn}
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedUsername("");
                }}
              >
                Cancel
              </button>
              <button
                style={adGroupsStyles.submitBtn}
                onClick={handleAddMember}
                disabled={actionLoading === "adding" || !selectedUsername}
              >
                {actionLoading === "adding" ? (
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
