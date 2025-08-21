import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  UserIcon,
  EyeIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SearchTalents = () => {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    ageMin: '',
    ageMax: '',
    heightMin: '',
    heightMax: '',
    city: '',
    province: '',
    skills: '',
    languages: '',
    availabilityStatus: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    fetchTalents();
  }, [filters, pagination.currentPage]);

  const fetchTalents = async (page = 1) => {
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

      const response = await axios.get(`/talents?${params.toString()}`);
      setTalents(response.data.talents || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching talents:', error);
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
      gender: '',
      ageMin: '',
      ageMax: '',
      heightMin: '',
      heightMax: '',
      city: '',
      province: '',
      skills: '',
      languages: '',
      availabilityStatus: ''
    });
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchTalents(page);
  };

  const getAvailabilityText = (status) => {
    const statusMap = {
      available: 'فعال',
      limited: 'محدود',
      unavailable: 'غیرفعال'
    };
    return statusMap[status] || status;
  };

  const getAvailabilityColor = (status) => {
    const colorMap = {
      available: 'text-green-600',
      limited: 'text-yellow-600',
      unavailable: 'text-red-600'
    };
    return colorMap[status] || 'text-gray-600';
  };

  if (loading && talents.length === 0) {
    return <LoadingSpinner text="در حال بارگذاری استعدادها..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">جستجوی استعداد</h1>
        <p className="text-gray-600">پیدا کردن استعدادهای مناسب برای پروژه‌های شما</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Search Bar */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در نام، بیوگرافی یا مهارت‌ها..."
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
          {Object.values(filters).some(v => v && v !== '') && (
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
                <option value="other">سایر</option>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                محدوده قد (سانتی‌متر)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.heightMin}
                  onChange={(e) => handleFilterChange('heightMin', e.target.value)}
                  className="input-field"
                  placeholder="از"
                  min="100"
                  max="250"
                />
                <input
                  type="number"
                  value={filters.heightMax}
                  onChange={(e) => handleFilterChange('heightMax', e.target.value)}
                  className="input-field"
                  placeholder="تا"
                  min="100"
                  max="250"
                />
              </div>
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
                مهارت‌ها
              </label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => handleFilterChange('skills', e.target.value)}
                className="input-field"
                placeholder="مهارت‌ها (با کاما جدا کنید)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                زبان‌ها
              </label>
              <input
                type="text"
                value={filters.languages}
                onChange={(e) => handleFilterChange('languages', e.target.value)}
                className="input-field"
                placeholder="زبان‌ها (با کاما جدا کنید)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وضعیت فعالیت
              </label>
              <select
                value={filters.availabilityStatus}
                onChange={(e) => handleFilterChange('availabilityStatus', e.target.value)}
                className="input-field"
              >
                <option value="">همه</option>
                <option value="available">فعال</option>
                <option value="limited">محدود</option>
                <option value="unavailable">غیرفعال</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {pagination.totalCount} استعداد یافت شد
        </p>
        {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>}
      </div>

      {/* Talents Grid */}
      {talents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {talents.map((talent) => (
            <div key={talent._id} className="card hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  {talent.headshot?.url ? (
                    <img
                      src={talent.headshot.url}
                      alt={talent.artisticName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {talent.artisticName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <span>{talent.age} سال</span>
                    {talent.height && <span>• {talent.height} سانتی‌متر</span>}
                    <span className={`font-medium ${getAvailabilityColor(talent.availabilityStatus)}`}>
                      • {getAvailabilityText(talent.availabilityStatus)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <MapPinIcon className="w-4 h-4 ml-1" />
                {talent.city}, {talent.province}
              </div>

              {/* Biography */}
              {talent.biography && (
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {talent.biography}
                </p>
              )}

              {/* Skills */}
              {talent.skills?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">مهارت‌ها:</h4>
                  <div className="flex flex-wrap gap-1">
                    {talent.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                    {talent.skills.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{talent.skills.length - 3} مورد دیگر
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Languages */}
              {talent.languages?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">زبان‌ها:</h4>
                  <div className="flex flex-wrap gap-1">
                    {talent.languages.slice(0, 2).map((lang, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {lang.language}
                      </span>
                    ))}
                    {talent.languages.length > 2 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{talent.languages.length - 2} مورد دیگر
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <EyeIcon className="w-4 h-4 ml-1" />
                  {talent.profileViews || 0} بازدید
                </div>
                
                <Link
                  to={`/director/talents/${talent._id}`}
                  className="btn-primary btn-sm"
                >
                  مشاهده پروفایل
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">هیچ استعدادی یافت نشد</h2>
          <p className="text-gray-600 mb-4">
            {Object.values(filters).some(v => v && v !== '') 
              ? 'فیلترهای خود را تغییر دهید یا پاک کنید'
              : 'در حال حاضر استعدادی ثبت نام نکرده است'
            }
          </p>
          {Object.values(filters).some(v => v && v !== '') && (
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

export default SearchTalents;