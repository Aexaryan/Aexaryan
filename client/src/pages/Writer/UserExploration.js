import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WriterLayout from '../../components/Writer/WriterLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import WriterStartConversationModal from '../../components/Writer/WriterStartConversationModal';
import DirectorDetailsModal from '../../components/Writer/DirectorDetailsModal';
import WriterStartConversationButton from '../../components/Messaging/WriterStartConversationButton';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useMessaging } from '../../contexts/MessagingContext';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  UserGroupIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  HeartIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const UserExploration = () => {
  const { token } = useAuth();
  const { fetchConversations } = useMessaging();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDirectorModal, setShowDirectorModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter, locationFilter, experienceFilter, token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Check authentication
      if (!token) {
        toast.error('لطفاً ابتدا وارد شوید');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(locationFilter && { location: locationFilter }),
        ...(experienceFilter !== 'all' && { experience: experienceFilter })
      });

      const response = await api.get(`/writer/users/explore?${params}`);
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalUsers(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response?.status === 401) {
        toast.error('احراز هویت ناموفق. لطفاً دوباره وارد شوید');
      } else if (error.response?.status === 403) {
        toast.error('دسترسی غیرمجاز. فقط نویسندگان می‌توانند به این بخش دسترسی داشته باشند');
      } else {
        toast.error('خطا در دریافت کاربران');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      talent: { color: 'bg-blue-100 text-blue-800', text: 'استعداد', icon: UserIcon },
      casting_director: { color: 'bg-purple-100 text-purple-800', text: 'کارگردان کستینگ', icon: UserGroupIcon },
      journalist: { color: 'bg-green-100 text-green-800', text: 'نویسنده', icon: AcademicCapIcon },
      admin: { color: 'bg-red-100 text-red-800', text: 'مدیر', icon: BriefcaseIcon }
    };

    const config = roleConfig[role] || roleConfig.talent;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'فعال' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'غیرفعال' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'در انتظار' },
      suspended: { color: 'bg-red-100 text-red-800', text: 'معلق' }
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleDirectorDetails = (user) => {
    setSelectedUser(user);
    setShowDirectorModal(true);
  };

  const closeDirectorModal = () => {
    setShowDirectorModal(false);
    setSelectedUser(null);
  };

  const getExperienceText = (experience) => {
    const experienceConfig = {
      beginner: 'تازه‌کار (0-2 سال)',
      intermediate: 'متوسط (2-5 سال)',
      advanced: 'پیشرفته (5-10 سال)',
      expert: 'متخصص (10+ سال)'
    };

    return experienceConfig[experience] || 'نامشخص';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.talentProfile?.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.castingDirectorProfile?.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setRoleFilter('all');
    setStatusFilter('all');
    setLocationFilter('');
    setExperienceFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری کاربران..." />;
  }

  return (
    <WriterLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">کاوش کاربران</h1>
            <p className="text-gray-600">جستجو و کشف استعدادها و کارگردانان کستینگ</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <FunnelIcon className="w-5 h-5" />
            {showFilters ? 'پنهان کردن فیلترها' : 'نمایش فیلترها'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نقش</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">همه نقش‌ها</option>
                <option value="talent">استعداد</option>
                <option value="casting_director">کارگردان کستینگ</option>
                <option value="journalist">نویسنده</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وضعیت</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
                <option value="pending">در انتظار</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">موقعیت</label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="جستجو بر اساس شهر..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Experience Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تجربه</label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">همه سطوح</option>
                <option value="beginner">تازه‌کار</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">پیشرفته</option>
                <option value="expert">متخصص</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              پاک کردن فیلترها
            </button>
            <span className="text-sm text-gray-500">
              {totalUsers} کاربر یافت شد
            </span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو در نام، ایمیل یا بیوگرافی..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Professional List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* List Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-3">کاربر</div>
            <div className="col-span-2">نقش</div>
            <div className="col-span-2">موقعیت</div>
            <div className="col-span-2">تجربه</div>
            <div className="col-span-2">عضویت</div>
            <div className="col-span-1">عملیات</div>
          </div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-gray-200">
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">کاربری یافت نشد</h3>
              <p className="text-gray-600">با تغییر فیلترها یا عبارت جستجو، کاربران دیگری را مشاهده کنید.</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* User Info */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {user.talentProfile?.headshot?.url ? (
                          <img
                            src={user.talentProfile.headshot.url}
                            alt={user.firstName || user.email}
                            className="w-full h-full object-cover"
                          />
                        ) : user.castingDirectorProfile?.profileImage?.url ? (
                          <img
                            src={user.castingDirectorProfile.profileImage.url}
                            alt={user.firstName || user.email}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.displayName || user.fullName || user.email
                          }
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(user.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="col-span-2">
                    {getRoleBadge(user.role)}
                  </div>

                  {/* Location */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span className="truncate">
                        {user.talentProfile?.city || user.castingDirectorProfile?.city || user.writerProfile?.location || 'نامشخص'}
                      </span>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                      <span className="truncate">
                        {user.role === 'talent' && user.talentProfile?.experience && getExperienceText(user.talentProfile.experience)}
                        {user.role === 'casting_director' && user.castingDirectorProfile?.experience && getExperienceText(user.castingDirectorProfile.experience)}
                        {user.role === 'journalist' && user.writerProfile?.experience && `${user.writerProfile.experience} سال`}
                        {!user.talentProfile?.experience && !user.castingDirectorProfile?.experience && !user.writerProfile?.experience && 'نامشخص'}
                      </span>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span>{new Date(user.createdAt).toLocaleDateString('fa-IR')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <WriterStartConversationButton
                        user={user}
                        className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      
                      {user.role === 'casting_director' && (
                        <button
                          onClick={() => handleDirectorDetails(user)}
                          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                          title="جزئیات کارگردان"
                        >
                          <UserGroupIcon className="w-3 h-3" />
                        </button>
                      )}
                      
                      {user.role === 'talent' && (
                        <Link
                          to={`/talents/${user._id}`}
                          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                          title="جزئیات استعداد"
                        >
                          <StarIcon className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Info (Optional - can be toggled) */}
                {(user.talentProfile?.biography || user.castingDirectorProfile?.biography || user.writerProfile?.bio) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {user.talentProfile?.biography || user.castingDirectorProfile?.biography || user.writerProfile?.bio}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              قبلی
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              بعدی
            </button>
          </nav>
        </div>
      )}

      {/* Modals */}
      <DirectorDetailsModal
        isOpen={showDirectorModal}
        onClose={closeDirectorModal}
        user={selectedUser}
      />
    </WriterLayout>
  );
};

export default UserExploration;
