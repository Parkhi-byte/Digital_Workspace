import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '../utils/logger';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAdmin = localStorage.getItem('admin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedAdmin) {
      setAdminUser(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role: role || 'team_member' }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.pending) {
            return { success: true, pending: true, message: data.message };
        }
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Signup failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setAdminUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('aurora_team_cache');
    queryClient.clear();
  };

  const impersonate = async (targetUserId) => {
    try {
      const response = await fetch(`/api/admin/impersonate/${targetUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setAdminUser(user);
        localStorage.setItem('admin_user', JSON.stringify(user));
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        queryClient.clear();
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Impersonation failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const stopImpersonating = () => {
    if (!adminUser) return;
    setUser(adminUser);
    localStorage.setItem('user', JSON.stringify(adminUser));
    setAdminUser(null);
    localStorage.removeItem('admin_user');
    queryClient.clear();
  };

  const addTeamMember = async (memberEmail) => {
    try {
      const token = user?.token || JSON.parse(localStorage.getItem('user'))?.token;
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: memberEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to add member' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const removeTeamMember = async (memberEmail) => {
    logger.log('removeTeamMember not implemented in backend yet');
    return { success: false, error: 'Feature coming soon' };
  };

  const isMasterAdmin = user?.role === 'master_admin';

  const value = {
    user,
    adminUser,
    loading,
    login,
    signup,
    logout,
    impersonate,
    stopImpersonating,
    addTeamMember,
    removeTeamMember,
    isMasterAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
