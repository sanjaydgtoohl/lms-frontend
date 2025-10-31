import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
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
import Layout from './components/layout/Layout';
import { ROUTES } from './constants';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
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
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Router>
  );
}

export default App;