import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, ClipboardCheck, FileText, Users, ClipboardList, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { state } = useAuth();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(false);

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
        roles: ['PrePressInspector', 'PressInspector', 'PostPressInspector', 'PackagingInspector', 'SuperAdmin']
      },
      {
        name: 'My Reports',
        icon: <FileText size={20} />,
        path: '/reports/inspectors',
        roles: ['PrePressInspector', 'PressInspector', 'PostPressInspector', 'PackagingInspector','SuperAdmin']
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
        roles: ['Admin', 'SuperAdmin'],
        submenu: [
          {
            name: 'Machine Details',
            path: 'manage/machines'
          },
          {
            name: 'Buyers',
            path: 'manage/buyers'
          },
          {
            name: 'Sellers',
            path: 'manage/sellers'
          },
          {
            name: 'Units',
            path: 'manage/units'
          },
          {
            name: 'Sub-Units',
            path: 'manage/sub-units'
          },
          {
            name: 'Control Station',
            path: 'manage/control-stations'
          },
          {
            name: 'Control Station Checks', 
            path: 'manage/control-station-checks'
          },
          {
            name: 'Color Measuring Devices',
            path: 'manage/color-measuring-devices'
          },
          {
            name: 'General Questions',
            path: 'manage/general-questions'
          }
        ]
      }
    ];

    return items.filter(item => item.roles.includes(role));
  };

  const menuItems = getMenuItems();

  // Check if current path is part of the submenu
  const isSubmenuActive = (submenuItems: any[]) => {
    return submenuItems.some(item => location.pathname.startsWith(item.path));
  };

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
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0F52BA] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col md:h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full'
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
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => setOpenSubmenu(!openSubmenu)}
                      className={`flex items-center justify-between w-full gap-3 px-4 py-2.5 rounded-md transition-colors ${isSubmenuActive(item.submenu)
                          ? 'bg-white text-[#0F52BA] font-medium'
                          : 'text-white hover:bg-blue-700'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                      {openSubmenu ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {openSubmenu && (
                      <ul className="ml-4 mt-1 pl-4 border-l-2 border-blue-600">
                        {item.submenu.map((subItem, subIndex) => (
                          <li key={subIndex} className="mb-1">
                            <NavLink
                              to={subItem.path}
                              className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${isActive
                                  ? 'bg-blue-800 text-white font-medium'
                                  : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                                }`
                              }
                            >
                              <span>{subItem.name}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors ${isActive
                        ? 'bg-white text-[#0F52BA] font-medium'
                        : 'text-white hover:bg-blue-700'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 text-xs text-blue-300">
          <p>© 2025 Printocare</p>
          <p>v1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;