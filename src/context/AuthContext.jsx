import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password, role) => {
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password && u.role === role);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      return { success: true };
    } else {
      return { success: false, error: 'Invalid email, password, or role' };
    }
  };

  const signup = (name, email, password, role) => {
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role, // 'team_head' or 'team_member'
      teamMembers: role === 'team_head' ? [] : [],
      createdAt: new Date().toISOString()
    };

    // Add to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const addTeamMember = (memberEmail, memberName) => {
    if (!user || user.role !== 'team_head') {
      return { success: false, error: 'Only team heads can add members' };
    }

    // Get all users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if member exists
    const member = users.find(u => u.email === memberEmail);
    if (!member) {
      return { success: false, error: 'User with this email not found' };
    }

    // Check if already in team
    const updatedUser = { ...user };
    if (updatedUser.teamMembers.find(m => m.email === memberEmail)) {
      return { success: false, error: 'User is already a team member' };
    }

    // Add to team
    updatedUser.teamMembers.push({
      email: memberEmail,
      name: memberName || member.name
    });

    // Update user in localStorage
    const userIndex = users.findIndex(u => u.id === user.id);
    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));

    // Update current user
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return { success: true };
  };

  const removeTeamMember = (memberEmail) => {
    if (!user || user.role !== 'team_head') {
      return { success: false, error: 'Only team heads can remove members' };
    }

    const updatedUser = { ...user };
    updatedUser.teamMembers = updatedUser.teamMembers.filter(m => m.email !== memberEmail);

    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));

    // Update current user
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return { success: true };
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

