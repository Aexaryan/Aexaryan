import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ReportButton from '../../components/Common/ReportButton';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarDaysIcon,
  EyeIcon,
  ClockIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const JobListings = () => {
  const [castings, setCastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    projectType: '',
    roleType: '',
    city: '',
    province: '',
    gender: '',
    ageMin: '',
    ageMax: '',
    isPremium: false,
    isUrgent: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    fetchCastings();
  }, [filters, pagination.currentPage]);

  const fetchCastings = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });
      
      params.append('page', page);
      params.append('limit', 12);

      const response = await api.get(`/castings?${params.toString()}`);
      setCastings(response.data.castings || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching castings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      projectType: '',
      roleType: '',
      city: '',
      province: '',
      gender: '',
      ageMin: '',
      ageMax: '',
      isPremium: false,
      isUrgent: false
    });
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchCastings(page);
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
    return <LoadingSpinner text="در حال بارگذاری فرصت‌های شغلی..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">فرصت‌های شغلی</h1>
        <p className="text-gray-600">جستجو و درخواست برای کستینگ‌های مختلف</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Search Bar */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در عنوان، توضیحات یا تگ‌ها..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field pr-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center"
          >
            <FunnelIcon className="w-5 h-5 ml-2" />
            فیلترها
          </button>
          {Object.values(filters).some(v => v && v !== false && v !== '') && (
            <button
              onClick={clearFilters}
              className="btn-secondary flex items-center"
            >
              <XMarkIcon className="w-5 h-5 ml-2" />
              پاک کردن
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع پروژه
              </label>
              <select
                value={filters.projectType}
                onChange={(e) => handleFilterChange('projectType', e.target.value)}
                className="input-field"
              >
                <option value="">همه</option>
                <option value="film">فیلم</option>
                <option value="tv_series">سریال تلویزیونی</option>
                <option value="commercial">تبلیغات</option>
                <option value="theater">تئاتر</option>
                <option value="music_video">موزیک ویدیو</option>
                <option value="documentary">مستند</option>
                <option value="web_series">وب سریال</option>
                <option value="other">سایر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع نقش
              </label>
              <select
                value={filters.roleType}
                onChange={(e) => handleFilterChange('roleType', e.target.value)}
                className="input-field"
              >
                <option value="">همه</option>
                <option value="lead">نقش اصلی</option>
                <option value="supporting">نقش مکمل</option>
                <option value="background">پس‌زمینه</option>
                <option value="extra">فیگوران</option>
                <option value="voice_over">صداپیشگی</option>
                <option value="other">سایر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شهر
              </label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="input-field"
                placeholder="نام شهر"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                جنسیت
              </label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="input-field"
              >
                <option value="">همه</option>
                <option value="male">مرد</option>
                <option value="female">زن</option>
                <option value="any">فرقی ندارد</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                محدوده سنی
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.ageMin}
                  onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                  className="input-field"
                  placeholder="از"
                  min="0"
                  max="100"
                />
                <input
                  type="number"
                  value={filters.ageMax}
                  onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                  className="input-field"
                  placeholder="تا"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isPremium}
                  onChange={(e) => handleFilterChange('isPremium', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="mr-2 text-sm text-gray-700">ویژه</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isUrgent}
                  onChange={(e) => handleFilterChange('isUrgent', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="mr-2 text-sm text-gray-700">فوری</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {pagination.totalCount} فرصت شغلی یافت شد
        </p>
        {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>}
      </div>

      {/* Castings Grid */}
      {castings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {castings.map((casting) => (
            <div key={casting._id} className="card hover:shadow-md transition-shadow">
              {/* Photo Preview */}
              {casting.photos && casting.photos.length > 0 && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4">
                  <img
                    src={casting.photos[0].url}
                    alt={casting.photos[0].caption || `عکس کستینگ ${casting.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
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
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {casting.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {casting.description}
              </p>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium ml-2">نوع پروژه:</span>
                  {getProjectTypeText(casting.projectType)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium ml-2">نوع نقش:</span>
                  {getRoleTypeText(casting.roleType)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPinIcon className="w-4 h-4 ml-1" />
                  {casting.location?.city}, {casting.location?.province}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarDaysIcon className="w-4 h-4 ml-1" />
                  مهلت: {new Date(casting.applicationDeadline).toLocaleDateString('fa-IR')}
                </div>
              </div>

              {/* Requirements */}
              {casting.requirements && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1 text-xs text-gray-600">
                    {casting.requirements.gender && casting.requirements.gender !== 'any' && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {casting.requirements.gender === 'male' ? 'مرد' : 'زن'}
                      </span>
                    )}
                    {casting.requirements.ageRange?.min && casting.requirements.ageRange?.max && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {casting.requirements.ageRange.min}-{casting.requirements.ageRange.max} سال
                      </span>
                    )}
                    {casting.requirements.requiredSkills?.slice(0, 2).map((skill, index) => (
                      <span key={index} className="bg-primary-100 text-primary-800 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <EyeIcon className="w-4 h-4 ml-1" />
                  {casting.views || 0} بازدید
                </div>
                
                <div className="flex items-center gap-2">
                  {getDaysRemaining(casting.applicationDeadline) > 0 ? (
                    <span className="text-sm text-green-600 flex items-center">
                      <ClockIcon className="w-4 h-4 ml-1" />
                      {getDaysRemaining(casting.applicationDeadline)} روز باقی‌مانده
                    </span>
                  ) : (
                    <span className="text-red-600">منقضی شده</span>
                  )}
                  
                  <Link
                    to={`/talent/jobs/${casting._id}`}
                    className="btn-primary btn-sm"
                  >
                    مشاهده جزئیات
                  </Link>
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
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">هیچ فرصت شغلی یافت نشد</h2>
          <p className="text-gray-600 mb-4">
            {Object.values(filters).some(v => v && v !== false && v !== '') 
              ? 'فیلترهای خود را تغییر دهید یا پاک کنید'
              : 'در حال حاضر فرصت شغلی فعالی موجود نیست'
            }
          </p>
          {Object.values(filters).some(v => v && v !== false && v !== '') && (
            <button onClick={clearFilters} className="btn-primary">
              پاک کردن فیلترها
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

export default JobListings;