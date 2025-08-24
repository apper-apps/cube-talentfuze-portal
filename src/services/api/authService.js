// Mock users with different roles
const mockUsers = [
  {
    Id: 1,
    email: "admin@talentfuze.com",
    password: "password123", // In real app, this would be hashed
    role: "TalentFuze",
    name: "TalentFuze Admin",
    permissions: ["view_all_agencies", "view_all_vas", "view_all_checkins", "manage_users"]
  },
  {
    Id: 2,
    email: "agency1@example.com",
    password: "password123",
    role: "Agency",
    name: "Agency Manager",
    agencyId: 1,
    permissions: ["view_own_agency", "view_assigned_vas", "view_own_checkins"]
  },
  {
    Id: 3,
    email: "agency2@example.com",
    password: "password123",
    role: "Agency",
    name: "Agency Manager 2",
    agencyId: 2,
    permissions: ["view_own_agency", "view_assigned_vas", "view_own_checkins"]
  },
  {
    Id: 4,
    email: "va1@example.com",
    password: "password123",
    role: "VirtualAssistant",
    name: "Virtual Assistant",
    virtualAssistantId: 1,
    agencyId: 1,
    permissions: ["view_own_profile", "view_own_checkins"]
  },
  {
    Id: 5,
    email: "va2@example.com",
    password: "password123",
    role: "VirtualAssistant",
    name: "Virtual Assistant 2",
    virtualAssistantId: 2,
    agencyId: 2,
    permissions: ["view_own_profile", "view_own_checkins"]
  }
];

class AuthService {
  constructor() {
    this.currentUser = null;
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(email, password) {
    await this.delay(500);
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    this.currentUser = userWithoutPassword;
    
    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  }

  async logout() {
    await this.delay(200);
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    return true;
  }

  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    
    return null;
  }

  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  hasPermission(permission) {
    const user = this.getCurrentUser();
    return user && user.permissions.includes(permission);
  }

  canViewAgency(agencyId) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (user.role === 'TalentFuze') return true;
    if (user.role === 'Agency') return user.agencyId === parseInt(agencyId);
    if (user.role === 'VirtualAssistant') return user.agencyId === parseInt(agencyId);
    
    return false;
  }

  canViewVirtualAssistant(vaId, agencyId) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (user.role === 'TalentFuze') return true;
    if (user.role === 'Agency') return user.agencyId === parseInt(agencyId);
    if (user.role === 'VirtualAssistant') return user.virtualAssistantId === parseInt(vaId);
    
    return false;
  }

  canViewCheckIn(checkIn) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (user.role === 'TalentFuze') return true;
    if (user.role === 'Agency') return user.agencyId === checkIn.agencyId;
    if (user.role === 'VirtualAssistant') return user.virtualAssistantId === checkIn.virtualAssistantId;
    
    return false;
  }
}

export default new AuthService();