import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import AppLayout from '../components/Layout/AppLayout';

// Auth
import LoginForm from '../components/Auth/LoginForm';

// Dashboard
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import UserDashboard from '../components/Dashboard/UserDashboard';

// Inspection
import InspectionForm from '../components/Inspection/InspectionForm';

// Reports
import ReportList from '../components/Report/ReportList';
import ReportDetail from '../components/Report/ReportDetail';
import ReportDownload from '../components/Report/ReportDownload';
import UserForm from '../components/User/UserForm';
import BuyerManagementPage from '../Admin_SuperAdmin/BuyerManagementPage';
import SellerManagementPage from '../Admin_SuperAdmin/SellerManagementPage';
import MachineManagementPage from '../Admin_SuperAdmin/MachineManagementPage';
import UnitManagementPage from '../Admin_SuperAdmin/UnitManagementPage';
import SubUnitManagementPage from '../Admin_SuperAdmin/SubUnitManagementPage';

// Protected route wrapper
interface ProtectedRouteProps {
  roles?: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, children }) => {
  const { state } = useAuth();
  
  if (state.isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!state.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.includes(state.user?.roles || '')) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

// Dashboard route - redirects to the appropriate dashboard based on user role
const DashboardRouter: React.FC = () => {
  const { state } = useAuth();
  
  if (state.user?.roles === 'Admin' || state.user?.roles === 'SuperAdmin') {
    return <AdminDashboard />;
  }
  
  return <UserDashboard />;
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardRouter />} />
          
          <Route path="inspection">
            <Route path="new" element={<InspectionForm />} />
          </Route>

          <Route path="user">
            <Route path="new" element={<UserForm />} />
          </Route>

          <Route path="manage">
            <Route path="machines" element={<MachineManagementPage />} />
            <Route path="buyers" element={<BuyerManagementPage />} />
            <Route path="sellers" element={<SellerManagementPage />} />
            <Route path="units" element={<UnitManagementPage />} />
            <Route path="sub-units" element={<SubUnitManagementPage />} />
          </Route>
          
          <Route path="reports">
            <Route index element={<ReportList />} />
            <Route path="all" element={
              <ProtectedRoute roles={['Admin', 'SuperAdmin']}>
                <ReportList showAll />
              </ProtectedRoute>
            } />
            <Route path=":id" element={<ReportDetail />} />
            <Route path=":id/download" element={<ReportDownload />} />
          </Route>
          
          <Route path="users" element={
            <ProtectedRoute roles={['Admin', 'SuperAdmin']}>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">User Management</h1>
                <p className="text-gray-600">User management functionality would be implemented here.</p>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="settings" element={
            <ProtectedRoute roles={['Admin']}>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">System Settings</h1>
                <p className="text-gray-600">System settings would be implemented here.</p>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="help" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Help & Documentation</h1>
              <p className="text-gray-600">Help documentation would be implemented here.</p>
            </div>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;