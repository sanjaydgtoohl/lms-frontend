import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { handleTokenExpiration } from './utils/auth';
import LoginCard from './pages/Auth/LoginCard';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import LeadSource from './pages/LeadSource';
import AgencyMaster from './pages/AgencyMaster';
import BrandMaster from './pages/BrandMaster';
import IndustryMaster from './pages/IndustryMaster';
import DesignationMaster from './pages/DesignationMaster';
import DepartmentMaster from './pages/DepartmentMaster';
import { MissCampaignView, MissCampaignCreate } from './pages/MissCampaign';
import { AllLeads, CreateLead, EditLead, ViewLead, Pending, Interested, MeetingScheduled, MeetingDone } from './pages/LeadManagement';
import { AllPermissions, CreatePermission, ViewPermission, AllRoles, CreateRole, ViewRole } from './pages/UserManagement';
import Layout from './components/layout/Layout';
import BriefPipeline from './pages/Brief/BriefPipeline';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ROUTES } from './constants';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated && token) {
      handleTokenExpiration().catch(() => {
        navigate(ROUTES.LOGIN, { replace: true });
      });
    }
  }, [token, isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
        {/* Public Routes */}
        <Route 
          path={ROUTES.LOGIN} 
          element={
            <PublicRoute>
              <LoginCard />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes with Layout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Index redirects to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          {/* Child routes must be relative when nested */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="profile" element={<Profile />} />
          <Route path="lead-source" element={<LeadSource />} />
          {/* Master routes (support direct create/view/edit paths) */}
          <Route path="master/brand" element={<BrandMaster />} />
          <Route path="master/brand/create" element={<BrandMaster />} />
          <Route path="master/brand/:id" element={<BrandMaster />} />
          <Route path="master/brand/:id/edit" element={<BrandMaster />} />

          <Route path="master/agency" element={<AgencyMaster />} />
          <Route path="master/agency/create" element={<AgencyMaster />} />
          <Route path="master/agency/:id" element={<AgencyMaster />} />
          <Route path="master/agency/:id/edit" element={<AgencyMaster />} />

          <Route path="master/industry" element={<IndustryMaster />} />
          <Route path="master/industry/create" element={<IndustryMaster />} />
          <Route path="master/industry/:id" element={<IndustryMaster />} />
          <Route path="master/industry/:id/edit" element={<IndustryMaster />} />

          <Route path="master/designation" element={<DesignationMaster />} />
          <Route path="master/designation/create" element={<DesignationMaster />} />
          <Route path="master/designation/:id" element={<DesignationMaster />} />
          <Route path="master/designation/:id/edit" element={<DesignationMaster />} />

          <Route path="master/department" element={<DepartmentMaster />} />
          <Route path="master/department/create" element={<DepartmentMaster />} />
          <Route path="master/department/:id" element={<DepartmentMaster />} />
          <Route path="master/department/:id/edit" element={<DepartmentMaster />} />

          <Route path="master/source" element={<LeadSource />} />
          <Route path="master/source/create" element={<LeadSource />} />
          <Route path="master/source/:id" element={<LeadSource />} />
          <Route path="master/source/:id/edit" element={<LeadSource />} />

          {/* Lead Management Routes */}
          <Route path="lead-management">
            <Route index element={<AllLeads />} />
            <Route path="all-leads" element={<AllLeads />} />
            <Route path="pending" element={<Pending />} />
            <Route path="interested" element={<Interested />} />
            <Route path="meeting-scheduled" element={<MeetingScheduled />} />
            <Route path="meeting-done" element={<MeetingDone />} />
            <Route path="create" element={<CreateLead />} />
            <Route path="edit/:id" element={<EditLead />} />
            <Route path=":id" element={<ViewLead />} />
          </Route>

          {/* Miss Campaign Routes */}
          <Route path="miss-campaign/view" element={<MissCampaignView />} />
          <Route path="miss-campaign/create" element={<MissCampaignCreate />} />
          <Route path="miss-campaign/view/:id" element={<MissCampaignView />} />
          <Route path="miss-campaign/view/:id/edit" element={<MissCampaignView />} />
          {/* Brief Pipeline Routes */}
          <Route path="brief">
            <Route path="Brief_Pipeline" element={<BriefPipeline />} />
            <Route path="create" element={<BriefPipeline />} />
            <Route path=":id" element={<BriefPipeline />} />
            <Route path=":id/edit" element={<BriefPipeline />} />
          </Route>

          {/* User Management Routes */}
          <Route path="user-management">
            <Route index element={<AllPermissions />} />
            <Route path="permission" element={<AllPermissions />} />
            <Route path="permission/create" element={<CreatePermission />} />
            <Route path="permission/edit/:id" element={<CreatePermission />} />
            <Route path="permission/:id" element={<ViewPermission />} />
            <Route path="role" element={<AllRoles />} />
            <Route path="role/create" element={<CreateRole />} />
            <Route path="role/edit/:id" element={<CreateRole />} />
            <Route path="role/:id" element={<ViewRole />} />
          </Route>
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;