import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useRateLimit } from '../../hooks/useRateLimit';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ApprovalBadge from '../../components/Common/ApprovalBadge';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  FilmIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Rate limiting hook
  const {
    isRateLimited,
    formatCountdown,
    shouldDisableActions,
    handleRateLimitError
  } = useRateLimit();

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        role: roleFilter !== 'all' ? roleFilter : ''
      });

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (handleRateLimitError(error)) {
        // Rate limit error handled by the hook
        toast.error('درخواست‌های شما بیش از حد مجاز است. لطفاً صبر کنید.');
      } else {
        toast.error('خطا در بارگذاری کاربران');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, roleFilter, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success('وضعیت کاربر با موفقیت تغییر یافت');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      
      if (handleRateLimitError(error)) {
        // Rate limit error handled by the hook
        toast.error('درخواست‌های شما بیش از حد مجاز است. لطفاً صبر کنید.');
      } else {
        toast.error('خطا در تغییر وضعیت کاربر');
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error('لطفاً کاربران را انتخاب کنید');
      return;
    }

    try {
      await api.post('/admin/users/bulk-action', {
        userIds: selectedUsers,
        action: action
      });
      toast.success('عملیات با موفقیت انجام شد');
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      
      if (handleRateLimitError(error)) {
        // Rate limit error handled by the hook
        toast.error('درخواست‌های شما بیش از حد مجاز است. لطفاً صبر کنید.');
      } else {
        toast.error('خطا در انجام عملیات');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'فعال', class: 'bg-green-100 text-green-800' },
      pending: { text: 'در انتظار', class: 'bg-yellow-100 text-yellow-800' },
      suspended: { text: 'تعلیق شده', class: 'bg-red-100 text-red-800' },
      inactive: { text: 'غیرفعال', class: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getRoleIcon = (role) => {
    return role === 'talent' ? (
      <UserGroupIcon className="w-5 h-5 text-blue-600" />
    ) : (
      <FilmIcon className="w-5 h-5 text-green-600" />
    );
  };

  const getRoleText = (role) => {
    return role === 'talent' ? 'استعداد' : 'کارگردان';
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری کاربران..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Rate Limit Warning */}
      {isRateLimited && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                درخواست‌های شما محدود شده است
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                {formatCountdown() ? `لطفاً ${formatCountdown()} صبر کنید` : 'لطفاً چند دقیقه صبر کنید'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت کاربران</h1>
            <p className="text-gray-600">مدیریت کامل کاربران پلتفرم</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBulkAction('activate')}
              disabled={selectedUsers.length === 0 || shouldDisableActions()}
              className="btn-outline disabled:opacity-50"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              فعال‌سازی انتخاب شده
            </button>
            <button
              onClick={() => handleBulkAction('suspend')}
              disabled={selectedUsers.length === 0 || shouldDisableActions()}
              className="btn-outline text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              تعلیق انتخاب شده
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
              placeholder="جستجو در کاربران..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">همه نقش‌ها</option>
            <option value="talent">استعدادها</option>
            <option value="casting_director">کارگردانان</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="pending">در انتظار</option>
            <option value="suspended">تعلیق شده</option>
            <option value="inactive">غیرفعال</option>
          </select>

          {/* Search Button */}
          <button
            type="submit"
            disabled={shouldDisableActions()}
            className="btn-primary disabled:opacity-50"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            فیلتر
          </button>
        </form>
      </div>

      {/* Users Table */}
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
                        setSelectedUsers(users.map(user => user._id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  کاربر (✓ = تأیید مدارک)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نقش
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاریخ عضویت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخرین فعالیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اقدامات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user._id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UsersIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.identificationStatus === 'approved' && (
                            <ApprovalBadge size="xs" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className="mr-2 text-sm text-gray-900">
                        {getRoleText(user.role)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('fa-IR') : 'نامشخص'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleStatusChange(user._id, user.status === 'active' ? 'suspended' : 'active')}
                        className={`${
                          user.status === 'active' 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.status === 'active' ? (
                          <XCircleIcon className="w-4 h-4" />
                        ) : (
                          <CheckCircleIcon className="w-4 h-4" />
                        )}
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
                    <span className="font-medium">{Math.min(currentPage * 20, users.length)}</span> از{' '}
                    <span className="font-medium">{users.length}</span> نتیجه
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

export default UserManagement;
