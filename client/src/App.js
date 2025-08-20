import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Public Pages
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// Talent Pages
import TalentDashboard from './pages/Talent/TalentDashboard';
import TalentProfile from './pages/Talent/TalentProfile';
import JobListings from './pages/Talent/JobListings';
import JobDetails from './pages/Talent/JobDetails';
import MyApplications from './pages/Talent/MyApplications';

// Casting Director Pages
import DirectorDashboard from './pages/Director/DirectorDashboard';
import DirectorProfile from './pages/Director/DirectorProfile';
import SearchTalents from './pages/Director/SearchTalents';
import TalentDetails from './pages/Director/TalentDetails';
import MyCastings from './pages/Director/MyCastings';
import CreateCasting from './pages/Director/CreateCasting';
import CastingApplications from './pages/Director/CastingApplications';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    // Redirect to appropriate dashboard based on role
    const dashboardPath = user.role === 'talent' ? '/talent/dashboard' : '/director/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />

        {/* Talent Routes */}
        <Route 
          path="/talent/*" 
          element={
            <ProtectedRoute requiredRole="talent">
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<TalentDashboard />} />
                  <Route path="profile" element={<TalentProfile />} />
                  <Route path="jobs" element={<JobListings />} />
                  <Route path="jobs/:id" element={<JobDetails />} />
                  <Route path="applications" element={<MyApplications />} />
                  <Route path="*" element={<Navigate to="/talent/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Casting Director Routes */}
        <Route 
          path="/director/*" 
          element={
            <ProtectedRoute requiredRole="casting_director">
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<DirectorDashboard />} />
                  <Route path="profile" element={<DirectorProfile />} />
                  <Route path="talents" element={<SearchTalents />} />
                  <Route path="talents/:id" element={<TalentDetails />} />
                  <Route path="castings" element={<MyCastings />} />
                  <Route path="castings/new" element={<CreateCasting />} />
                  <Route path="castings/:id/applications" element={<CastingApplications />} />
                  <Route path="*" element={<Navigate to="/director/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
        <Toaster 
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Vazir, Tahoma, Arial, sans-serif',
              direction: 'rtl',
            },
            success: {
              className: 'toast-success',
            },
            error: {
              className: 'toast-error',
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;