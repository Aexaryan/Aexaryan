import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  DocumentTextIcon,
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  UserIcon,
  UserGroupIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  PlusIcon,
  ChartBarIcon,
  BellIcon,
  BookOpenIcon,
  GlobeAltIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const WriterSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    // Main Dashboard
    {
      title: 'داشبورد',
      icon: HomeIcon,
      path: '/writer/dashboard',
      section: 'main'
    },
    
    // Writing & Content Management
    {
      title: 'نوشتن مقاله',
      icon: PlusIcon,
      path: '/writer/articles/create',
      section: 'writing'
    },
    {
      title: 'مقالات من',
      icon: DocumentTextIcon,
      path: '/writer/articles',
      section: 'writing'
    },
    {
      title: 'نوشتن خبر',
      icon: PlusIcon,
      path: '/writer/news/create',
      section: 'writing'
    },
    {
      title: 'اخبار من',
      icon: NewspaperIcon,
      path: '/writer/news',
      section: 'writing'
    },

    
    // Analytics & Reports
    {
      title: 'کاوش کاربران',
      icon: UserGroupIcon,
      path: '/writer/users',
      section: 'reports'
    },
    {
      title: 'گزارش‌ها',
      icon: ExclamationTriangleIcon,
      path: '/writer/reports',
      section: 'reports'
    },
    {
      title: 'آمار و تحلیل',
      icon: ChartBarIcon,
      path: '/writer/analytics',
      section: 'reports'
    },

    
    // Messaging
    {
      title: 'پیام‌ها',
      icon: ChatBubbleLeftRightIcon,
      path: '/writer/messages',
      section: 'messages'
    },
    
    // Profile & Settings
    {
      title: 'پروفایل نویسنده',
      icon: UserIcon,
      path: '/writer/profile',
      section: 'profile'
    },
    {
      title: 'تنظیمات',
      icon: CogIcon,
      path: '/writer/settings',
      section: 'profile'
    },
    

  ];

  const footerItems = [
    {
      title: 'درباره ما',
      icon: InformationCircleIcon,
      path: '/about',
      section: 'footer'
    },
    {
      title: 'تماس با ما',
      icon: PhoneIcon,
      path: '/contact',
      section: 'footer'
    },
    {
      title: 'سوالات متداول',
      icon: QuestionMarkCircleIcon,
      path: '/faq',
      section: 'footer'
    },
    {
      title: 'قوانین و مقررات',
      icon: BookOpenIcon,
      path: '/terms',
      section: 'footer'
    },
    {
      title: 'حریم خصوصی',
      icon: GlobeAltIcon,
      path: '/privacy',
      section: 'footer'
    }
  ];

  const groupedMenuItems = {
    main: menuItems.filter(item => item.section === 'main'),
    writing: menuItems.filter(item => item.section === 'writing'),
    content: menuItems.filter(item => item.section === 'content'),
    reports: menuItems.filter(item => item.section === 'reports'),
    messages: menuItems.filter(item => item.section === 'messages'),
    profile: menuItems.filter(item => item.section === 'profile'),
    footer: footerItems
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded transition-colors duration-200 ${
          isActive(item.path)
            ? 'bg-secondary-200 text-white border-r-2 border-accent-600'
            : 'text-black hover:bg-secondary-200 hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{item.title}</span>
      </Link>
    );
  };

  const renderSection = (title, items, showTitle = true) => (
    <div className="mb-6">
      {showTitle && (
        <h3 className="px-4 mb-3 text-xs font-semibold text-accent-600 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {items.map(renderMenuItem)}
      </div>
    </div>
  );

  return (
    <div className={`bg-white shadow border-l-2 border-accent-600 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b-2 border-accent-600">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-accent-600">نویسنده</h2>
              <p className="text-sm text-black">{user?.name}</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-120px)]">
        {/* Main */}
        {renderSection('اصلی', groupedMenuItems.main, false)}

        {/* Writing */}
        {renderSection('نوشتن و ویرایش', groupedMenuItems.writing)}



        {/* Reports */}
        {renderSection('گزارش‌ها و تحلیل', groupedMenuItems.reports)}

        {/* Messages */}
        {renderSection('ارتباطات', groupedMenuItems.messages)}

        {/* Profile */}
        {renderSection('حساب کاربری', groupedMenuItems.profile)}

        {/* Footer Links */}
        <div className="pt-6 border-t border-gray-200">
          {renderSection('پیوندهای مفید', groupedMenuItems.footer)}
        </div>
      </div>
    </div>
  );
};

export default WriterSidebar;
