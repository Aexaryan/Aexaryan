import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { FlagIcon, EyeIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ReportsAgainstMe = () => {
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Determine the base route based on current location
  const isDirector = location.pathname.includes('/director');
  const baseRoute = isDirector ? '/director' : '/talent';

  useEffect(() => {
    fetchReportsAgainstMe();
  }, []);

  const fetchReportsAgainstMe = async () => {
    try {
      const [reportsRes, statsRes] = await Promise.all([
        api.get('/reports/against-me?limit=5'),
        api.get('/reports/stats/overview')
      ]);
      
      setReports(reportsRes.data.reports || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching reports against me:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'در انتظار',
        color: 'bg-yellow-100 text-yellow-800',
        icon: ClockIcon
      },
      under_review: {
        label: 'در حال بررسی',
        color: 'bg-blue-100 text-blue-800',
        icon: EyeIcon
      },
      resolved: {
        label: 'حل شده',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon
      },
      dismissed: {
        label: 'رد شده',
        color: 'bg-red-100 text-red-800',
        icon: XCircleIcon
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getCategoryLabel = (category) => {
    const categories = {
      inappropriate_content: 'محتوای نامناسب',
      spam: 'اسپم',
      fake_information: 'اطلاعات جعلی',
      harassment: 'آزار و اذیت',
      copyright_violation: 'نقض حق کپی‌رایت',
      technical_issue: 'مشکل فنی',
      payment_issue: 'مشکل پرداخت',
      safety_concern: 'نگرانی امنیتی',
      other: 'سایر'
    };
    return categories[category] || category;
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

  if (!stats || stats.reportsAgainstMe === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            گزارشات علیه من
          </h2>
          <Link
            to={`${baseRoute}/reports`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            مشاهده همه
          </Link>
        </div>
        <div className="text-center py-8">
          <FlagIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <p className="text-gray-600">هیچ گزارشی علیه شما ارسال نشده است</p>
          <p className="text-sm text-gray-500 mt-2">این نشانه خوبی است!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          گزارشات علیه من
        </h2>
        <Link
          to={`${baseRoute}/reports`}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          مشاهده همه
        </Link>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-gray-900">
                  {report.title}
                </h3>
                {getStatusBadge(report.status)}
              </div>
              <p className="text-sm text-gray-600">
                {getCategoryLabel(report.category)} • {report.reporter?.firstName} {report.reporter?.lastName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(report.createdAt).toLocaleDateString('fa-IR')}
              </p>
            </div>
            <Link
              to={`${baseRoute}/reports/${report._id}`}
              className="text-primary-600 hover:text-primary-900"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      {stats.reportsAgainstMe > 5 && (
        <div className="mt-4 text-center">
          <Link
            to={`${baseRoute}/reports`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            مشاهده {stats.reportsAgainstMe - 5} گزارش دیگر
          </Link>
        </div>
      )}
    </div>
  );
};

export default ReportsAgainstMe;
