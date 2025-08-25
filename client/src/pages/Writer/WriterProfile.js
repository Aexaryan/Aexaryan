import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WriterLayout from '../../components/Writer/WriterLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  GlobeAltIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon,
  EyeIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const WriterProfile = () => {
  const { user, updateUserProfileImage } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    bio: '',
    specialization: '',
    experience: '',
    skills: [],
    phone: '',
    website: '',
    location: '',
    education: '',
    awards: '',
    profileImage: '',
    isApprovedWriter: false,
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    joinDate: ''
  });

  const [formData, setFormData] = useState({
    bio: '',
    specialization: '',
    experience: '',
    skills: '',
    phone: '',
    website: '',
    location: '',
    education: '',
    awards: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/writer/profile');
      const profileData = response.data;
      
      setProfile(profileData);
      setFormData({
        bio: profileData.bio || '',
        specialization: profileData.specialization || '',
        experience: profileData.experience || '',
        skills: Array.isArray(profileData.skills) ? profileData.skills.join(', ') : '',
        phone: profileData.phone || '',
        website: profileData.website || '',
        location: profileData.location || '',
        education: profileData.education || '',
        awards: profileData.awards || ''
      });
      
      // Set image preview if profile has image
      if (profileData.profileImage) {
        setImagePreview(profileData.profileImage);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('خطا در دریافت پروفایل');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('لطفاً یک فایل تصویری انتخاب کنید');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم فایل نباید بیشتر از 5 مگابایت باشد');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('specialization', formData.specialization);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('education', formData.education);
      formDataToSend.append('awards', formData.awards);
      
      // Add skills as JSON string
      const skills = formData.skills ? formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [];
      formDataToSend.append('skills', JSON.stringify(skills));
      
      // Add profile image if selected
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const response = await api.put('/writer/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('پروفایل با موفقیت به‌روزرسانی شد');
      setIsEditing(false);
      
      // Update the user's profile image in the context if a new image was uploaded
      if (response.data.profile?.profileImage) {
        updateUserProfileImage(response.data.profile.profileImage);
        // Also update the local image preview
        setImagePreview(response.data.profile.profileImage);
      }
      
      // Update the local profile state with the new data
      setProfile(response.data.profile);
      
      // Clear the profile image file since it's been uploaded
      setProfileImage(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('خطا در به‌روزرسانی پروفایل');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      bio: profile.bio || '',
      specialization: profile.specialization || '',
      experience: profile.experience || '',
      skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
      phone: profile.phone || '',
      website: profile.website || '',
      location: profile.location || '',
      education: profile.education || '',
      awards: profile.awards || ''
    });
    setProfileImage(null);
    setImagePreview(profile.profileImage || null);
    setIsEditing(false);
  };

  if (loading) {
    return <LoadingSpinner text="در حال دریافت پروفایل..." />;
  }

  return (
    <WriterLayout>
      <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserIcon className="w-8 h-8 text-primary-600 ml-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">پروفایل نویسنده</h1>
                    <p className="text-gray-600">مدیریت اطلاعات شخصی و حرفه‌ای</p>
                  </div>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 ml-2" />
                    ویرایش پروفایل
                  </button>
                ) : (
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4 ml-2" />
                      انصراف
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4 ml-2" />
                      {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="text-center mb-6">
                    {/* Profile Image */}
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="w-24 h-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                          <UserIcon className="w-12 h-12 text-primary-600" />
                        </div>
                      )}
                      
                      {isEditing && (
                        <div className="absolute -bottom-2 -right-2">
                          <label className="cursor-pointer">
                            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
                              <CameraIcon className="w-4 h-4 text-white" />
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile.isApprovedWriter 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {profile.isApprovedWriter ? 'نویسنده تایید شده' : 'در انتظار تایید'}
                      </span>
                    </div>
                    
                    {/* Remove Image Button */}
                    {isEditing && imagePreview && (
                      <button
                        onClick={removeImage}
                        className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <XMarkIcon className="w-3 h-3 ml-1" />
                        حذف تصویر
                      </button>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-5 h-5 text-primary-600 ml-2" />
                        <span className="text-sm text-gray-600">مقالات</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{profile.totalArticles || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <EyeIcon className="w-5 h-5 text-primary-600 ml-2" />
                        <span className="text-sm text-gray-600">بازدید</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{profile.totalViews || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <StarIcon className="w-5 h-5 text-primary-600 ml-2" />
                        <span className="text-sm text-gray-600">لایک</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{profile.totalLikes || 0}</span>
                    </div>
                  </div>

                  {/* Join Date */}
                  {profile.joinDate && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4 ml-2" />
                        عضویت از: {new Date(profile.joinDate).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">اطلاعات پروفایل</h3>
                  
                  <div className="space-y-6">
                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        بیوگرافی
                      </label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="درباره خودتان بنویسید..."
                        />
                      ) : (
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                          {profile.bio || 'بیوگرافی ثبت نشده است'}
                        </p>
                      )}
                    </div>

                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تخصص
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="تخصص خود را وارد کنید"
                        />
                      ) : (
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                          {profile.specialization || 'تخصص ثبت نشده است'}
                        </p>
                      )}
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تجربه کاری
                      </label>
                      {isEditing ? (
                        <textarea
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="تجربه کاری خود را شرح دهید..."
                        />
                      ) : (
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                          {profile.experience || 'تجربه کاری ثبت نشده است'}
                        </p>
                      )}
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        مهارت‌ها
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="skills"
                          value={formData.skills}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="مهارت‌ها را با کاما جدا کنید"
                        />
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {profile.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-700">مهارت‌ها ثبت نشده است</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Education */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تحصیلات
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="education"
                          value={formData.education}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="تحصیلات خود را وارد کنید"
                        />
                      ) : (
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                          {profile.education || 'تحصیلات ثبت نشده است'}
                        </p>
                      )}
                    </div>

                    {/* Awards */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        جوایز و افتخارات
                      </label>
                      {isEditing ? (
                        <textarea
                          name="awards"
                          value={formData.awards}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="جوایز و افتخارات خود را وارد کنید..."
                        />
                      ) : (
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                          {profile.awards || 'جایزه‌ای ثبت نشده است'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">اطلاعات تماس</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره تماس
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="شماره تماس"
                        />
                      ) : (
                        <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-lg">
                          <PhoneIcon className="w-5 h-5 text-gray-400 ml-2" />
                          {profile.phone || 'شماره تماس ثبت نشده است'}
                        </div>
                      )}
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وب‌سایت
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="آدرس وب‌سایت"
                        />
                      ) : (
                        <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-lg">
                          <GlobeAltIcon className="w-5 h-5 text-gray-400 ml-2" />
                          {profile.website ? (
                            <a 
                              href={profile.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700"
                            >
                              {profile.website}
                            </a>
                          ) : (
                            'وب‌سایت ثبت نشده است'
                          )}
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        موقعیت جغرافیایی
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="شهر و کشور"
                        />
                      ) : (
                        <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-lg">
                          <MapPinIcon className="w-5 h-5 text-gray-400 ml-2" />
                          {profile.location || 'موقعیت ثبت نشده است'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </WriterLayout>
      );
    };

export default WriterProfile;
