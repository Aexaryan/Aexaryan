import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMessaging } from '../../contexts/MessagingContext';
import { 
  HomeIcon, 
  UserIcon, 
  BriefcaseIcon, 
  DocumentTextIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  DocumentTextIcon as DocumentIcon,
  QuestionMarkCircleIcon,
  FlagIcon,
  NewspaperIcon,
  BookOpenIcon,
  CogIcon,
  PhoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose, userRole }) => {
  const location = useLocation();
  const { unreadCount } = useMessaging();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const talentMenuItems = [
    // Main Dashboard
    {
      title: 'داشبورد',
      icon: HomeIcon,
      path: '/talent/dashboard',
      section: 'main'
    },
    
    // Profile & Applications
    {
      title: 'پروفایل من',
      icon: UserIcon,
      path: '/talent/profile',
      section: 'profile'
    },
    {
      title: 'فرصت‌های شغلی',
      icon: BriefcaseIcon,
      path: '/talent/jobs',
      section: 'profile'
    },
    {
      title: 'درخواست‌های من',
      icon: DocumentTextIcon,
      path: '/talent/applications',
      section: 'profile'
    },

    // Messaging
    {
      title: 'پیام‌ها',
      icon: ChatBubbleLeftIcon,
      path: '/talent/messages',
      section: 'messages',
      isMessaging: true
    },

    // Reports
    {
      title: 'گزارشات من',
      icon: FlagIcon,
      path: '/talent/reports',
      section: 'reports'
    },

    // Content
    {
      title: 'مقالات',
      icon: BookOpenIcon,
      path: '/blogs',
      section: 'content'
    },
    {
      title: 'اخبار',
      icon: NewspaperIcon,
      path: '/news',
      section: 'content'
    },

    // Settings
    {
      title: 'تنظیمات',
      icon: CogIcon,
      path: '/talent/settings',
      section: 'settings'
    }
  ];

  const directorMenuItems = [
    // Main Dashboard
    {
      title: 'داشبورد',
      icon: HomeIcon,
      path: '/director/dashboard',
      section: 'main'
    },
    
    // Profile & Castings
    {
      title: 'پروفایل من',
      icon: UserIcon,
      path: '/director/profile',
      section: 'profile'
    },
    {
      title: 'جستجوی استعداد',
      icon: MagnifyingGlassIcon,
      path: '/director/talents',
      section: 'profile'
    },
    {
      title: 'کستینگ‌های من',
      icon: BriefcaseIcon,
      path: '/director/castings',
      section: 'profile'
    },
    {
      title: 'ایجاد کستینگ',
      icon: PlusCircleIcon,
      path: '/director/castings/new',
      section: 'profile'
    },

    // Content
    {
      title: 'مقالات من',
      icon: BookOpenIcon,
      path: '/director/blogs',
      section: 'content'
    },

    // Messaging
    {
      title: 'پیام‌ها',
      icon: ChatBubbleLeftIcon,
      path: '/director/messages',
      section: 'messages',
      isMessaging: true
    },

    // Reports
    {
      title: 'گزارشات من',
      icon: FlagIcon,
      path: '/director/reports',
      section: 'reports'
    },

    // Content
    {
      title: 'مقالات',
      icon: BookOpenIcon,
      path: '/blogs',
      section: 'content'
    },
    {
      title: 'اخبار',
      icon: NewspaperIcon,
      path: '/news',
      section: 'content'
    },

    // Settings
    {
      title: 'تنظیمات',
      icon: CogIcon,
      path: '/director/settings',
      section: 'settings'
    }
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

  const menuItems = userRole === 'talent' ? talentMenuItems : directorMenuItems;

  const groupedMenuItems = {
    main: menuItems.filter(item => item.section === 'main'),
    profile: menuItems.filter(item => item.section === 'profile'),
    messages: menuItems.filter(item => item.section === 'messages'),
    reports: menuItems.filter(item => item.section === 'reports'),
    content: menuItems.filter(item => item.section === 'content'),
    settings: menuItems.filter(item => item.section === 'settings'),
    footer: footerItems
  };

  const isActive = (path) => {
    if (path === '/talent/dashboard' || path === '/director/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
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
        <span className="flex-1">{item.title}</span>
        {item.isMessaging && unreadCount > 0 && (
                          <span className="bg-accent-600 text-white text-xs font-bold px-2 py-1 rounded">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
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
    <>
      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-50 lg:block lg:overflow-y-auto bg-white shadow border-l-2 border-accent-600 transition-all duration-300 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b-2 border-accent-600">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-accent-600">
                  {userRole === 'talent' ? 'استعداد' : 'کارگردان کستینگ'}
                </h2>
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

          {/* Profile & Applications/Castings */}
          {renderSection(userRole === 'talent' ? 'پروفایل و درخواست‌ها' : 'پروفایل و کستینگ‌ها', groupedMenuItems.profile)}

          {/* Messages */}
          {renderSection('ارتباطات', groupedMenuItems.messages)}

          {/* Reports */}
          {renderSection('گزارش‌ها', groupedMenuItems.reports)}

          {/* Content */}
          {renderSection('محتوا', groupedMenuItems.content)}

          {/* Settings */}
          {renderSection('تنظیمات', groupedMenuItems.settings)}

          {/* Footer Links */}
          <div className="pt-6 border-t border-gray-200">
            {renderSection('پیوندهای مفید', groupedMenuItems.footer)}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white">
              <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-200">
                <Link to="/" className="flex items-center" onClick={onClose}>
                  <div className="w-8 h-8 bg-accent-600 rounded flex items-center justify-center">
                    <span className="text-black font-bold text-lg">ک</span>
                  </div>
                  <span className="mr-2 text-xl font-bold text-accent-600">کستینگ پلت</span>
                </Link>
                <button
                  onClick={onClose}
                  className="absolute left-4 p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav className="mt-8 px-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.title}>
                        <Link
                          to={item.path}
                          onClick={onClose}
                          className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                          <div className="flex items-center">
                            <Icon className="w-5 h-5 ml-3" />
                            <span className="flex-1">{item.title}</span>
                            {item.isMessaging && unreadCount > 0 && (
                              <span className="bg-accent-600 text-white text-xs font-bold px-2 py-1 rounded ml-2">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;