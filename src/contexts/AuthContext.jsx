import { createContext, useContext, useState, useEffect } from 'react';
import authService from '@/services/api/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const user = await authService.login(email, password);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    hasPermission: (permission) => authService.hasPermission(permission),
    canViewAgency: (agencyId) => authService.canViewAgency(agencyId),
    canViewVirtualAssistant: (vaId, agencyId) => authService.canViewVirtualAssistant(vaId, agencyId),
    canViewCheckIn: (checkIn) => authService.canViewCheckIn(checkIn)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};