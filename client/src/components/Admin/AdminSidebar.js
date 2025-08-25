import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  FilmIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ClockIcon,
  IdentificationIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const adminMenuItems = [
    { 
      name: 'داشبورد', 
      href: '/admin/dashboard', 
      icon: HomeIcon,
      description: 'نمای کلی پلتفرم'
    },
    { 
      name: 'مدیریت کاربران', 
      href: '/admin/users', 
      icon: UsersIcon,
      description: 'مدیریت استعدادها و کارگردانان'
    },
    { 
      name: 'مدیریت کستینگ‌ها', 
      href: '/admin/castings', 
      icon: FilmIcon,
      description: 'مدیریت و نظارت بر کستینگ‌ها'
    },
    { 
      name: 'مدیریت درخواست‌ها', 
      href: '/admin/applications', 
      icon: DocumentTextIcon,
      description: 'نظارت بر درخواست‌های ارسالی'
    },
    { 
      name: 'گزارشات و آمار', 
      href: '/admin/analytics', 
      icon: ChartBarIcon,
      description: 'آمار و گزارشات پلتفرم'
    },
    { 
      name: 'گزارشات و نظارت', 
      href: '/admin/reports', 
      icon: ShieldCheckIcon,
      description: 'گزارشات تخلف و محتوای نامناسب'
    },
    { 
      name: 'مدیریت محتوا', 
      href: '/admin/content', 
      icon: NewspaperIcon,
      description: 'مدیریت مقالات و اخبار'
    },
    { 
      name: 'مجوز تایید خودکار', 
      href: '/admin/auto-approval', 
      icon: ShieldCheckIcon,
      description: 'مدیریت مجوزهای تایید خودکار'
    },
    { 
      name: 'اقدامات در انتظار', 
      href: '/admin/pending-actions', 
      icon: ExclamationTriangleIcon,
      description: 'اقدامات نیازمند بررسی'
    },
    { 
      name: 'فعالیت‌های اخیر', 
      href: '/admin/activities', 
      icon: ClockIcon,
      description: 'مشاهده فعالیت‌های پلتفرم'
    },
    { 
      name: 'مدیریت شناسایی', 
      href: '/admin/identification', 
      icon: ShieldCheckIcon,
      description: 'بررسی و تایید عکس‌های شناسایی'
    },
    { 
      name: 'تنظیمات سیستم', 
      href: '/admin/settings', 
      icon: CogIcon,
      description: 'تنظیمات پلتفرم'
    }
  ];

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-black">
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-700">
          <Link to="/admin/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <span className="mr-2 text-xl font-bold text-white">پنل ادمین</span>
          </Link>
        </div>
        
        <nav className="mt-8 px-4">
          <div className="space-y-1">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-red-600 text-white'
                      : 'text-white hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive(item.href) ? 'text-white' : 'text-white group-hover:text-white'
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className={`text-xs ${
                      isActive(item.href) ? 'text-white' : 'text-gray-100 group-hover:text-white'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Admin Info */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <div className="px-3 py-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-4 h-4 text-white" />
                </div>
                <div className="mr-3">
                  <div className="text-sm font-medium text-white">مدیر سیستم</div>
                  <div className="text-xs text-white">دسترسی کامل</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 px-3">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-white mb-2">آمار سریع</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white">کاربران فعال</span>
                  <span className="text-green-300">1,234</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white">کستینگ‌های فعال</span>
                  <span className="text-blue-300">567</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white">اقدامات در انتظار</span>
                  <span className="text-yellow-300">23</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50">
                      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
          <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-black">
            <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-700">
                <Link to="/admin/dashboard" className="flex items-center" onClick={onClose}>
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="mr-2 text-xl font-bold text-white">پنل ادمین</span>
                </Link>
                <button
                  onClick={onClose}
                  className="absolute left-4 p-2 text-white hover:text-white"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="mt-8 px-4 flex-1">
                <div className="space-y-1">
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-red-600 text-white'
                            : 'text-white hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isActive(item.href) ? 'text-white' : 'text-white group-hover:text-white'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className={`text-xs ${
                            isActive(item.href) ? 'text-white' : 'text-gray-100 group-hover:text-white'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Admin Info */}
                <div className="mt-8 pt-8 border-t border-gray-700">
                  <div className="px-3 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <ShieldCheckIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="mr-3">
                        <div className="text-sm font-medium text-white">مدیر سیستم</div>
                        <div className="text-xs text-white">دسترسی کامل</div>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
