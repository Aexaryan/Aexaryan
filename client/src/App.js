import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { MessagingProvider } from './contexts/MessagingContext';

import { useAuth } from './contexts/AuthContext';

// Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Public Pages
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// Footer Pages
import AboutPage from './pages/Footer/AboutPage';
import ContactPage from './pages/Footer/ContactPage';
import PrivacyPolicyPage from './pages/Footer/PrivacyPolicyPage';
import TermsOfServicePage from './pages/Footer/TermsOfServicePage';
import FAQPage from './pages/Footer/FAQPage';

// Talent Pages
import TalentDashboard from './pages/Talent/TalentDashboard';
import TalentProfile from './pages/Talent/TalentProfile';
import JobListings from './pages/Talent/JobListings';
import JobDetails from './pages/Talent/JobDetails';
import MyApplications from './pages/Talent/MyApplications';
import MessagingPage from './pages/Messaging/MessagingPage';

// Casting Director Pages
import DirectorDashboard from './pages/Director/DirectorDashboard';
import DirectorProfile from './pages/Director/DirectorProfile';
import SearchTalents from './pages/Director/SearchTalents';
import TalentDetails from './pages/Director/TalentDetails';
import MyCastings from './pages/Director/MyCastings';
import CreateCasting from './pages/Director/CreateCasting';
import EditCasting from './pages/Director/EditCasting';
import CastingApplications from './pages/Director/CastingApplications';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import CastingManagement from './pages/Admin/CastingManagement';
import ApplicationManagement from './pages/Admin/ApplicationManagement';
import UserDetails from './pages/Admin/UserDetails';
import CastingDetails from './pages/Admin/CastingDetails';
import ApplicationDetails from './pages/Admin/ApplicationDetails';
import Analytics from './pages/Admin/Analytics';
// import Reports from './pages/Admin/Reports';
import PendingActions from './pages/Admin/PendingActions';
import SystemSettings from './pages/Admin/SystemSettings';
import RecentActivities from './pages/Admin/RecentActivities';
import IdentificationManagement from './pages/Admin/IdentificationManagement';
import AdminLayout from './components/Admin/AdminLayout';
import AdminEditCasting from './pages/Admin/EditCasting';
import AdminCastingApplications from './pages/Admin/CastingApplications';
import MyReports from './pages/Reports/MyReports';
import ReportsManagement from './pages/Admin/ReportsManagement';
import ReportDetails from './pages/Admin/ReportDetails';
import TalentReportDetails from './pages/Reports/ReportDetails';
import ReportDetailAgainstMe from './pages/Reports/ReportDetailAgainstMe';
import ContentManagement from './pages/Admin/ContentManagement';
import AutoApprovalManagement from './pages/Admin/AutoApprovalManagement';

// Blog and News Pages
import BlogsPage from './pages/Blog/BlogsPage';
import BlogDetailsPage from './pages/Blog/BlogDetailsPage';
import NewsPage from './pages/News/NewsPage';
import NewsDetailsPage from './pages/News/NewsDetailsPage';

// Director Blog Management
import CreateBlog from './pages/Director/CreateBlog';
import EditBlog from './pages/Director/EditBlog';
import MyBlogs from './pages/Director/MyBlogs';

// Writer Pages
import WriterDashboard from './pages/Writer/WriterDashboard';
import CreateArticle from './pages/Writer/CreateArticle';
import EditArticle from './pages/Writer/EditArticle';
import CreateNews from './pages/Writer/CreateNews';
import EditNews from './pages/Writer/EditNews';
import WriterReports from './pages/Writer/WriterReports';
import UserExploration from './pages/Writer/UserExploration';
import WriterProfile from './pages/Writer/WriterProfile';
import MyArticles from './pages/Writer/MyArticles';
import MyNews from './pages/Writer/MyNews';
import WriterAnalytics from './pages/Writer/WriterAnalytics';
import WriterMessages from './pages/Writer/WriterMessages';

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
    let dashboardPath;
    switch (user.role) {
      case 'talent':
        dashboardPath = '/talent/dashboard';
        break;
      case 'casting_director':
        dashboardPath = '/director/dashboard';
        break;
      case 'journalist':
        dashboardPath = '/writer/dashboard';
        break;
      case 'admin':
        dashboardPath = '/admin/dashboard';
        break;
      default:
        dashboardPath = '/';
    }
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

        {/* Footer Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/faq" element={<FAQPage />} />

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
                  <Route path="messages" element={<MessagingPage />} />
                  <Route path="reports" element={<MyReports />} />
                  <Route path="reports/:id" element={<TalentReportDetails />} />
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
                  <Route path="castings/:id/edit" element={<EditCasting />} />
                  <Route path="castings/:id/applications" element={<CastingApplications />} />
                  <Route path="blogs" element={<MyBlogs />} />
                  <Route path="blogs/create" element={<CreateBlog />} />
                  <Route path="blogs/:id/edit" element={<EditBlog />} />
                  <Route path="messages" element={<MessagingPage />} />
                  <Route path="reports" element={<MyReports />} />
                  <Route path="reports/:id" element={<ReportDetailAgainstMe />} />
                  <Route path="*" element={<Navigate to="/director/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Writer Routes */}
        <Route 
          path="/writer/*"
          element={
            <ProtectedRoute requiredRole="journalist">
              <Routes>
                <Route path="dashboard" element={<WriterDashboard />} />
                <Route path="profile" element={<WriterProfile />} />
                <Route path="articles" element={<MyArticles />} />
                <Route path="articles/create" element={<CreateArticle />} />
                <Route path="articles/:id/edit" element={<EditArticle />} />
                <Route path="news" element={<MyNews />} />
                <Route path="news/create" element={<CreateNews />} />
                <Route path="news/:id/edit" element={<EditNews />} />
                <Route path="reports" element={<WriterReports />} />
                <Route path="users" element={<UserExploration />} />
                <Route path="analytics" element={<WriterAnalytics />} />
                <Route path="messages" element={<WriterMessages />} />
                <Route path="*" element={<Navigate to="/writer/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
                <Route 
                  path="/admin/*"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminLayout>
                        <Routes>
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="users" element={<UserManagement />} />
                          <Route path="users/:id" element={<UserDetails />} />
                          <Route path="castings" element={<CastingManagement />} />
                          <Route path="castings/:id" element={<CastingDetails />} />
                          <Route path="castings/:id/edit" element={<AdminEditCasting />} />
                          <Route path="castings/:id/applications" element={<AdminCastingApplications />} />
                          <Route path="applications" element={<ApplicationManagement />} />
                          <Route path="applications/:id" element={<ApplicationDetails />} />
                          <Route path="analytics" element={<Analytics />} />
                          <Route path="reports" element={<ReportsManagement />} />
                          <Route path="reports/:id" element={<ReportDetails />} />
                          <Route path="content" element={<ContentManagement />} />
                          <Route path="auto-approval" element={<AutoApprovalManagement />} />
                          <Route path="pending-actions" element={<PendingActions />} />
                          <Route path="activities" element={<RecentActivities />} />
                          <Route path="identification" element={<IdentificationManagement />} />
                          <Route path="settings" element={<SystemSettings />} />
                          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                        </Routes>
                      </AdminLayout>
                    </ProtectedRoute>
                  } 
                />

        {/* Blog and News Routes - Public Access */}
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/blogs/:slug" element={<BlogDetailsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<NewsDetailsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <MessagingProvider>
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
      </MessagingProvider>
    </AuthProvider>
  );
}

export default App;