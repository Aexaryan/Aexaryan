import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserIcon,
  FilmIcon,
  DocumentTextIcon,
  FlagIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const PendingActions = () => {
  const [pendingActions, setPendingActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPendingActions();
  }, [filter]);

  const fetchPendingActions = async () => {
    try {
      const response = await api.get(`/admin/pending-actions?filter=${filter}`);
      setPendingActions(response.data.pendingActions || []);
    } catch (error) {
      console.error('Error fetching pending actions:', error);
      toast.error('خطا در بارگذاری اقدامات در انتظار');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionId, action, type) => {
    try {
      await api.post(`/admin/pending-actions/${actionId}`, { action, type });
      toast.success('عملیات با موفقیت انجام شد');
      fetchPendingActions();
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('خطا در انجام عملیات');
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'user_approval':
        return <UserIcon className="w-5 h-5 text-blue-600" />;
      case 'casting_approval':
        return <FilmIcon className="w-5 h-5 text-green-600" />;
      case 'application_review':
        return <DocumentTextIcon className="w-5 h-5 text-purple-600" />;
      case 'report_review':
        return <FlagIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getActionText = (type) => {
    const actionMap = {
      user_approval: 'تایید کاربر',
      casting_approval: 'تایید کستینگ',
      application_review: 'بررسی درخواست',
      report_review: 'بررسی گزارش',
      content_moderation: 'نظارت محتوا'
    };
    return actionMap[type] || type;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { text: 'کم', class: 'bg-green-100 text-green-800' },
      medium: { text: 'متوسط', class: 'bg-yellow-100 text-yellow-800' },
      high: { text: 'زیاد', class: 'bg-red-100 text-red-800' },
      urgent: { text: 'فوری', class: 'bg-red-200 text-red-900' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const actionDate = new Date(date);
    const diffInHours = Math.floor((now - actionDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'کمتر از یک ساعت';
    if (diffInHours < 24) return `${diffInHours} ساعت پیش`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} روز پیش`;
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری اقدامات در انتظار..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">اقدامات در انتظار</h1>
            <p className="text-gray-600">اقدامات نیازمند بررسی</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">همه موارد</option>
              <option value="user_approval">تایید کاربر</option>
              <option value="casting_approval">تایید کستینگ</option>
              <option value="application_review">بررسی درخواست</option>
              <option value="report_review">بررسی گزارش</option>
              <option value="content_moderation">نظارت محتوا</option>
            </select>
            <button
              onClick={fetchPendingActions}
              className="btn-primary"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              بروزرسانی
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {pendingActions.length}
              </div>
              <div className="text-sm text-gray-600">کل اقدامات</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {pendingActions.filter(a => a.priority === 'urgent').length}
              </div>
              <div className="text-sm text-gray-600">فوری</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {pendingActions.filter(a => a.type === 'user_approval').length}
              </div>
              <div className="text-sm text-gray-600">تایید کاربر</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FilmIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {pendingActions.filter(a => a.type === 'casting_approval').length}
              </div>
              <div className="text-sm text-gray-600">تایید کستینگ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Actions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {pendingActions.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheckIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ اقدام در انتظاری وجود ندارد</h3>
            <p className="text-gray-500">همه موارد بررسی شده‌اند</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingActions.map((action) => (
              <div key={action._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        {getActionIcon(action.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {action.title}
                        </h3>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {getPriorityBadge(action.priority)}
                          <span className="text-sm text-gray-500">
                            {getTimeAgo(action.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </p>
                      <div className="flex items-center mt-3 space-x-4 space-x-reverse">
                        <span className="text-sm text-gray-500">
                          نوع: {getActionText(action.type)}
                        </span>
                        {action.itemId && (
                          <Link
                            to={`/admin/${action.type.replace('_', '-')}s/${action.itemId}`}
                            className="text-sm text-blue-600 hover:text-blue-900"
                          >
                            مشاهده جزئیات
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleAction(action._id, 'approve', action.type)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      تایید
                    </button>
                    <button
                      onClick={() => handleAction(action._id, 'reject', action.type)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      رد
                    </button>
                    <button
                      onClick={() => handleAction(action._id, 'review', action.type)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      بررسی
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">اقدامات سریع</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserIcon className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">مدیریت کاربران</div>
              <div className="text-sm text-gray-500">تایید و مدیریت کاربران</div>
            </div>
          </Link>
          
          <Link
            to="/admin/castings"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FilmIcon className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">مدیریت کستینگ‌ها</div>
              <div className="text-sm text-gray-500">تایید و مدیریت کستینگ‌ها</div>
            </div>
          </Link>
          
          <Link
            to="/admin/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FlagIcon className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">گزارشات</div>
              <div className="text-sm text-gray-500">بررسی گزارشات تخلف</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PendingActions;
