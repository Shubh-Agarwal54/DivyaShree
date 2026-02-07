import { useEffect, useState } from 'react';
import { Shield, Users, CheckCircle, XCircle, Edit2, Save, X as CloseIcon } from 'lucide-react';
import api from '@/services/axios';

const RolePermissions = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [usersByRole, setUsersByRole] = useState({});
  const [loading, setLoading] = useState(true);
  const [myPermissions, setMyPermissions] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchMyPermissions();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchUsersByRole(selectedRole.roleName);
    }
  }, [selectedRole]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/permissions');
      setRoles(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedRole(response.data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPermissions = async () => {
    try {
      const response = await api.get('/admin/permissions/my');
      setMyPermissions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch my permissions:', error);
    }
  };

  const fetchUsersByRole = async (roleName) => {
    try {
      const response = await api.get(`/admin/permissions/${roleName}/users`);
      setUsersByRole({ ...usersByRole, [roleName]: response.data.data.users });
    } catch (error) {
      console.error('Failed to fetch users by role:', error);
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setPermissions(JSON.parse(JSON.stringify(role.permissions)));
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setPermissions(null);
  };

  const handleSavePermissions = async () => {
    try {
      await api.put(`/admin/permissions/${editingRole.roleName}`, {
        permissions,
        description: editingRole.description,
      });
      
      setEditingRole(null);
      setPermissions(null);
      fetchRoles();
      alert('Permissions updated successfully');
    } catch (error) {
      console.error('Failed to update permissions:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update permissions';
      alert(errorMessage);
    }
  };

  const togglePermission = (resource, action) => {
    setPermissions({
      ...permissions,
      [resource]: {
        ...permissions[resource],
        [action]: !permissions[resource][action],
      },
    });
  };

  const permissionResources = [
    { key: 'dashboard', label: 'Dashboard', actions: ['view'] },
    { key: 'users', label: 'Users', actions: ['view', 'create', 'edit', 'delete', 'block'] },
    { key: 'orders', label: 'Orders', actions: ['view', 'create', 'edit', 'delete', 'updateStatus', 'cancel'] },
    { key: 'products', label: 'Products', actions: ['view', 'create', 'edit', 'delete', 'updateStock'] },
    { key: 'inventory', label: 'Inventory', actions: ['view', 'manage', 'lowStockAlerts'] },
    { key: 'analytics', label: 'Analytics', actions: ['view'] },
    { key: 'settings', label: 'Settings', actions: ['view', 'edit'] },
    { key: 'rolePermissions', label: 'Role Permissions', actions: ['view', 'manage'] },
  ];

  const getRoleBadgeClass = (roleName) => {
    const classes = {
      superadmin: 'roleperm-badge-superadmin',
      masteradmin: 'roleperm-badge-masteradmin',
      subadmin: 'roleperm-badge-subadmin',
      admin: 'roleperm-badge-admin',
    };
    return classes[roleName] || 'roleperm-badge-default';
  };

  const formatActionLabel = (action) => {
    const labels = {
      view: 'View',
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
      block: 'Block',
      updateStatus: 'Update Status',
      cancel: 'Cancel',
      updateStock: 'Update Stock',
      manage: 'Manage',
      lowStockAlerts: 'Low Stock Alerts',
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <div className="roleperm-loading-container">
        <div className="roleperm-spinner"></div>
      </div>
    );
  }

  const canManagePermissions = myPermissions?.permissions?.rolePermissions?.manage;

  return (
    <div className="roleperm-management-container">
      {/* Header */}
      <div className="roleperm-header-section">
        <div>
          <h1 className="roleperm-main-title">Role & Permissions</h1>
          <p className="roleperm-subtitle">Manage role-based access control for admin users</p>
        </div>
      </div>

      <div className="roleperm-content-grid">
        {/* Roles List */}
        <div className="roleperm-roles-panel">
          <h2 className="roleperm-panel-title">Roles</h2>
          <div className="roleperm-roles-list">
            {roles.map((role) => (
              <div
                key={role._id}
                onClick={() => setSelectedRole(role)}
                className={`roleperm-role-card ${selectedRole?._id === role._id ? 'roleperm-role-card-active' : ''}`}
              >
                <div className="roleperm-role-header">
                  <div className="roleperm-role-icon">
                    <Shield size={20} />
                  </div>
                  <div className="roleperm-role-info">
                    <h3 className="roleperm-role-name">{role.roleName}</h3>
                    <p className="roleperm-role-description">{role.description}</p>
                  </div>
                </div>
                <span className={`roleperm-badge ${getRoleBadgeClass(role.roleName)}`}>
                  {usersByRole[role.roleName]?.length} users
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Details */}
        <div className="roleperm-details-panel">
          {selectedRole && (
            <>
              <div className="roleperm-details-header">
                <div>
                  <h2 className="roleperm-details-title">{selectedRole.roleName}</h2>
                  <p className="roleperm-details-subtitle">{selectedRole.description}</p>
                </div>
                {canManagePermissions && !editingRole && (
                  <button
                    onClick={() => handleEditRole(selectedRole)}
                    className="roleperm-edit-button"
                  >
                    <Edit2 size={16} />
                    Edit Permissions
                  </button>
                )}
                {editingRole && editingRole._id === selectedRole._id && (
                  <div className="roleperm-edit-actions">
                    <button onClick={handleCancelEdit} className="roleperm-cancel-button">
                      <CloseIcon size={16} />
                      Cancel
                    </button>
                    <button onClick={handleSavePermissions} className="roleperm-save-button">
                      <Save size={16} />
                      Save
                    </button>
                  </div>
                )}
              </div>

              {/* Permissions Table */}
              <div className="roleperm-table-container">
                <table className="roleperm-table">
                  <thead>
                    <tr className="roleperm-table-header">
                      <th className="roleperm-th">Resource</th>
                      <th className="roleperm-th">Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissionResources.map((resource) => {
                      const currentPermissions = editingRole && editingRole._id === selectedRole._id 
                        ? permissions[resource.key] 
                        : selectedRole.permissions[resource.key];

                      return (
                        <tr key={resource.key} className="roleperm-table-row">
                          <td className="roleperm-td roleperm-resource-cell">
                            <span className="roleperm-resource-label">{resource.label}</span>
                          </td>
                          <td className="roleperm-td">
                            <div className="roleperm-actions-grid">
                              {resource.actions.map((action) => {
                                const hasPermission = currentPermissions?.[action];
                                const isEditing = editingRole && editingRole._id === selectedRole._id;

                                return (
                                  <div
                                    key={action}
                                    onClick={() => isEditing && togglePermission(resource.key, action)}
                                    className={`roleperm-permission-tag ${
                                      hasPermission ? 'roleperm-permission-granted' : 'roleperm-permission-denied'
                                    } ${isEditing ? 'roleperm-permission-editable' : ''}`}
                                  >
                                    {hasPermission ? (
                                      <CheckCircle size={14} />
                                    ) : (
                                      <XCircle size={14} />
                                    )}
                                    <span>{formatActionLabel(action)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Users List */}
              <div className="roleperm-users-section">
                <h3 className="roleperm-section-title">
                  <Users size={18} />
                  Users with {selectedRole.roleName} role
                </h3>
                {usersByRole[selectedRole.roleName]?.length > 0 ? (
                  <div className="roleperm-users-grid">
                    {usersByRole[selectedRole.roleName].map((user) => (
                      <div key={user._id} className="roleperm-user-card">
                        <div className="roleperm-user-avatar">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div className="roleperm-user-info">
                          <p className="roleperm-user-name">{user.firstName} {user.lastName}</p>
                          <p className="roleperm-user-email">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="roleperm-empty-text">No users with this role</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .roleperm-management-container {
          padding-bottom: 2rem;
        }

        .roleperm-header-section {
          margin-bottom: 1.5rem;
        }

        .roleperm-main-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.875rem;
          font-weight: 700;
          color: #6B1E1E;
        }

        .roleperm-subtitle {
          font-family: 'Inter', sans-serif;
          color: #6B7280;
          margin-top: 0.25rem;
        }

        .roleperm-content-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 1.5rem;
        }

        .roleperm-roles-panel {
          background: white;
          border-radius: 0.5rem;
          border: 1px solid #E5E7EB;
          padding: 1.5rem;
          height: fit-content;
        }

        .roleperm-panel-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }

        .roleperm-roles-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .roleperm-role-card {
          padding: 1rem;
          border: 1px solid #E5E7EB;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .roleperm-role-card:hover {
          border-color: #6B1E1E;
          background-color: #FFF7F7;
        }

        .roleperm-role-card-active {
          border-color: #6B1E1E;
          background-color: #FFF7F7;
        }

        .roleperm-role-header {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .roleperm-role-icon {
          width: 2.5rem;
          height: 2.5rem;
          background-color: #6B1E1E;
          color: white;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .roleperm-role-info {
          flex: 1;
        }

        .roleperm-role-name {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
          text-transform: capitalize;
        }

        .roleperm-role-description {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          color: #6B7280;
          margin-top: 0.25rem;
        }

        .roleperm-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .roleperm-badge-superadmin {
          background-color: #FEE2E2;
          color: #991B1B;
        }

        .roleperm-badge-masteradmin {
          background-color: #DBEAFE;
          color: #1E3A8A;
        }

        .roleperm-badge-subadmin {
          background-color: #FEF3C7;
          color: #92400E;
        }

        .roleperm-badge-admin {
          background-color: #D1FAE5;
          color: #065F46;
        }

        .roleperm-badge-default {
          background-color: #F3F4F6;
          color: #374151;
        }

        .roleperm-details-panel {
          background: white;
          border-radius: 0.5rem;
          border: 1px solid #E5E7EB;
          padding: 1.5rem;
        }

        .roleperm-details-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #E5E7EB;
        }

        .roleperm-details-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #6B1E1E;
          text-transform: capitalize;
        }

        .roleperm-details-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #6B7280;
          margin-top: 0.25rem;
        }

        .roleperm-edit-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #6B1E1E;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .roleperm-edit-button:hover {
          background-color: #8B2E2E;
        }

        .roleperm-edit-actions {
          display: flex;
          gap: 0.5rem;
        }

        .roleperm-cancel-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          color: #374151;
          border: 1px solid #D1D5DB;
          border-radius: 0.375rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .roleperm-cancel-button:hover {
          background-color: #F3F4F6;
        }

        .roleperm-save-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #10B981;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .roleperm-save-button:hover {
          background-color: #059669;
        }

        .roleperm-table-container {
          margin-bottom: 2rem;
          border: 1px solid #E5E7EB;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .roleperm-table {
          width: 100%;
          border-collapse: collapse;
        }

        .roleperm-table-header {
          background-color: #F9FAFB;
          border-bottom: 1px solid #E5E7EB;
        }

        .roleperm-th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .roleperm-table-row {
          border-bottom: 1px solid #F3F4F6;
        }

        .roleperm-td {
          padding: 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
        }

        .roleperm-resource-cell {
          width: 200px;
          font-weight: 600;
          color: #111827;
        }

        .roleperm-resource-label {
          display: inline-block;
        }

        .roleperm-actions-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .roleperm-permission-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .roleperm-permission-granted {
          background-color: #D1FAE5;
          color: #065F46;
        }

        .roleperm-permission-denied {
          background-color: #FEE2E2;
          color: #991B1B;
        }

        .roleperm-permission-editable {
          cursor: pointer;
        }

        .roleperm-permission-editable:hover {
          transform: scale(1.05);
        }

        .roleperm-users-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #E5E7EB;
        }

        .roleperm-section-title {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .roleperm-users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .roleperm-user-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 1px solid #E5E7EB;
          border-radius: 0.375rem;
        }

        .roleperm-user-avatar {
          width: 2.5rem;
          height: 2.5rem;
          background-color: #6B1E1E;
          color: white;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .roleperm-user-info {
          flex: 1;
          min-width: 0;
        }

        .roleperm-user-name {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
        }

        .roleperm-user-email {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          color: #6B7280;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .roleperm-empty-text {
          font-family: 'Inter', sans-serif;
          color: #6B7280;
          text-align: center;
          padding: 2rem;
        }

        .roleperm-loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 16rem;
        }

        .roleperm-spinner {
          width: 3rem;
          height: 3rem;
          border: 2px solid #E5E7EB;
          border-top-color: #6B1E1E;
          border-radius: 9999px;
          animation: roleperm-spin 1s linear infinite;
        }

        @keyframes roleperm-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1024px) {
          .roleperm-content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RolePermissions;
