import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ReportsAgainstMe from '../../components/Reports/ReportsAgainstMe';
import api from '../../utils/api';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  EyeIcon,
  ChartBarIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

const TalentDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentCastings, setRecentCastings] = useState([]);
  const [reportsStats, setReportsStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, applicationsRes, castingsRes, reportsStatsRes] = await Promise.all([
        api.get('/talents/me/stats'),
        api.get('/applications/me?limit=5'),
        api.get('/castings?limit=6'),
        api.get('/reports/stats/overview')
      ]);

      setStats(statsRes.data.stats);
      setRecentApplications(applicationsRes.data.applications || []);
      setRecentCastings(castingsRes.data.castings || []);
      setReportsStats(reportsStatsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
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

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری داشبورد..." />;
  }

  const profileCompleteness = profile ? 
    ((profile.headshot?.url ? 1 : 0) + 
     (profile.biography ? 1 : 0) + 
     (profile.skills?.length > 0 ? 1 : 0) + 
     (profile.portfolio?.length > 0 ? 1 : 0) + 
     (profile.phoneNumber ? 1 : 0)) / 5 * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          خوش آمدید، {profile?.artisticName || profile?.firstName || 'استعداد عزیز'}!
        </h1>
        <p className="text-gray-600">
          آخرین وضعیت حساب کاربری و فعالیت‌های شما
        </p>
      </div>

      {/* Profile Completion Alert */}
      {profileCompleteness < 80 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="mr-3">
              <h3 className="text-sm font-medium text-yellow-800">
                پروفایل شما {Math.round(profileCompleteness)}% تکمیل شده است
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>برای افزایش شانس انتخاب، پروفایل خود را تکمیل کنید:</p>
                <div className="mt-2">
                  <Link
                    to="/talent/profile"
                    className="font-medium underline text-yellow-800 hover:text-yellow-600"
                  >
                    تکمیل پروفایل
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.totalApplications || 0}
              </div>
              <div className="text-sm text-gray-600">کل درخواست‌ها</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.pendingApplications || 0}
              </div>
              <div className="text-sm text-gray-600">در انتظار</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.acceptedApplications || 0}
              </div>
              <div className="text-sm text-gray-600">پذیرفته شده</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {profile?.profileViews || 0}
              </div>
              <div className="text-sm text-gray-600">بازدید پروفایل</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FlagIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {reportsStats?.reportsAgainstMe || 0}
              </div>
              <div className="text-sm text-gray-600">گزارشات علیه من</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              آخرین درخواست‌ها
            </h2>
            <Link
              to="/talent/applications"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              مشاهده همه
            </Link>
          </div>

          {recentApplications.length > 0 ? (
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div key={application._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {application.casting?.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {application.casting?.projectType} • {new Date(application.submittedAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(application.status)}
                    <span className={`mr-2 text-sm font-medium status-${application.status}`}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">هنوز درخواستی ارسال نکرده‌اید</p>
              <Link
                to="/talent/jobs"
                className="btn-primary mt-4 inline-flex items-center"
              >
                <PlusIcon className="w-4 h-4 ml-2" />
                مشاهده فرصت‌ها
              </Link>
            </div>
          )}
        </div>

        {/* Recent Job Opportunities */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              فرصت‌های جدید
            </h2>
            <Link
              to="/talent/jobs"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              مشاهده همه
            </Link>
          </div>

          {recentCastings.length > 0 ? (
            <div className="space-y-4">
              {recentCastings.slice(0, 5).map((casting) => (
                <div key={casting._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {casting.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {casting.projectType} • {casting.location?.city}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        مهلت: {new Date(casting.applicationDeadline).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <Link
                      to={`/talent/jobs/${casting._id}`}
                      className="btn-outline btn-sm"
                    >
                      مشاهده
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">فرصت شغلی جدیدی موجود نیست</p>
            </div>
          )}
        </div>

        {/* Reports Against Me */}
        <ReportsAgainstMe />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/talent/profile"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">ویرایش پروفایل</h3>
            <p className="text-sm text-gray-600">اطلاعات و عکس‌های خود را به‌روزرسانی کنید</p>
          </div>
        </Link>

        <Link
          to="/talent/jobs"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BriefcaseIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">جستجوی شغل</h3>
            <p className="text-sm text-gray-600">فرصت‌های شغلی جدید را کشف کنید</p>
          </div>
        </Link>

        <Link
          to="/talent/applications"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">درخواست‌های من</h3>
            <p className="text-sm text-gray-600">وضعیت درخواست‌هایتان را پیگیری کنید</p>
          </div>
        </Link>

        <Link
          to="/talent/reports"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FlagIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">گزارشات من</h3>
            <p className="text-sm text-gray-600">گزارشات ارسالی و علیه خود را مدیریت کنید</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default TalentDashboard;