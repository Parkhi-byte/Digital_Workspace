import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Video, MessageCircle, FileText, Home, Bell, Search, Menu, X, LogOut, Shield, Users, Lock, Sun, Moon, Sparkles, Kanban, Info, CreditCard, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      color: 'from-aurora-500 to-purple-600'
    },
    {
      path: '/video-call',
      icon: Video,
      label: 'Video Call',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      path: '/chat',
      icon: MessageCircle,
      label: 'Chat',
      color: 'from-green-500 to-emerald-500'
    },
    {
      path: '/document-share',
      icon: FileText,
      label: 'Documents',
      color: 'from-purple-500 to-pink-500'
    },
    {
      path: '/password-manager',
      icon: Lock,
      label: 'Passwords',
      color: 'from-orange-500 to-red-500'
    },
    {
      path: '/kanban',
      icon: Kanban,
      label: 'Board',
      color: 'from-indigo-500 to-violet-500'
    }
  ];

  const publicNavItems = [
    {
      path: '/login',
      icon: LogIn,
      label: 'Login',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  const currentNavItems = user ? navItems : publicNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? "/" : "/login"} className="flex items-center space-x-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-aurora-500 via-aurora-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-aurora-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Aurora
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 -mt-1 font-medium">The Digital Workspace</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${isActive
                    ? 'text-aurora-600 dark:text-aurora-400 bg-aurora-50 dark:bg-aurora-900/30 border border-aurora-200 dark:border-aurora-800 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-aurora-600 dark:hover:text-aurora-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon size={16} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Search */}
                <div className="hidden lg:block relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aurora-500 focus:border-transparent w-64 transition-all"
                  />
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className={`relative p-2.5 rounded-lg transition-colors ${location.pathname === '/notifications'
                    ? 'text-aurora-600 dark:text-aurora-400 bg-aurora-50 dark:bg-aurora-900/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 dark:bg-red-600 rounded-full border-2 border-white dark:border-gray-800"></span>
                </Link>

                {/* User Profile */}
                <div className="relative" ref={userMenuRef}>
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || 'User'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                        {user?.role === 'team_head' && <Shield size={12} className="text-aurora-600 dark:text-aurora-400" />}
                        <span>{user?.role === 'team_head' ? 'Team Head' : 'Team Member'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="relative group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-aurora-500 via-aurora-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        {getInitials(user?.name)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 dark:bg-green-600 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </button>
                  </div>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 backdrop-blur-sm">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.email}</div>
                        {user?.role === 'team_head' && (
                          <div className="flex items-center space-x-1 mt-2">
                            <Shield size={12} className="text-aurora-600 dark:text-aurora-400" />
                            <span className="text-xs text-aurora-600 dark:text-aurora-400 font-medium">Team Head</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              {currentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'text-aurora-600 dark:text-aurora-400 bg-aurora-50 dark:bg-aurora-900/30'
                      : 'text-gray-600 dark:text-gray-300 hover:text-aurora-600 dark:hover:text-aurora-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon size={18} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;