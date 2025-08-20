import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserIcon, 
  BriefcaseIcon, 
  DocumentTextIcon,
  UsersIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose, userRole }) => {
  const location = useLocation();

  const talentMenuItems = [
    { name: 'داشبورد', href: '/talent/dashboard', icon: HomeIcon },
    { name: 'پروفایل من', href: '/talent/profile', icon: UserIcon },
    { name: 'فرصت‌های شغلی', href: '/talent/jobs', icon: BriefcaseIcon },
    { name: 'درخواست‌های من', href: '/talent/applications', icon: DocumentTextIcon },
  ];

  const directorMenuItems = [
    { name: 'داشبورد', href: '/director/dashboard', icon: HomeIcon },
    { name: 'پروفایل من', href: '/director/profile', icon: UserIcon },
    { name: 'جستجوی استعداد', href: '/director/talents', icon: MagnifyingGlassIcon },
    { name: 'کستینگ‌های من', href: '/director/castings', icon: BriefcaseIcon },
    { name: 'ایجاد کستینگ', href: '/director/castings/new', icon: PlusCircleIcon },
  ];

  const menuItems = userRole === 'talent' ? talentMenuItems : directorMenuItems;

  const isActive = (href) => {
    if (href === '/talent/dashboard' || href === '/director/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white lg:border-l lg:border-gray-200">
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-200">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ک</span>
            </div>
            <span className="mr-2 text-xl font-bold text-gray-900">کستینگ پلت</span>
          </Link>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
                  >
                    <Icon className="w-5 h-5 ml-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User role badge */}
        <div className="absolute bottom-4 right-4 left-4">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
            <p className="text-xs text-primary-600 font-medium">
              {userRole === 'talent' ? 'استعداد' : 'کارگردان کستینگ'}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-gray-200">
          <Link to="/" className="flex items-center" onClick={onClose}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ک</span>
            </div>
            <span className="mr-2 text-xl font-bold text-gray-900">کستینگ پلت</span>
          </Link>
          
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <span className="sr-only">بستن منو</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
                  >
                    <Icon className="w-5 h-5 ml-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User role badge */}
        <div className="absolute bottom-4 right-4 left-4">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
            <p className="text-xs text-primary-600 font-medium">
              {userRole === 'talent' ? 'استعداد' : 'کارگردان کستینگ'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;