import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  DocumentTextIcon,
  NewspaperIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const WriterQuickActions = () => {
  const actions = [
    {
      title: 'نوشتن مقاله جدید',
      description: 'مقاله جدیدی بنویسید و منتشر کنید',
      icon: PlusIcon,
      path: '/writer/articles/create',
      color: 'bg-secondary-200 hover:bg-secondary-300',
      bgColor: 'bg-white'
    },
    {
      title: 'نوشتن خبر جدید',
      description: 'خبر جدیدی بنویسید و منتشر کنید',
      icon: PlusIcon,
      path: '/writer/news/create',
      color: 'bg-secondary-200 hover:bg-secondary-300',
      bgColor: 'bg-white'
    },
    {
      title: 'مقالات من',
      description: 'مقالات خود را مدیریت کنید',
      icon: DocumentTextIcon,
      path: '/writer/articles',
      color: 'bg-secondary-200 hover:bg-secondary-300',
      bgColor: 'bg-white'
    },
    {
      title: 'اخبار من',
      description: 'اخبار خود را مدیریت کنید',
      icon: NewspaperIcon,
      path: '/writer/news',
      color: 'bg-secondary-200 hover:bg-secondary-300',
      bgColor: 'bg-white'
    },
    {
      title: 'کاوش کاربران',
      description: 'کاربران را کاوش کنید',
      icon: ChartBarIcon,
      path: '/writer/users',
      color: 'bg-secondary-200 hover:bg-secondary-300',
      bgColor: 'bg-white'
    },
    {
      title: 'پیام‌ها',
      description: 'پیام‌ها و نظرات را بررسی کنید',
      icon: ChatBubbleLeftRightIcon,
      path: '/writer/messages',
      color: 'bg-secondary-200 hover:bg-secondary-300',
      bgColor: 'bg-white'
    }
  ];

  return (
    <div className="bg-white rounded shadow border border-secondary-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-accent-600 mb-6">
        اقدامات سریع
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.path}
              className={`${action.bgColor} rounded p-4 border border-secondary-200 hover:shadow transition-all duration-200 group`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${action.color} p-2 rounded transition-colors duration-200`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-black group-hover:text-white group-hover:bg-secondary-200 px-2 py-1 rounded transition-colors">
                  {action.title}
                </h3>
              </div>
              <p className="text-sm text-black">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default WriterQuickActions;
