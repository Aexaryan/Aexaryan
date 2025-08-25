import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  FilmIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const CastingManagement = () => {
  const [castings, setCastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCastings, setSelectedCastings] = useState([]);

  useEffect(() => {
    fetchCastings();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchCastings = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        type: typeFilter !== 'all' ? typeFilter : ''
      });

      const response = await api.get(`/admin/castings?${params}`);
      setCastings(response.data.castings || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching castings:', error);
      toast.error('خطا در بارگذاری کستینگ‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCastings();
  };

  const handleStatusChange = async (castingId, newStatus) => {
    try {
      await api.patch(`/admin/castings/${castingId}/status`, { status: newStatus });
      toast.success('وضعیت کستینگ با موفقیت تغییر یافت');
      fetchCastings();
    } catch (error) {
      console.error('Error updating casting status:', error);
      toast.error('خطا در تغییر وضعیت کستینگ');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCastings.length === 0) {
      toast.error('لطفاً کستینگ‌ها را انتخاب کنید');
      return;
    }

    try {
      await api.post('/admin/castings/bulk-action', {
        castingIds: selectedCastings,
        action: action
      });
      toast.success('عملیات با موفقیت انجام شد');
      setSelectedCastings([]);
      fetchCastings();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('خطا در انجام عملیات');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'فعال', class: 'bg-green-100 text-green-800' },
      draft: { text: 'پیش‌نویس', class: 'bg-gray-100 text-gray-800' },
      paused: { text: 'متوقف', class: 'bg-yellow-100 text-yellow-800' },
      closed: { text: 'بسته', class: 'bg-red-100 text-red-800' },
      filled: { text: 'تکمیل شده', class: 'bg-blue-100 text-blue-800' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getProjectTypeText = (type) => {
    const typeMap = {
      film: 'فیلم',
      tv_series: 'سریال تلویزیونی',
      commercial: 'تبلیغات',
      theater: 'تئاتر',
      music_video: 'موزیک ویدیو',
      documentary: 'مستند',
      web_series: 'سریال اینترنتی',
      other: 'سایر'
    };
    return typeMap[type] || type;
  };

  const getRoleTypeText = (type) => {
    const typeMap = {
      lead: 'نقش اصلی',
      supporting: 'نقش مکمل',
      background: 'پس‌زمینه',
      extra: 'سیاهی لشگر',
      voice_over: 'صدا پیشه',
      other: 'سایر'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری کستینگ‌ها..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت کستینگ‌ها</h1>
            <p className="text-gray-600">مدیریت کامل کستینگ‌های پلتفرم</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBulkAction('approve')}
              disabled={selectedCastings.length === 0}
              className="btn-outline disabled:opacity-50"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              تایید انتخاب شده
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              disabled={selectedCastings.length === 0}
              className="btn-outline text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              رد انتخاب شده
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در کستینگ‌ها..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="draft">پیش‌نویس</option>
            <option value="paused">متوقف</option>
            <option value="closed">بسته</option>
            <option value="filled">تکمیل شده</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">همه انواع</option>
            <option value="film">فیلم</option>
            <option value="tv_series">سریال تلویزیونی</option>
            <option value="commercial">تبلیغات</option>
            <option value="theater">تئاتر</option>
            <option value="music_video">موزیک ویدیو</option>
            <option value="documentary">مستند</option>
            <option value="web_series">سریال اینترنتی</option>
            <option value="other">سایر</option>
          </select>

          {/* Search Button */}
          <button
            type="submit"
            className="btn-primary"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            فیلتر
          </button>
        </form>
      </div>

      {/* Castings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCastings(castings.map(casting => casting._id));
                      } else {
                        setSelectedCastings([]);
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  کستینگ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  کارگردان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مکان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاریخ ایجاد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اقدامات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {castings.map((casting) => (
                <tr key={casting._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCastings.includes(casting._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCastings([...selectedCastings, casting._id]);
                        } else {
                          setSelectedCastings(selectedCastings.filter(id => id !== casting._id));
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {casting.photos && casting.photos.length > 0 ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={casting.photos[0].url}
                            alt=""
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <FilmIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">
                          {casting.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getRoleTypeText(casting.roleType)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {casting.castingDirector?.firstName} {casting.castingDirector?.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getProjectTypeText(casting.projectType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {casting.location?.city}, {casting.location?.province}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(casting.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(casting.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/castings/${casting._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      {casting.status === 'draft' && (
                        <button
                          onClick={() => handleStatusChange(casting._id, 'active')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                      )}
                      {casting.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(casting._id, 'paused')}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <ClockIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(casting._id, 'closed')}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  قبلی
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  بعدی
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    نمایش <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> تا{' '}
                    <span className="font-medium">{Math.min(currentPage * 20, castings.length)}</span> از{' '}
                    <span className="font-medium">{castings.length}</span> نتیجه
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CastingManagement;
