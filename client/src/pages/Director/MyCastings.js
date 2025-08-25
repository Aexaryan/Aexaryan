import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';
import ReportButton from '../../components/Common/ReportButton';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const MyCastings = () => {
  const [castings, setCastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    fetchCastings();
  }, [filter, pagination.currentPage]);

  const fetchCastings = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter !== 'all') {
        params.append('status', filter);
      }
      params.append('page', page);
      params.append('limit', 10);

      const response = await api.get(`/castings/me/castings?${params.toString()}`);
      setCastings(response.data.castings || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching castings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchCastings(page);
  };

  const handleStatusChange = async (castingId, newStatus) => {
    try {
      await api.patch(`/castings/${castingId}/status`, { status: newStatus });
      fetchCastings(pagination.currentPage);
      toast.success('وضعیت کستینگ تغییر کرد');
    } catch (error) {
      console.error('Error updating casting status:', error);
      toast.error('خطا در تغییر وضعیت');
    }
  };

  const handleDeleteCasting = async (castingId) => {
    if (!window.confirm('آیا از حذف این کستینگ مطمئن هستید؟')) return;

    try {
      await api.delete(`/castings/${castingId}`);
      fetchCastings(pagination.currentPage);
      toast.success('کستینگ حذف شد');
    } catch (error) {
      console.error('Error deleting casting:', error);
      toast.error(error.response?.data?.error || 'خطا در حذف کستینگ');
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

  const getRoleTypeText = (type) => {
    const types = {
      lead: 'نقش اصلی',
      supporting: 'نقش مکمل',
      background: 'پس‌زمینه',
      extra: 'فیگوران',
      voice_over: 'صداپیشگی',
      other: 'سایر'
    };
    return types[type] || type;
  };

  const getDaysRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading && castings.length === 0) {
    return <LoadingSpinner text="در حال بارگذاری کستینگ‌ها..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">کستینگ‌های من</h1>
          <p className="text-gray-600">مدیریت کستینگ‌های منتشر شده</p>
        </div>
        <Link to="/director/castings/new" className="btn-primary flex items-center">
          <PlusIcon className="w-5 h-5 ml-2" />
          ایجاد کستینگ جدید
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">فیلتر بر اساس وضعیت:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">همه کستینگ‌ها</option>
              <option value="draft">پیش‌نویس</option>
              <option value="active">فعال</option>
              <option value="paused">متوقف</option>
              <option value="closed">بسته</option>
              <option value="filled">تکمیل شده</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            {pagination.totalCount} کستینگ یافت شد
          </div>
        </div>
      </div>

      {/* Castings List */}
      {castings.length > 0 ? (
        <div className="space-y-6 mb-8">
          {castings.map((casting) => (
            <div key={casting._id} className="card hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {casting.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {casting.isPremium && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          ⭐ ویژه
                        </span>
                      )}
                      {casting.isUrgent && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          🔥 فوری
                        </span>
                      )}
                      <span className={`status-${casting.status}`}>
                        {getStatusText(casting.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <span>
                      <strong>نوع پروژه:</strong> {getProjectTypeText(casting.projectType)}
                    </span>
                    <span>
                      <strong>نوع نقش:</strong> {getRoleTypeText(casting.roleType)}
                    </span>
                    <span className="flex items-center">
                      <MapPinIcon className="w-4 h-4 ml-1" />
                      {casting.location?.city}
                    </span>
                    <span className="flex items-center">
                      <EyeIcon className="w-4 h-4 ml-1" />
                      {casting.views || 0} بازدید
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {casting.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Change Dropdown */}
                  <select
                    value={casting.status}
                    onChange={(e) => handleStatusChange(casting._id, e.target.value)}
                    className="input-field text-sm w-auto"
                  >
                    <option value="draft">پیش‌نویس</option>
                    <option value="active">فعال</option>
                    <option value="paused">متوقف</option>
                    <option value="closed">بسته</option>
                    <option value="filled">تکمیل شده</option>
                  </select>

                  <Link
                    to={`/director/castings/${casting._id}/edit`}
                    className="btn-outline btn-sm flex items-center"
                  >
                    <PencilIcon className="w-4 h-4 ml-1" />
                    ویرایش
                  </Link>

                  <Link
                    to={`/director/castings/${casting._id}/applications`}
                    className="btn-outline btn-sm flex items-center"
                  >
                    <DocumentTextIcon className="w-4 h-4 ml-1" />
                    درخواست‌ها
                  </Link>

                  <button
                    onClick={() => handleDeleteCasting(casting._id)}
                    className="bg-secondary-200 hover:bg-secondary-300 text-white p-2 rounded flex items-center transition-colors duration-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {casting.applicationStats?.total || 0}
                  </div>
                  <div className="text-sm text-gray-600">کل درخواست‌ها</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    {casting.applicationStats?.pending || 0}
                  </div>
                  <div className="text-sm text-gray-600">در انتظار</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {casting.applicationStats?.shortlisted || 0}
                  </div>
                  <div className="text-sm text-gray-600">فهرست کوتاه</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {casting.applicationStats?.accepted || 0}
                  </div>
                  <div className="text-sm text-gray-600">پذیرفته شده</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <CalendarDaysIcon className="w-4 h-4 ml-1" />
                    ایجاد شده: {new Date(casting.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                  
                  <span className="flex items-center">
                    <ClockIcon className="w-4 h-4 ml-1" />
                    مهلت: {new Date(casting.applicationDeadline).toLocaleDateString('fa-IR')}
                  </span>
                  
                  {getDaysRemaining(casting.applicationDeadline) > 0 ? (
                    <span className="text-green-600">
                      {getDaysRemaining(casting.applicationDeadline)} روز باقی‌مانده
                    </span>
                  ) : (
                    <span className="text-red-600">منقضی شده</span>
                  )}
                </div>
                
                <ReportButton
                  reportType="casting"
                  targetId={casting._id}
                  targetTitle={casting.title}
                  variant="icon"
                  className="text-gray-400 hover:text-red-500"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {filter === 'all' ? 'هنوز کستینگی ایجاد نکرده‌اید' : 'کستینگی با این وضعیت یافت نشد'}
          </h2>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'برای شروع، کستینگ جدید ایجاد کنید'
              : 'فیلتر را تغییر دهید تا کستینگ‌های دیگر را مشاهده کنید'
            }
          </p>
          {filter === 'all' ? (
            <Link to="/director/castings/new" className="btn-primary">
              ایجاد کستینگ جدید
            </Link>
          ) : (
            <button onClick={() => setFilter('all')} className="btn-primary">
              مشاهده همه کستینگ‌ها
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            قبلی
          </button>
          
          <div className="flex space-x-1 space-x-reverse">
            {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
              const page = index + Math.max(1, pagination.currentPage - 2);
              if (page > pagination.totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    page === pagination.currentPage
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
};

export default MyCastings;