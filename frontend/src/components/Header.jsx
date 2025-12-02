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
      path: '/',
      icon: Home,
      label: 'Home',
      color: 'from-aurora-500 to-purple-600'
    },
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
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-aurora-500 to-purple-600 rounded-xl rotate-6 opacity-20 group-hover:rotate-12 transition-transform duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-aurora-500 to-purple-600 rounded-xl opacity-90 shadow-lg group-hover:shadow-aurora-500/30 transition-all duration-300"></div>
              <svg className="relative w-6 h-6 text-white transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-aurora-800 to-gray-900 dark:from-white dark:via-aurora-200 dark:to-white tracking-tight leading-none">
                Aurora
              </span>
              <span className="text-[10px] font-semibold text-aurora-600 dark:text-aurora-400 tracking-widest uppercase leading-none mt-1">
                Workspace
              </span>
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
                  className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? 'text-aurora-600 dark:text-aurora-400 bg-aurora-50 dark:bg-aurora-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                  <Icon size={18} className={isActive ? 'text-aurora-600 dark:text-aurora-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'} strokeWidth={2} />
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-aurora-500/20 focus:border-aurora-500 w-64 transition-all text-sm"
                  />
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className={`relative p-2 rounded-lg transition-colors ${location.pathname === '/notifications'
                    ? 'text-aurora-600 dark:text-aurora-400 bg-aurora-50 dark:bg-aurora-900/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
                </Link>

                {/* User Profile */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-aurora-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {getInitials(user?.name)}
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{user?.email}</div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
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
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col space-y-1">
              {currentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'text-aurora-600 dark:text-aurora-400 bg-aurora-50 dark:bg-aurora-900/30'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={18} strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
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