import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  DocumentTextIcon,
  EyeIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      const response = await api.get(`/applications/me?${params.toString()}`);
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'در انتظار',
      reviewed: 'بررسی شده',
      shortlisted: 'فهرست کوتاه',
      accepted: 'پذیرفته شده',
      rejected: 'رد شده',
      withdrawn: 'لغو شده'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'shortlisted':
        return <ExclamationTriangleIcon className="w-5 h-5 text-purple-600" />;
      case 'reviewed':
        return <EyeIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getProjectTypeText = (type) => {
    const types = {
      film: 'فیلم',
      tv_series: 'سریال تلویزیونی',
      commercial: 'تبلیغات',
      theater: 'تئاتر',
      music_video: 'موزیک ویدیو',
      documentary: 'مستند',
      web_series: 'وب سریال',
      other: 'سایر'
    };
    return types[type] || type;
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری درخواست‌ها..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">درخواست‌های من</h1>
        <p className="text-gray-600">مشاهده و پیگیری درخواست‌های ارسال شده</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">فیلتر:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">همه درخواست‌ها</option>
            <option value="pending">در انتظار</option>
            <option value="reviewed">بررسی شده</option>
            <option value="shortlisted">فهرست کوتاه</option>
            <option value="accepted">پذیرفته شده</option>
            <option value="rejected">رد شده</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.casting?.title}
                    </h3>
                    <div className="flex items-center">
                      {getStatusIcon(application.status)}
                      <span className={`mr-2 text-sm font-medium status-${application.status}`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>{getProjectTypeText(application.casting?.projectType)}</span>
                    <span className="flex items-center">
                      <MapPinIcon className="w-4 h-4 ml-1" />
                      {application.casting?.location?.city}
                    </span>
                    <span className="flex items-center">
                      <CalendarDaysIcon className="w-4 h-4 ml-1" />
                      {new Date(application.submittedAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">پیام پوششی:</h4>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {application.coverMessage}
                    </p>
                  </div>

                  {/* Director Response */}
                  {application.directorResponse?.message && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">پاسخ کارگردان:</h4>
                      <p className="text-sm text-blue-800">{application.directorResponse.message}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {new Date(application.directorResponse.respondedAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  )}

                  {/* Director Notes */}
                  {application.directorNotes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-yellow-900 mb-2">یادداشت کارگردان:</h4>
                      <p className="text-sm text-yellow-800">{application.directorNotes}</p>
                    </div>
                  )}
                </div>

                <Link
                  to={`/talent/jobs/${application.casting?._id}`}
                  className="btn-outline btn-sm"
                >
                  مشاهده کستینگ
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {filter === 'all' ? 'هنوز درخواستی ارسال نکرده‌اید' : 'درخواستی با این وضعیت یافت نشد'}
          </h2>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'برای شروع، فرصت‌های شغلی را مرور کنید و درخواست ارسال کنید'
              : 'فیلتر را تغییر دهید تا درخواست‌های دیگر را مشاهده کنید'
            }
          </p>
          {filter === 'all' ? (
            <Link to="/talent/jobs" className="btn-primary">
              مشاهده فرصت‌های شغلی
            </Link>
          ) : (
            <button onClick={() => setFilter('all')} className="btn-primary">
              مشاهده همه درخواست‌ها
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyApplications;