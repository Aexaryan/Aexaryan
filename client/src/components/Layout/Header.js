import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const Header = ({ onMenuClick, user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout, profile } = useAuth();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
  };

  const getUserDisplayName = () => {
    if (profile) {
      if (user.role === 'talent') {
        return profile.artisticName || `${profile.firstName} ${profile.lastName}`;
      } else {
        return `${profile.firstName} ${profile.lastName}`;
      }
    }
    return user.email;
  };

  const getProfileLink = () => {
    return user.role === 'talent' ? '/talent/profile' : '/director/profile';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={onMenuClick}
          >
            <span className="sr-only">باز کردن منو</span>
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Page title - could be dynamic */}
          <div className="flex-1 lg:flex-none">
            <h1 className="text-lg font-semibold text-gray-900 lg:hidden">
              کستینگ پلت
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <span className="sr-only">اعلان‌ها</span>
              <BellIcon className="h-6 w-6" />
            </button>

            {/* User menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {profile?.profileImage?.url || profile?.headshot?.url ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={profile.profileImage?.url || profile.headshot?.url}
                    alt={getUserDisplayName()}
                  />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                )}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.role === 'talent' ? 'استعداد' : 'کارگردان'}
                  </p>
                </div>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    to={getProfileLink()}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserCircleIcon className="h-4 w-4 ml-3" />
                    پروفایل من
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <CogIcon className="h-4 w-4 ml-3" />
                    تنظیمات
                  </Link>
                  
                  <hr className="my-2 border-gray-200" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 ml-3" />
                    خروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;