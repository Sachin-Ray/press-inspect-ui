import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, ClipboardCheck, FileText, Users, ClipboardList , Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { state } = useAuth();
  const location = useLocation();

  // Close sidebar on route change in mobile view
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Get menu items based on user role
  const getMenuItems = () => {
    const role = state.user?.roles || '';
    
    const items = [
      {
        name: 'Dashboard',
        icon: <LayoutDashboard size={20} />,
        path: '/dashboard',
        roles: ['Admin', 'PrePressInspector', 'PressInspector', 'PostPressInspector', 'PackagingInspector', 'SuperAdmin']
      },
      {
        name: 'New Inspection',
        icon: <ClipboardCheck size={20} />,
        path: '/inspection/new',
        roles: ['PrePressInspector', 'PressInspector', 'PostPressInspector', 'PackagingInspector']
      },
      {
        name: 'My Reports',
        icon: <FileText size={20} />,
        path: '/reports/inspectors',
        roles: ['PrePressInspector', 'PressInspector', 'PostPressInspector', 'PackagingInspector']
      },
      
      {
        name: 'Manage Users',
        icon: <Users size={20} />,
        path: '/user/new',
        roles: ['SuperAdmin', 'Admin']
      },
      {
        name: 'Reports',
        icon: <Activity size={20} />,
        path: '/reports',
        roles: ['Admin', 'SuperAdmin']
      },
      {
        name: 'Master Data Entry',
        icon: <ClipboardList size={20} />,
        path: '/settings',
        roles: ['SuperAdmin']
      },
      // {
      //   name: 'Help',
      //   icon: <HelpCircle size={20} />,
      //   path: '/help',
      //   roles: ['Admin', 'PrePressInspector', 'PressInspector', 'PostPressInspector', 'PackagingInspector']
      // }
    ];

    return items.filter(item => item.roles.includes(role));
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0F52BA] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col md:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-blue-700">
          <div className="flex items-center">
            <span className="text-white text-lg font-bold">Printocare</span>
          </div>
          <button
            type="button"
            className="md:hidden p-2 text-white rounded-md hover:bg-blue-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-4 text-white">
          <div className="text-sm opacity-75">Logged in as</div>
          <div className="font-medium">{state.user?.name}</div>
          <div className="mt-1 inline-block bg-blue-700 text-xs px-2 py-0.5 rounded-full">
            {state.user?.roles.replace('_', ' ').toUpperCase()}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="px-2 py-4">
            {menuItems.map((item, index) => (
              <li key={index} className="mb-1">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors ${
                      isActive
                        ? 'bg-white text-[#0F52BA] font-medium'
                        : 'text-white hover:bg-blue-700'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 text-xs text-blue-300">
          <p>© 2024 Printocare</p>
          <p>v1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;