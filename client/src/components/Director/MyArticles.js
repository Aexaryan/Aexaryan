import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { DocumentTextIcon, EyeIcon, ClockIcon, CheckCircleIcon, XCircleIcon, PlusIcon } from '@heroicons/react/24/outline';

const MyArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    pendingArticles: 0
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      // For now, we'll use mock data since directors might not have articles
      // In a real implementation, this would fetch from an API
      const mockArticles = [
        {
          _id: '1',
          title: 'راهنمای انتخاب بازیگر مناسب',
          status: 'published',
          views: 1250,
          createdAt: new Date('2024-01-15'),
          excerpt: 'نکات مهم در انتخاب بازیگر برای پروژه‌های سینمایی...'
        },
        {
          _id: '2',
          title: 'تکنیک‌های کارگردانی در سینما',
          status: 'draft',
          views: 0,
          createdAt: new Date('2024-01-10'),
          excerpt: 'مروری بر تکنیک‌های مختلف کارگردانی...'
        },
        {
          _id: '3',
          title: 'مدیریت بودجه در پروژه‌های سینمایی',
          status: 'pending',
          views: 0,
          createdAt: new Date('2024-01-05'),
          excerpt: 'نکات مهم در مدیریت مالی پروژه‌های سینمایی...'
        }
      ];

      setArticles(mockArticles);
      setStats({
        totalArticles: mockArticles.length,
        publishedArticles: mockArticles.filter(a => a.status === 'published').length,
        draftArticles: mockArticles.filter(a => a.status === 'draft').length,
        pendingArticles: mockArticles.filter(a => a.status === 'pending').length
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: {
        label: 'پیش‌نویس',
        color: 'bg-gray-100 text-gray-800',
        icon: ClockIcon
      },
      pending: {
        label: 'در انتظار تایید',
        color: 'bg-yellow-100 text-yellow-800',
        icon: ClockIcon
      },
      published: {
        label: 'منتشر شده',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon
      },
      rejected: {
        label: 'رد شده',
        color: 'bg-red-100 text-red-800',
        icon: XCircleIcon
      }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            مقالات من
          </h2>
          <Link
            to="/director/articles"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            مشاهده همه
          </Link>
        </div>
        <div className="text-center py-8">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">هنوز مقاله‌ای منتشر نکرده‌اید</p>
          <Link
            to="/director/articles/create"
            className="btn-primary mt-4 inline-flex items-center"
          >
            <PlusIcon className="w-4 h-4 ml-2" />
            نوشتن مقاله جدید
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          مقالات من
        </h2>
        <Link
          to="/director/articles"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          مشاهده همه
        </Link>
      </div>

      <div className="space-y-0">
        {articles.map((article, index) => (
          <React.Fragment key={article._id}>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-900">
                    {article.title}
                  </h3>
                  {getStatusBadge(article.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{article.views} بازدید</span>
                  <span>{new Date(article.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>
              <Link
                to={`/director/articles/${article._id}`}
                className="text-primary-600 hover:text-primary-900"
              >
                <EyeIcon className="w-4 h-4" />
              </Link>
            </div>
            {index < articles.length - 1 && (
              <div className="h-px bg-gray-200 mx-4"></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {stats.totalArticles > 5 && (
        <div className="mt-4 text-center">
          <Link
            to="/director/articles"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            مشاهده {stats.totalArticles - 5} مقاله دیگر
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyArticles;
