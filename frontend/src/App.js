import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrganizationProvider } from './context/OrganizationContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import OrganizationRegistration from './pages/OrganizationRegistration';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import Employees from './pages/Employees';
import OrganizationSettings from './pages/OrganizationSettings';
import Organizations from './pages/Organizations';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isHR, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isHR && !isSuperAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Route that excludes SuperAdmin (for Attendance and Leaves)
const NonSuperAdminRoute = ({ children }) => {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (isSuperAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// SuperAdmin Only Route
const SuperAdminOnlyRoute = ({ children }) => {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function AppRoutes() {
  const { isHR, isSuperAdmin } = useAuth();

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
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/register-organization"
        element={
          <PublicRoute>
            <OrganizationRegistration />
          </PublicRoute>
        }
      />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {isSuperAdmin ? <SuperAdminDashboard /> : isHR ? <AdminDashboard /> : <EmployeeDashboard />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <NonSuperAdminRoute>
            <Attendance />
          </NonSuperAdminRoute>
        }
      />
      <Route
        path="/leaves"
        element={
          <NonSuperAdminRoute>
            <LeaveManagement />
          </NonSuperAdminRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute adminOnly={true}>
            <Employees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization-settings"
        element={
          <ProtectedRoute adminOnly={true}>
            <OrganizationSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations"
        element={
          <SuperAdminOnlyRoute>
            <Organizations />
          </SuperAdminOnlyRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <OrganizationProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </OrganizationProvider>
  );
}

export default App;
