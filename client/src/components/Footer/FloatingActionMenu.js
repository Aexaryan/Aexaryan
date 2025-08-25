import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  InformationCircleIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  QuestionMarkCircleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const FloatingActionMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'درباره ما', href: '/about', icon: InformationCircleIcon, color: 'bg-blue-500' },
    { name: 'تماس با ما', href: '/contact', icon: EnvelopeIcon, color: 'bg-green-500' },
    { name: 'حریم خصوصی', href: '/privacy', icon: ShieldCheckIcon, color: 'bg-purple-500' },
    { name: 'شرایط استفاده', href: '/terms', icon: DocumentTextIcon, color: 'bg-orange-500' },
    { name: 'سوالات متداول', href: '/faq', icon: QuestionMarkCircleIcon, color: 'bg-red-500' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Menu Items */}
      {isOpen && (
        <div className="mb-4 space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center justify-center w-12 h-12 ${item.color} text-white rounded-full shadow-lg hover:scale-110 transition-all duration-200`}
                title={item.name}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-6 h-6" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 hover:scale-110"
        aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <PlusIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default FloatingActionMenu;
