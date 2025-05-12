import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const AppLayout: React.FC = () => {
  const { state } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  if (!state.isAuthenticated) {
    return <div>Unauthorized. Please log in.</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for larger screens and as a drawer for mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;