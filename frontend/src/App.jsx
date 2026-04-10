import React from 'react';
import { Toaster } from 'sonner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedMasterAdminRoute from './components/ProtectedMasterAdminRoute';
import PageLoader from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';

const Login = React.lazy(() => import('./pages/Login'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
const Home = React.lazy(() => import('./pages/Home'));
const VideoCall = React.lazy(() => import('./pages/VideoCall'));
const Chat = React.lazy(() => import('./pages/Chat'));
const DocumentShare = React.lazy(() => import('./pages/DocumentShare'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const TeamManagement = React.lazy(() => import('./pages/TeamManagement'));
const MasterAdminDashboard = React.lazy(() => import('./pages/MasterAdminDashboard'));
const PasswordManager = React.lazy(() => import('./pages/PasswordManager'));
const Kanban = React.lazy(() => import('./pages/Kanban'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const About = React.lazy(() => import('./pages/About'));
const Profile = React.lazy(() => import('./pages/Profile'));
import './index.css';
import { ChatProvider } from './context/ChatContext';

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
    <React.Suspense fallback={<PageLoader />}>
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
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
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
          path="/video-call"
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <VideoCall />
                </ErrorBoundary>
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
          path="/notifications/:filter?"
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
          path="/admin"
          element={
            <ProtectedMasterAdminRoute>
              <Layout>
                <MasterAdminDashboard />
              </Layout>
            </ProtectedMasterAdminRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
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
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <Calendar />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}


function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ChatProvider>
            <Toaster position="top-center" richColors />
            <AppRoutes />
          </ChatProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;