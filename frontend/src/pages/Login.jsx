import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, ArrowRight, Mail, Lock, Eye, EyeOff, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('team_member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password, role);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 flex items-center justify-center py-8 px-4 relative overflow-y-auto">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 relative z-10"
      >
        {/* ── Aurora Brand Header ── */}
        <div className="text-center mb-5">
          {/* Logo + Wordmark — matches Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center space-x-1 mb-4"
          >
            <div className="relative w-12 h-12 flex items-center justify-center">
              <img
                src="/aurora-logo.svg"
                alt="Aurora Logo"
                className="relative w-10 h-10 object-contain animate-color-glow"
              />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white tracking-tight leading-none">
              Aurora
            </span>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
            <span className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-1">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Please enter your details to sign in.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Role Toggle */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100/80 dark:bg-gray-700/50 rounded-2xl backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setRole('team_member')}
              className={`flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${role === 'team_member'
                ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              <User size={18} />
              <span className="hidden sm:inline">Member</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('team_head')}
              className={`flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${role === 'team_head'
                ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              <Shield size={18} />
              <span className="hidden sm:inline">Team Head</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('master_admin')}
              className={`flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${role === 'master_admin'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-lg shadow-amber-500/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              <Crown size={18} />
              <span className="hidden sm:inline">Master</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  placeholder="••••••••"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center h-full"
                >
                  <div className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700/50 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-center">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={showPassword ? 'eye-off' : 'eye'}
                        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex items-center ml-1">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Remember me
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, translateY: -1 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </motion.button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">
              Create free account
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
