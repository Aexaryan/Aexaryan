import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  InformationCircleIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline';

const FooterPageNavigation = () => {
  const location = useLocation();
  
  const navigationItems = [
    { name: 'درباره ما', href: '/about', icon: InformationCircleIcon },
    { name: 'تماس با ما', href: '/contact', icon: EnvelopeIcon },
    { name: 'حریم خصوصی', href: '/privacy', icon: ShieldCheckIcon },
    { name: 'شرایط استفاده', href: '/terms', icon: DocumentTextIcon },
    { name: 'سوالات متداول', href: '/faq', icon: QuestionMarkCircleIcon },
  ];

  return (
    <div className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          اطلاعات بیشتر
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                <span className="text-sm font-medium text-center">{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FooterPageNavigation;
