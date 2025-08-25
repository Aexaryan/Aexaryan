import React from 'react';
import {
  DocumentTextIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const WriterStats = ({ stats }) => {
  const statCards = [
    {
      title: 'کل مقالات',
      value: stats.totalArticles,
      icon: DocumentTextIcon,
      color: 'bg-secondary-200',
      textColor: 'text-black',
      bgColor: 'bg-white'
    },
    {
      title: 'کل بازدیدها',
      value: stats.totalViews.toLocaleString(),
      icon: EyeIcon,
      color: 'bg-secondary-200',
      textColor: 'text-black',
      bgColor: 'bg-white'
    },
    {
      title: 'کل لایک‌ها',
      value: stats.totalLikes.toLocaleString(),
      icon: HeartIcon,
      color: 'bg-secondary-200',
      textColor: 'text-black',
      bgColor: 'bg-white'
    },
    {
      title: 'کل نظرات',
      value: stats.totalComments.toLocaleString(),
      icon: ChatBubbleLeftIcon,
      color: 'bg-secondary-200',
      textColor: 'text-black',
      bgColor: 'bg-white'
    },
    {
      title: 'در انتظار تایید',
      value: stats.pendingArticles,
      icon: ClockIcon,
      color: 'bg-secondary-200',
      textColor: 'text-black',
      bgColor: 'bg-white'
    },
    {
      title: 'تایید شده',
      value: stats.approvedArticles,
      icon: CheckCircleIcon,
      color: 'bg-secondary-200',
      textColor: 'text-black',
      bgColor: 'bg-white'
    },
    {
      title: 'رد شده',
      value: stats.rejectedArticles,
      icon: XCircleIcon,
      color: 'bg-secondary-200',
      textColor: 'text-black',
      bgColor: 'bg-white'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded p-6 border border-secondary-200 hover:shadow transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black mb-1">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WriterStats;
