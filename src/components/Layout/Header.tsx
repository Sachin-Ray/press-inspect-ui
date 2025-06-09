import React from 'react';
import { Menu, User, LogOut, KeyRoundIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [profileOpen, setProfileOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden p-2 text-gray-600 rounded-md hover:bg-gray-100"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
          <div className="ml-4 md:ml-0 flex items-center">
            <h1 className="text-xl font-semibold text-[#0F52BA]">Printocare Inspection System</h1>
          </div>
        </div>

        <div className="flex items-center">
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 text-sm rounded-full focus:outline-none"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="bg-[#0F52BA] text-white p-2 rounded-full">
                <User size={20} />
              </div>
              <span className="hidden md:inline-block font-medium">
                {state.user?.name || 'User'}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                  <div className="font-medium">{state.user?.name}</div>
                  <div className="text-gray-500">{state.user?.email}</div>
                  <div className="text-xs mt-1 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full inline-block">
                    {state.user?.roles.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
                <button
                   onClick={() => navigate('/user/change-password')}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <KeyRoundIcon size={16} />
                  <span>Change Password</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;