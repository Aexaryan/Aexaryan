import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  DocumentTextIcon,
  NewspaperIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  FilterIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AutoApprovalManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [autoApprovalFilter, setAutoApprovalFilter] = useState('all');
  const [updating, setUpdating] = useState({});

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        params: {
          search: searchTerm,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          hasAutoApproval: autoApprovalFilter !== 'all' ? autoApprovalFilter === 'true' : undefined
        }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('خطا در دریافت لیست کاربران');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, autoApprovalFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAutoApprovalToggle = async (userId, currentStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [userId]: true }));
      
      const response = await api.patch(`/admin/users/${userId}/auto-approval`, {
        autoApproval: !currentStatus
      });

      toast.success(response.data.message);
      
      // Update the user in the list
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, writerProfile: response.data.user.writerProfile }
          : user
      ));
    } catch (error) {
      console.error('Error updating auto-approval:', error);
      toast.error(error.response?.data?.error || 'خطا در به‌روزرسانی مجوز');
    } finally {
      setUpdating(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      journalist: { color: 'bg-blue-100 text-blue-800', text: 'نویسنده' },
      casting_director: { color: 'bg-green-100 text-green-800', text: 'کارگردان' },
      talent: { color: 'bg-purple-100 text-purple-800', text: 'استعداد' },
      admin: { color: 'bg-red-100 text-red-800', text: 'ادمین' }
    };

    const config = roleConfig[role] || { color: 'bg-gray-100 text-gray-800', text: role };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getAutoApprovalBadge = (user) => {
    if (user.role === 'admin') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ShieldCheckIcon className="w-3 h-3 mr-1" />
          ادمین
        </span>
      );
    }

    if (user.writerProfile?.autoApproval) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          فعال
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircleIcon className="w-3 h-3 mr-1" />
          غیرفعال
      </span>
    );
  };

  const canGrantAutoApproval = (user) => {
    return (user.role === 'journalist' || user.role === 'casting_director') && user.role !== 'admin';
  };

  const renderUsersTable = () => {
    if (loading) {
      return <LoadingSpinner text="در حال بارگذاری..." />;
    }

    if (users.length === 0) {
      return (
        <div className="text-center py-8">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            هیچ کاربری یافت نشد
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || roleFilter !== 'all' || autoApprovalFilter !== 'all'
              ? 'فیلترهای خود را تغییر دهید'
              : 'هنوز کاربری ثبت نام نکرده است'}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                کاربر
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نقش
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                وضعیت تایید خودکار
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاریخ اعطا
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="mr-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getAutoApprovalBadge(user)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.writerProfile?.autoApprovalGrantedAt 
                    ? new Date(user.writerProfile.autoApprovalGrantedAt).toLocaleDateString('fa-IR')
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {canGrantAutoApproval(user) && (
                    <button
                      onClick={() => handleAutoApprovalToggle(user._id, user.writerProfile?.autoApproval)}
                      disabled={updating[user._id]}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                        user.writerProfile?.autoApproval
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      } disabled:opacity-50`}
                    >
                      {updating[user._id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          {user.writerProfile?.autoApproval ? (
                            <>
                              <XCircleIcon className="h-4 w-4 ml-1" />
                              لغو مجوز
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4 ml-1" />
                              اعطای مجوز
                            </>
                          )}
                        </>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">مدیریت مجوز تایید خودکار</h1>
              <p className="mt-1 text-sm text-gray-500">
                مدیریت مجوزهای تایید خودکار برای نویسندگان و کارگردانان
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">کل کاربران</dt>
                    <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">مجوز تایید خودکار</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {users.filter(u => u.writerProfile?.autoApproval).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">نویسندگان</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {users.filter(u => u.role === 'journalist').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="جستجو در کاربران..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pr-10 pl-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">همه نقش‌ها</option>
                  <option value="journalist">نویسنده</option>
                  <option value="casting_director">کارگردان</option>
                  <option value="talent">استعداد</option>
                </select>
                <select
                  value={autoApprovalFilter}
                  onChange={(e) => setAutoApprovalFilter(e.target.value)}
                  className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="true">دارای مجوز</option>
                  <option value="false">بدون مجوز</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {renderUsersTable()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoApprovalManagement;

