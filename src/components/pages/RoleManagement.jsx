import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import Modal from '@/components/molecules/Modal';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import roleService from '@/services/api/roleService';
import { useAuth } from '@/contexts/AuthContext';

const RoleManagement = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);

  useEffect(() => {
    if (!hasPermission('manage_roles')) {
      setError('Access denied. You do not have permission to manage roles.');
      setLoading(false);
      return;
    }
    loadRoleData();
  }, [hasPermission]);

  const loadRoleData = async () => {
    try {
      setLoading(true);
      const [rolesData, usersData] = await Promise.all([
        roleService.getAllRoles(),
        roleService.getAllUsers()
      ]);
      setRoles(rolesData);
      setUsers(usersData);
    } catch (err) {
      setError('Failed to load role data');
      toast.error('Failed to load role data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handlePermissionToggle = async (roleId, permission) => {
    try {
      await roleService.togglePermission(roleId, permission);
      await loadRoleData();
      toast.success('Permission updated successfully');
    } catch (err) {
      toast.error('Failed to update permission');
    }
  };

  const handleUserRoleChange = async (userId, newRoleId) => {
    try {
      await roleService.updateUserRole(userId, newRoleId);
      await loadRoleData();
      toast.success('User role updated successfully');
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  const availablePermissions = [
    { key: 'view_dashboard', label: 'View Dashboard', category: 'Dashboard' },
    { key: 'view_revenue', label: 'View Revenue Data', category: 'Dashboard' },
    { key: 'view_all_agencies', label: 'View All Agencies', category: 'Agencies' },
    { key: 'view_own_agency', label: 'View Own Agency', category: 'Agencies' },
    { key: 'manage_agencies', label: 'Manage Agencies', category: 'Agencies' },
    { key: 'view_all_vas', label: 'View All Virtual Assistants', category: 'VAs' },
    { key: 'view_assigned_vas', label: 'View Assigned VAs', category: 'VAs' },
    { key: 'view_own_profile', label: 'View Own Profile', category: 'VAs' },
    { key: 'manage_vas', label: 'Manage Virtual Assistants', category: 'VAs' },
    { key: 'view_all_checkins', label: 'View All Check-ins', category: 'Check-ins' },
    { key: 'view_own_checkins', label: 'View Own Check-ins', category: 'Check-ins' },
    { key: 'manage_checkins', label: 'Manage Check-ins', category: 'Check-ins' },
    { key: 'view_va_requests', label: 'View VA Requests', category: 'Requests' },
    { key: 'manage_va_requests', label: 'Manage VA Requests', category: 'Requests' },
    { key: 'manage_users', label: 'Manage Users', category: 'Administration' },
    { key: 'manage_roles', label: 'Manage Roles', category: 'Administration' }
  ];

  const getPermissionsByCategory = () => {
    return availablePermissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {});
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const permissionsByCategory = getPermissionsByCategory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-2">Manage user roles and permissions across the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ApperIcon name="Shield" size={24} className="text-primary" />
            <h2 className="text-xl font-semibold">Roles & Permissions</h2>
          </div>
          
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.Id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={role.type === 'internal' ? 'primary' : 'secondary'}>
                      {role.name}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      ({users.filter(u => u.roleId === role.Id).length} users)
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoleClick(role)}
                  >
                    <ApperIcon name="Settings" size={14} />
                    Manage
                  </Button>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {availablePermissions.find(p => p.key === permission)?.label || permission}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Users Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ApperIcon name="Users" size={24} className="text-primary" />
            <h2 className="text-xl font-semibold">User Role Assignments</h2>
          </div>
          
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.Id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                
                <Select
                  value={user.roleId}
                  onChange={(e) => handleUserRoleChange(user.Id, parseInt(e.target.value))}
                  className="w-48"
                >
                  {roles.map((role) => (
                    <option key={role.Id} value={role.Id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Role Permissions Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Manage Permissions - ${selectedRole?.name}`}
        size="lg"
      >
        {selectedRole && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={selectedRole.type === 'internal' ? 'primary' : 'secondary'}>
                  {selectedRole.name}
                </Badge>
                <span className="text-sm text-gray-500">
                  ({users.filter(u => u.roleId === selectedRole.Id).length} users)
                </span>
              </div>
              <p className="text-sm text-gray-600">{selectedRole.description}</p>
            </div>

            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
              <div key={category} className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 text-gray-900">{category}</h3>
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <label key={permission.key} className="flex items-center justify-between">
                      <span className="text-sm">{permission.label}</span>
                      <input
                        type="checkbox"
                        checked={selectedRole.permissions.includes(permission.key)}
                        onChange={() => handlePermissionToggle(selectedRole.Id, permission.key)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoleManagement;