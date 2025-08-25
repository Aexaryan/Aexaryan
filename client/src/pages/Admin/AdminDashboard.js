import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  UsersIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  UserGroupIcon,
  FilmIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch admin statistics
      const statsResponse = await api.get('/admin/stats');
      setStats(statsResponse.data);

      // Fetch identification statistics
      const identificationStatsResponse = await api.get('/identification/stats');
      setStats(prev => ({ ...prev, identification: identificationStatsResponse.data }));

      // Fetch recent activities
      const activitiesResponse = await api.get('/admin/activities');
      setRecentActivities(activitiesResponse.data.activities || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration': return <UsersIcon className="w-5 h-5" />;
      case 'casting_created': return <BriefcaseIcon className="w-5 h-5" />;
      case 'application_submitted': return <DocumentTextIcon className="w-5 h-5" />;
      case 'user_suspended': return <ExclamationTriangleIcon className="w-5 h-5" />;
      default: return <ChartBarIcon className="w-5 h-5" />;
    }
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری داشبورد ادمین..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">داشبورد ادمین</h1>
        <p className="text-gray-600">مدیریت کامل پلتفرم کستینگ</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.totalUsers || 0}
              </div>
              <div className="text-sm text-gray-600">کل کاربران</div>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+12%</span>
            <span className="text-gray-500 mr-1">از ماه گذشته</span>
          </div>
        </div>

        {/* Total Castings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FilmIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.totalCastings || 0}
              </div>
              <div className="text-sm text-gray-600">کل کستینگ‌ها</div>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+8%</span>
            <span className="text-gray-500 mr-1">از ماه گذشته</span>
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.totalApplications || 0}
              </div>
              <div className="text-sm text-gray-600">کل درخواست‌ها</div>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+15%</span>
            <span className="text-gray-500 mr-1">از ماه گذشته</span>
          </div>
        </div>

        {/* Identification Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.identification?.pending || 0}
              </div>
              <div className="text-sm text-gray-600">در انتظار تایید</div>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500 mr-1">تایید شده:</span>
            <span className="text-green-600 font-medium">{stats?.identification?.approved || 0}</span>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزیع کاربران</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserGroupIcon className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-gray-700">استعدادها</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900">
                  {stats?.talentsCount || 0}
                </span>
                <span className="text-sm text-gray-500 mr-2">({Math.round((stats?.talentsCount / stats?.totalUsers) * 100)}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FilmIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-700">کارگردانان</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900">
                  {stats?.directorsCount || 0}
                </span>
                <span className="text-sm text-gray-500 mr-2">({Math.round((stats?.directorsCount / stats?.totalUsers) * 100)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Casting Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">وضعیت کستینگ‌ها</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-700">فعال</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {stats?.activeCastings || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-gray-700">پیش‌نویس</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {stats?.draftCastings || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-gray-700">متوقف شده</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {stats?.suspendedCastings || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">فعالیت‌های اخیر</h3>
          <Link 
            to="/admin/activities"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            مشاهده همه →
          </Link>
        </div>
        <div className="space-y-4">
          {recentActivities.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 space-x-reverse">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.createdAt).toLocaleDateString('fa-IR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">اقدامات سریع</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/admin/users"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <UsersIcon className="w-6 h-6 text-blue-600 mr-3" />
            <span className="text-blue-900 font-medium">مدیریت کاربران</span>
          </Link>
          <Link 
            to="/admin/castings"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FilmIcon className="w-6 h-6 text-green-600 mr-3" />
            <span className="text-green-900 font-medium">مدیریت کستینگ‌ها</span>
          </Link>
          <Link 
            to="/admin/applications"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <DocumentTextIcon className="w-6 h-6 text-purple-600 mr-3" />
            <span className="text-purple-900 font-medium">مدیریت درخواست‌ها</span>
          </Link>
          <Link 
            to="/admin/reports"
            className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <ShieldCheckIcon className="w-6 h-6 text-red-600 mr-3" />
            <span className="text-red-900 font-medium">گزارشات و نظارت</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
