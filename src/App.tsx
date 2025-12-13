import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { handleTokenExpiration } from './utils/auth';
import authService from './services/authService';
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
import { AllLeads, CreateLead, EditLead, ViewLead, Pending, Interested, MeetingScheduled, MeetingDone, MeetingSchedule, BriefStatus } from './pages/LeadManagement';
import { AllPermissions, CreatePermission, EditPermission, ViewPermission, AllRoles, CreateRole, EditRole, ViewRole, AllUsers, CreateUser, EditUser, ViewUser } from './pages/UserManagement';
import Layout from './components/layout/Layout';
import PermissionRoute from './components/ui/PermissionRoute';
import { SidebarMenuProvider } from './context/SidebarMenuContext';
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
  // Initialize session refresh scheduling if user has valid cookies (e.g., page refresh)
  useEffect(() => {
    authService.startSessionFromCookies();
  }, []);

  return (
    <ErrorBoundary>
      <SidebarMenuProvider>
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
          <Route path="dashboard" element={<PermissionRoute><Dashboard /></PermissionRoute>} />
          <Route path="courses" element={<PermissionRoute><Courses /></PermissionRoute>} />
          <Route path="profile" element={<PermissionRoute><Profile /></PermissionRoute>} />
          <Route path="lead-source" element={<PermissionRoute><LeadSource /></PermissionRoute>} />
          {/* Master routes (support direct create/view/edit paths) */}
          <Route path="master/brand" element={<PermissionRoute><BrandMaster /></PermissionRoute>} />
          <Route path="master/brand/create" element={<PermissionRoute><BrandMaster /></PermissionRoute>} />
          <Route path="master/brand/:id" element={<PermissionRoute><BrandMaster /></PermissionRoute>} />
          <Route path="master/brand/:id/edit" element={<PermissionRoute><BrandMaster /></PermissionRoute>} />

          <Route path="master/agency" element={<PermissionRoute><AgencyMaster /></PermissionRoute>} />
          <Route path="master/agency/create" element={<PermissionRoute><AgencyMaster /></PermissionRoute>} />
          <Route path="master/agency/:id" element={<PermissionRoute><AgencyMaster /></PermissionRoute>} />
          <Route path="master/agency/:id/edit" element={<PermissionRoute><AgencyMaster /></PermissionRoute>} />

          <Route path="master/industry" element={<PermissionRoute><IndustryMaster /></PermissionRoute>} />
          <Route path="master/industry/create" element={<PermissionRoute><IndustryMaster /></PermissionRoute>} />
          <Route path="master/industry/:id" element={<PermissionRoute><IndustryMaster /></PermissionRoute>} />
          <Route path="master/industry/:id/edit" element={<PermissionRoute><IndustryMaster /></PermissionRoute>} />

          <Route path="master/designation" element={<PermissionRoute><DesignationMaster /></PermissionRoute>} />
          <Route path="master/designation/create" element={<PermissionRoute><DesignationMaster /></PermissionRoute>} />
          <Route path="master/designation/:id" element={<PermissionRoute><DesignationMaster /></PermissionRoute>} />
          <Route path="master/designation/:id/edit" element={<PermissionRoute><DesignationMaster /></PermissionRoute>} />

          <Route path="master/department" element={<PermissionRoute><DepartmentMaster /></PermissionRoute>} />
          <Route path="master/department/create" element={<PermissionRoute><DepartmentMaster /></PermissionRoute>} />
          <Route path="master/department/:id" element={<PermissionRoute><DepartmentMaster /></PermissionRoute>} />
          <Route path="master/department/:id/edit" element={<PermissionRoute><DepartmentMaster /></PermissionRoute>} />

          <Route path="master/source" element={<PermissionRoute><LeadSource /></PermissionRoute>} />
          <Route path="master/source/create" element={<PermissionRoute><LeadSource /></PermissionRoute>} />
          <Route path="master/source/:id" element={<PermissionRoute><LeadSource /></PermissionRoute>} />
          <Route path="master/source/:id/edit" element={<PermissionRoute><LeadSource /></PermissionRoute>} />

          {/* Lead Management Routes */}
          <Route path="lead-management">
            <Route index element={<PermissionRoute><AllLeads /></PermissionRoute>} />
            <Route path="all-leads" element={<PermissionRoute><AllLeads /></PermissionRoute>} />
            <Route path="brief-status" element={<PermissionRoute><BriefStatus /></PermissionRoute>} />
            <Route path="pending" element={<PermissionRoute><Pending /></PermissionRoute>} />
            <Route path="interested" element={<PermissionRoute><Interested /></PermissionRoute>} />
            <Route path="meeting-scheduled" element={<PermissionRoute><MeetingScheduled /></PermissionRoute>} />
            <Route path="meeting-done" element={<PermissionRoute><MeetingDone /></PermissionRoute>} />
            <Route path="create" element={<PermissionRoute><CreateLead /></PermissionRoute>} />
            <Route path="edit/:id" element={<PermissionRoute><EditLead /></PermissionRoute>} />
            <Route path=":id" element={<PermissionRoute><ViewLead /></PermissionRoute>} />
          </Route>

          {/* Meeting Schedule top-level route */}
          <Route path="meeting-schedule" element={<PermissionRoute><MeetingSchedule /></PermissionRoute>} />

          {/* Miss Campaign Routes */}
          <Route path="miss-campaign/view" element={<PermissionRoute><MissCampaignView /></PermissionRoute>} />
          <Route path="miss-campaign/create" element={<PermissionRoute><MissCampaignCreate /></PermissionRoute>} />
          <Route path="miss-campaign/view/:id" element={<PermissionRoute><MissCampaignView /></PermissionRoute>} />
          <Route path="miss-campaign/view/:id/edit" element={<PermissionRoute><MissCampaignView /></PermissionRoute>} />
          {/* Brief Pipeline Routes */}
          <Route path="brief">
            <Route path="Brief_Pipeline" element={<PermissionRoute><BriefPipeline /></PermissionRoute>} />
            <Route path="create" element={<PermissionRoute><BriefPipeline /></PermissionRoute>} />
            <Route path=":id" element={<PermissionRoute><BriefPipeline /></PermissionRoute>} />
            <Route path=":id/edit" element={<PermissionRoute><BriefPipeline /></PermissionRoute>} />
          </Route>

          {/* User Management Routes */}
          <Route path="user-management">
            <Route index element={<PermissionRoute><AllPermissions /></PermissionRoute>} />
            <Route path="permission" element={<PermissionRoute><AllPermissions /></PermissionRoute>} />
            <Route path="permission/create" element={<PermissionRoute><CreatePermission /></PermissionRoute>} />
            <Route path="permission/edit/:id" element={<PermissionRoute><EditPermission /></PermissionRoute>} />
            <Route path="permission/:id" element={<PermissionRoute><ViewPermission /></PermissionRoute>} />
            <Route path="role" element={<PermissionRoute><AllRoles /></PermissionRoute>} />
            <Route path="role/create" element={<PermissionRoute><CreateRole /></PermissionRoute>} />
            <Route path="role/edit/:id" element={<PermissionRoute><EditRole /></PermissionRoute>} />
            <Route path="role/:id" element={<PermissionRoute><ViewRole /></PermissionRoute>} />
            <Route path="user" element={<PermissionRoute><AllUsers /></PermissionRoute>} />
            <Route path="user/create" element={<PermissionRoute><CreateUser /></PermissionRoute>} />
            <Route path="user/edit/:id" element={<PermissionRoute><EditUser /></PermissionRoute>} />
            <Route path="user/:id" element={<PermissionRoute><ViewUser /></PermissionRoute>} />
          </Route>
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Routes>
        </Router>
      </SidebarMenuProvider>
    </ErrorBoundary>
  );
}

export default App;