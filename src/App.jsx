import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import VideoCall from './pages/VideoCall';
import Chat from './pages/Chat';
import DocumentShare from './pages/DocumentShare';
import Notifications from './pages/Notifications';
import TeamManagement from './pages/TeamManagement';
import PasswordManager from './pages/PasswordManager';
import Kanban from './pages/Kanban';
import Pricing from './pages/Pricing';
import About from './pages/About';
import './index.css';

// Public route wrapper (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />
      {/* Publicly accessible routes with Layout */}
      <Route
        path="/about"
        element={
          <Layout>
            <About />
          </Layout>
        }
      />
      <Route
        path="/pricing"
        element={
          <Layout>
            <Pricing />
          </Layout>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/video-call"
        element={
          <ProtectedRoute>
            <Layout>
              <VideoCall />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Layout>
              <Chat />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/document-share"
        element={
          <ProtectedRoute>
            <Layout>
              <DocumentShare />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <Notifications />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-management"
        element={
          <ProtectedRoute>
            <Layout>
              <TeamManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/password-manager"
        element={
          <ProtectedRoute>
            <Layout>
              <PasswordManager />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/kanban"
        element={
          <ProtectedRoute>
            <Layout>
              <Kanban />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;