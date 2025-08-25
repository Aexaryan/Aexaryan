import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import { 
  Bars3Icon, 
  BellIcon, 
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">دسترسی محدود</h1>
          <p className="text-gray-600 mb-4">شما مجاز به دسترسی به پنل ادمین نیستید.</p>
          <Link
            to="/"
            className="btn-primary"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:pr-64">
        {/* Admin Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Header content */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-white" />
                </div>
                <span className="mr-2 text-lg font-semibold text-gray-900">پنل ادمین</span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
                <BellIcon className="w-5 h-5" />
              </button>

              {/* Admin profile dropdown */}
              <div className="relative">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <ShieldCheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="mr-3">
                      <div className="text-sm font-medium text-gray-900">مدیر سیستم</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  
                  {/* Logout button */}
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="خروج از سیستم"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
