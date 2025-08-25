import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import MyArticles from '../../components/Director/MyArticles';
import api from '../../utils/api';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  PencilIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

const DirectorDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentCastings, setRecentCastings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, castingsRes] = await Promise.all([
        api.get('/applications/stats/summary'),
        api.get('/castings/me/castings?limit=5')
      ]);

      setStats(statsRes.data.stats);
      setRecentCastings(castingsRes.data.castings || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      draft: 'پیش‌نویس',
      active: 'فعال',
      paused: 'متوقف',
      closed: 'بسته',
      filled: 'تکمیل شده'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری داشبورد..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          خوش آمدید، {profile?.firstName || 'کارگردان محترم'}!
        </h1>
        <p className="text-gray-600">آخرین وضعیت کستینگ‌ها و درخواست‌های دریافتی</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BriefcaseIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.totalCastings || 0}
              </div>
              <div className="text-sm text-gray-600">کل کستینگ‌ها</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.activeCastings || 0}
              </div>
              <div className="text-sm text-gray-600">کستینگ فعال</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
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
              <CheckCircleIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.accepted || 0}
              </div>
              <div className="text-sm text-gray-600">پذیرفته شده</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.totalArticles || 0}
              </div>
              <div className="text-sm text-gray-600">مقالات من</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Castings */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              آخرین کستینگ‌ها
            </h2>
            <Link
              to="/director/castings"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              مشاهده همه
            </Link>
          </div>

                      {recentCastings.length > 0 ? (
              <div className="space-y-0">
                {recentCastings.map((casting, index) => (
                  <React.Fragment key={casting._id}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {casting.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{casting.projectType}</span>
                          <span className={`status-${casting.status}`}>
                            {getStatusText(casting.status)}
                          </span>
                          <span>{casting.applicationStats?.total || 0} درخواست</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/director/castings/${casting._id}/edit`}
                          className="btn-outline btn-sm flex items-center"
                        >
                          <PencilIcon className="w-4 h-4 ml-1" />
                          ویرایش
                        </Link>
                        <Link
                          to={`/director/castings/${casting._id}/applications`}
                          className="btn-outline btn-sm"
                        >
                          مشاهده
                        </Link>
                      </div>
                    </div>
                    {index < recentCastings.length - 1 && (
                      <div className="h-px bg-gray-200 mx-4"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
          ) : (
            <div className="text-center py-8">
              <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">هنوز کستینگی ایجاد نکرده‌اید</p>
              <Link
                to="/director/castings/new"
                className="btn-primary mt-4 inline-flex items-center"
              >
                <PlusIcon className="w-4 h-4 ml-2" />
                ایجاد کستینگ
              </Link>
            </div>
          )}
        </div>

        {/* Application Summary */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            خلاصه درخواست‌ها
          </h2>

          {stats?.totalApplications > 0 ? (
            <div className="space-y-0">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-yellow-600 ml-2" />
                  <span className="text-sm font-medium text-yellow-800">در انتظار</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">
                  {stats?.pending || 0}
                </span>
              </div>
              
              <div className="h-px bg-gray-200 mx-3"></div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <EyeIcon className="w-5 h-5 text-blue-600 ml-2" />
                  <span className="text-sm font-medium text-blue-800">بررسی شده</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {stats?.reviewed || 0}
                </span>
              </div>
              
              <div className="h-px bg-gray-200 mx-3"></div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 ml-2" />
                  <span className="text-sm font-medium text-green-800">پذیرفته شده</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {stats?.accepted || 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">هنوز درخواستی دریافت نکرده‌اید</p>
            </div>
          )}
        </div>

        {/* My Articles */}
        <MyArticles />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/director/castings/new"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">ایجاد کستینگ جدید</h3>
            <p className="text-sm text-gray-600">فرصت شغلی جدید منتشر کنید</p>
          </div>
        </Link>

        <Link
          to="/director/talents"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">جستجوی استعداد</h3>
            <p className="text-sm text-gray-600">استعدادهای مناسب را پیدا کنید</p>
          </div>
        </Link>

        <Link
          to="/director/castings"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BriefcaseIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">مدیریت کستینگ‌ها</h3>
            <p className="text-sm text-gray-600">کستینگ‌های خود را مدیریت کنید</p>
          </div>
        </Link>

        <Link
          to="/director/reports"
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

export default DirectorDashboard;