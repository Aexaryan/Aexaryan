import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import IdentificationUpload from '../../components/Identification/IdentificationUpload';
import ApprovalBadge from '../../components/Common/ApprovalBadge';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  CameraIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const DirectorProfile = () => {
  const { profile, user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    position: 'casting_director',
    biography: '',
    experience: '',
    city: '',
    province: '',
    phoneNumber: '',
    website: ''
  });
  const [specialties, setSpecialties] = useState([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        companyName: profile.companyName || '',
        position: profile.position || 'casting_director',
        biography: profile.biography || '',
        experience: profile.experience || '',
        city: profile.city || '',
        province: profile.province || '',
        phoneNumber: profile.phoneNumber || '',
        website: profile.website || ''
      });
      setSpecialties(profile.specialties || []);
      setLoading(false);
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updateData = { ...formData, specialties };
      const response = await api.put('/castings/profile', updateData);
      updateProfile(response.data.profile);
      toast.success('پروفایل با موفقیت به‌روزرسانی شد');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error || 'خطا در به‌روزرسانی پروفایل');
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم فایل باید کمتر از ۵ مگابایت باشد');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/upload/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedProfile = { ...profile, profileImage: response.data.profileImage };
      updateProfile(updatedProfile);
      toast.success('تصویر پروفایل با موفقیت آپلود شد');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.response?.data?.error || 'خطا در آپلود تصویر');
    } finally {
      setUploadingImage(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty)) {
      setSpecialties([...specialties, newSpecialty]);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  const getPositionText = (position) => {
    const positions = {
      casting_director: 'کارگردان کستینگ',
      producer: 'تهیه‌کننده',
      director: 'کارگردان',
      talent_agent: 'نماینده استعداد',
      other: 'سایر'
    };
    return positions[position] || position;
  };

  const getSpecialtyText = (specialty) => {
    const specialties = {
      film: 'فیلم',
      tv_series: 'سریال تلویزیونی',
      commercial: 'تبلیغات',
      theater: 'تئاتر',
      music_video: 'موزیک ویدیو',
      documentary: 'مستند',
      other: 'سایر'
    };
    return specialties[specialty] || specialty;
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری پروفایل..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">پروفایل کارگردان</h1>
        <p className="text-gray-600">اطلاعات حرفه‌ای خود را مدیریت کنید</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Image */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">تصویر پروفایل</h3>
            <div className="text-center">
              <div className="relative inline-block">
                {profile?.profileImage?.url ? (
                  <img
                    src={profile.profileImage.url}
                    alt="تصویر پروفایل"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <CameraIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <label
                  htmlFor="profile-image-upload"
                  className="absolute bottom-0 left-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700"
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CameraIcon className="w-4 h-4" />
                  )}
                </label>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                فرمت JPG، PNG (حداکثر ۵MB)
              </p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">وضعیت تأیید</h3>
            <div className="flex items-center">
              {profile?.isVerified ? (
                <div className="flex items-center text-green-600">
                  <CheckIcon className="w-5 h-5 ml-2" />
                  <span>تأیید شده</span>
                </div>
              ) : (
                <div className="flex items-center text-yellow-600">
                  <XMarkIcon className="w-5 h-5 ml-2" />
                  <span>در انتظار تأیید</span>
                </div>
              )}
            </div>
            {!profile?.isVerified && (
              <p className="text-sm text-gray-600 mt-2">
                برای تأیید حساب، با پشتیبانی تماس بگیرید
              </p>
            )}
          </div>

          {/* Identification Upload */}
          <IdentificationUpload />
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-6">اطلاعات شخصی</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    نام *
                  </label>
                  {user?.identificationStatus === 'approved' && (
                    <ApprovalBadge size="sm" />
                  )}
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام خانوادگی *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام شرکت
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سمت
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="casting_director">کارگردان کستینگ</option>
                  <option value="producer">تهیه‌کننده</option>
                  <option value="director">کارگردان</option>
                  <option value="talent_agent">نماینده استعداد</option>
                  <option value="other">سایر</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سال‌های تجربه
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره تماس
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="09123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شهر *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  استان *
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وب‌سایت
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بیوگرافی حرفه‌ای
              </label>
              <textarea
                name="biography"
                value={formData.biography}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="درباره تجربیات کاری، پروژه‌های انجام شده و تخصص‌های خود بنویسید..."
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="btn-primary disabled:opacity-50"
              >
                {updating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    در حال ذخیره...
                  </div>
                ) : (
                  'ذخیره تغییرات'
                )}
              </button>
            </div>
          </form>

          {/* Specialties */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">تخصص‌ها</h3>
            
            <div className="flex gap-2 mb-4">
              <select
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">انتخاب تخصص...</option>
                <option value="film">فیلم</option>
                <option value="tv_series">سریال تلویزیونی</option>
                <option value="commercial">تبلیغات</option>
                <option value="theater">تئاتر</option>
                <option value="music_video">موزیک ویدیو</option>
                <option value="documentary">مستند</option>
                <option value="other">سایر</option>
              </select>
              <button
                type="button"
                onClick={addSpecialty}
                className="btn-outline"
                disabled={!newSpecialty}
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            {specialties.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                  >
                    {getSpecialtyText(specialty)}
                    <button
                      onClick={() => removeSpecialty(specialty)}
                      className="mr-2 bg-secondary-200 hover:bg-secondary-300 text-white p-1 rounded transition-colors duration-200"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">هنوز تخصصی اضافه نکرده‌اید</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorProfile;