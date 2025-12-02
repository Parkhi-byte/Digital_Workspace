import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Shield, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('team_member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = login(email, password, role);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-aurora-100 dark:bg-aurora-900/30 text-aurora-600 dark:text-aurora-400 mb-6">
              <LogIn size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please enter your details to sign in.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Role Toggle */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('team_member')}
                  className={`flex items-center justify-center space-x-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'team_member'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <User size={16} />
                  <span>Member</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('team_head')}
                  className={`flex items-center justify-center space-x-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'team_head'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Shield size={16} />
                  <span>Team Head</span>
                </button>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aurora-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aurora-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-aurora-600 focus:ring-aurora-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-aurora-600 hover:text-aurora-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight className="ml-2 -mr-1 h-4 w-4" />}
            </button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-aurora-600 hover:text-aurora-500">
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-aurora-900 to-gray-900 opacity-90"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-20">
          <h2 className="text-4xl font-bold text-white mb-6">
            "The best way to predict the future is to create it."
          </h2>
          <p className="text-xl text-aurora-200">
            Join thousands of teams building the future with Aurora Workspace.
          </p>
        </div>
        <div className="absolute bottom-0 right-0 p-20 opacity-20">
          <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.4,70.6,31.4C59,41.4,47.1,48.6,35.3,53.4C23.5,58.2,11.8,60.6,-0.6,61.6C-13,62.7,-25.9,62.4,-37.1,57.2C-48.3,52,-57.8,41.9,-65.3,30.3C-72.8,18.7,-78.3,5.6,-76.8,-6.8C-75.3,-19.2,-66.8,-30.9,-56.6,-40.4C-46.4,-49.9,-34.5,-57.2,-22.1,-66.1C-9.7,-75,3.2,-85.5,15.8,-85.5C28.4,-85.5,40.8,-75,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Login;
