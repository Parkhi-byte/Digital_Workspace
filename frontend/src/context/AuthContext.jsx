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
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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
        // Backend returns: { _id, name, email, role, token }
        // We can verify if the role matches if needed, or just trust the backend.
        // For now, let's just use what the backend returned.
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
    localStorage.removeItem('user');
    localStorage.removeItem('aurora_team_cache');
    // Clear ALL React Query cache so the next user gets fresh data.
    // Without this, a team_head's cached dashboard (with teams array) bleeds
    // into the team_member's session and causes the "no team" screen.
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
    // Placeholder: Backend doesn't support this yet
    logger.log('removeTeamMember not implemented in backend yet');
    return { success: false, error: 'Feature coming soon' };
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    addTeamMember,
    removeTeamMember
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

