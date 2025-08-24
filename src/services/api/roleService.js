import rolesData from '@/services/mockData/roles.json';

// Mock users with role assignments
let mockUsers = [
  {
    Id: 1,
    email: "admin@talentfuze.com",
    name: "TalentFuze Admin",
    roleId: 1
  },
  {
    Id: 2,
    email: "mentor@talentfuze.com", 
    name: "VA Mentor",
    roleId: 4
  },
  {
    Id: 3,
    email: "operations@talentfuze.com",
    name: "Operations Manager", 
    roleId: 5
  },
  {
    Id: 4,
    email: "agency1@example.com",
    name: "Agency Manager",
    roleId: 2
  },
  {
    Id: 5,
    email: "agency2@example.com",
    name: "Agency Manager 2", 
    roleId: 2
  },
  {
    Id: 6,
    email: "va1@example.com",
    name: "Virtual Assistant",
    roleId: 3
  },
  {
    Id: 7,
    email: "va2@example.com",
    name: "Virtual Assistant 2",
    roleId: 3
  }
];

let roles = [...rolesData];

// Helper function to simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

class RoleService {
  async getAllRoles() {
    await delay();
    return [...roles];
  }

  async getAllUsers() {
    await delay();
    return [...mockUsers];
  }

  async getRoleById(id) {
    await delay();
    const role = roles.find(r => r.Id === parseInt(id));
    if (!role) {
      throw new Error('Role not found');
    }
    return { ...role };
  }

  async getUserById(id) {
    await delay();
    const user = mockUsers.find(u => u.Id === parseInt(id));
    if (!user) {
      throw new Error('User not found');
    }
    return { ...user };
  }

  async updateUserRole(userId, roleId) {
    await delay();
    const userIndex = mockUsers.findIndex(u => u.Id === parseInt(userId));
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const role = roles.find(r => r.Id === parseInt(roleId));
    if (!role) {
      throw new Error('Role not found');
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      roleId: parseInt(roleId)
    };

    return { ...mockUsers[userIndex] };
  }

  async togglePermission(roleId, permission) {
    await delay();
    const roleIndex = roles.findIndex(r => r.Id === parseInt(roleId));
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }

    const role = roles[roleIndex];
    const hasPermission = role.permissions.includes(permission);
    
    if (hasPermission) {
      role.permissions = role.permissions.filter(p => p !== permission);
    } else {
      role.permissions.push(permission);
    }

    roles[roleIndex] = { ...role };
    return { ...role };
  }

  async createRole(roleData) {
    await delay();
    const newRole = {
      Id: Math.max(...roles.map(r => r.Id)) + 1,
      name: roleData.name,
      description: roleData.description,
      type: roleData.type || 'external',
      permissions: roleData.permissions || []
    };

    roles.push(newRole);
    return { ...newRole };
  }

  async updateRole(id, roleData) {
    await delay();
    const roleIndex = roles.findIndex(r => r.Id === parseInt(id));
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }

    roles[roleIndex] = {
      ...roles[roleIndex],
      ...roleData,
      Id: parseInt(id)
    };

    return { ...roles[roleIndex] };
  }

  async deleteRole(id) {
    await delay();
    const roleIndex = roles.findIndex(r => r.Id === parseInt(id));
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }

    // Check if any users have this role
    const usersWithRole = mockUsers.filter(u => u.roleId === parseInt(id));
    if (usersWithRole.length > 0) {
      throw new Error('Cannot delete role with assigned users');
    }

    roles.splice(roleIndex, 1);
    return true;
  }

  // Get role by name (helper method)
  async getRoleByName(name) {
    await delay();
    return roles.find(r => r.name === name) || null;
  }

  // Get users by role
  async getUsersByRole(roleId) {
    await delay();
    return mockUsers.filter(u => u.roleId === parseInt(roleId));
  }
}

const roleService = new RoleService();
export default roleService;