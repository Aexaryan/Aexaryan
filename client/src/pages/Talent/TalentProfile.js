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
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const TalentProfile = () => {
  const { profile, user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    artisticName: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    eyeColor: '',
    hairColor: '',
    city: '',
    province: '',
    biography: '',
    phoneNumber: '',
    availabilityStatus: 'available'
  });
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState({ language: '', proficiency: 'intermediate' });
  const [newShowreel, setNewShowreel] = useState({ title: '', url: '', platform: 'youtube', description: '' });
  const [newExperience, setNewExperience] = useState({
    title: '', company: '', projectType: 'film', role: '', startDate: '', endDate: '', 
    description: '', director: '', productionCompany: '', isCurrent: false
  });
  const [newEducation, setNewEducation] = useState({
    degree: '', institution: '', field: '', startDate: '', endDate: '', 
    grade: '', description: '', isCurrent: false
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingHeadshot, setUploadingHeadshot] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        artisticName: profile.artisticName || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profile.gender || '',
        height: profile.height || '',
        weight: profile.weight || '',
        eyeColor: profile.eyeColor || '',
        hairColor: profile.hairColor || '',
        city: profile.city || '',
        province: profile.province || '',
        biography: profile.biography || '',
        phoneNumber: profile.phoneNumber || '',
        availabilityStatus: profile.availabilityStatus || 'available'
      });
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
      const response = await api.put('/talents/profile', formData);
      updateProfile(response.data.talent);
      toast.success('پروفایل با موفقیت به‌روزرسانی شد');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error || 'خطا در به‌روزرسانی پروفایل');
    } finally {
      setUpdating(false);
    }
  };

  const handleHeadshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم فایل باید کمتر از ۵ مگابایت باشد');
      return;
    }

    setUploadingHeadshot(true);
    const formData = new FormData();
    formData.append('headshot', file);

    try {
      const response = await api.post('/upload/headshot', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update profile with new headshot
      const updatedProfile = { ...profile, headshot: response.data.headshot };
      updateProfile(updatedProfile);
      toast.success('عکس پرتره با موفقیت آپلود شد');
    } catch (error) {
      console.error('Headshot upload error:', error);
      toast.error(error.response?.data?.error || 'خطا در آپلود عکس');
    } finally {
      setUploadingHeadshot(false);
    }
  };

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (files.some(file => file.size > 5 * 1024 * 1024)) {
      toast.error('حجم هر فایل باید کمتر از ۵ مگابایت باشد');
      return;
    }

    setUploadingPortfolio(true);
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const response = await api.post('/upload/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update profile with new portfolio images
      const updatedPortfolio = [...(profile.portfolio || []), ...response.data.newImages];
      const updatedProfile = { ...profile, portfolio: updatedPortfolio };
      updateProfile(updatedProfile);
      toast.success(`${response.data.newImages.length} عکس با موفقیت اضافه شد`);
    } catch (error) {
      console.error('Portfolio upload error:', error);
      toast.error(error.response?.data?.error || 'خطا در آپلود عکس‌ها');
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleDeletePortfolioImage = async (imageId) => {
    if (!window.confirm('آیا از حذف این عکس مطمئن هستید؟')) return;

    try {
      await api.delete(`/upload/portfolio/${imageId}`);
      
      // Update profile by removing the deleted image
      const updatedPortfolio = profile.portfolio.filter(img => img._id !== imageId);
      const updatedProfile = { ...profile, portfolio: updatedPortfolio };
      updateProfile(updatedProfile);
      toast.success('عکس با موفقیت حذف شد');
    } catch (error) {
      console.error('Delete image error:', error);
      toast.error(error.response?.data?.error || 'خطا در حذف عکس');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      const response = await api.post('/talents/profile/skills', { skill: newSkill.trim() });
      const updatedProfile = { ...profile, skills: response.data.skills };
      updateProfile(updatedProfile);
      setNewSkill('');
      toast.success('مهارت اضافه شد');
    } catch (error) {
      console.error('Add skill error:', error);
      toast.error(error.response?.data?.error || 'خطا در اضافه کردن مهارت');
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      const response = await api.delete(`/talents/profile/skills/${encodeURIComponent(skill)}`);
      const updatedProfile = { ...profile, skills: response.data.skills };
      updateProfile(updatedProfile);
      toast.success('مهارت حذف شد');
    } catch (error) {
      console.error('Remove skill error:', error);
      toast.error(error.response?.data?.error || 'خطا در حذف مهارت');
    }
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.language.trim()) return;

    try {
      const response = await api.post('/talents/profile/languages', newLanguage);
      const updatedProfile = { ...profile, languages: response.data.languages };
      updateProfile(updatedProfile);
      setNewLanguage({ language: '', proficiency: 'intermediate' });
      toast.success('زبان اضافه شد');
    } catch (error) {
      console.error('Add language error:', error);
      toast.error(error.response?.data?.error || 'خطا در اضافه کردن زبان');
    }
  };

  // Showreel handlers
  const handleAddShowreel = async () => {
    if (!newShowreel.title.trim() || !newShowreel.url.trim()) {
      toast.error('عنوان و لینک ویدیو ضروری است');
      return;
    }

    try {
      const response = await api.post('/talents/profile/showreel', newShowreel);
      const updatedProfile = { ...profile, showreel: response.data.showreel };
      updateProfile(updatedProfile);
      setNewShowreel({ title: '', url: '', platform: 'youtube', description: '' });
      toast.success('ویدیو شوریل اضافه شد');
    } catch (error) {
      console.error('Add showreel error:', error);
      toast.error(error.response?.data?.error || 'خطا در اضافه کردن ویدیو شوریل');
    }
  };

  const handleRemoveShowreel = async (index) => {
    try {
      const response = await api.delete(`/talents/profile/showreel/${index}`);
      const updatedProfile = { ...profile, showreel: response.data.showreel };
      updateProfile(updatedProfile);
      toast.success('ویدیو شوریل حذف شد');
    } catch (error) {
      console.error('Remove showreel error:', error);
      toast.error(error.response?.data?.error || 'خطا در حذف ویدیو شوریل');
    }
  };

  // Experience handlers
  const handleAddExperience = async () => {
    if (!newExperience.title.trim() || !newExperience.company.trim() || 
        !newExperience.role.trim() || !newExperience.startDate) {
      toast.error('تمام فیلدهای ضروری را پر کنید');
      return;
    }

    try {
      const response = await api.post('/talents/profile/experience', newExperience);
      const updatedProfile = { ...profile, experience: response.data.experience };
      updateProfile(updatedProfile);
      setNewExperience({
        title: '', company: '', projectType: 'film', role: '', startDate: '', endDate: '', 
        description: '', director: '', productionCompany: '', isCurrent: false
      });
      toast.success('تجربه اضافه شد');
    } catch (error) {
      console.error('Add experience error:', error);
      toast.error(error.response?.data?.error || 'خطا در اضافه کردن تجربه');
    }
  };

  const handleRemoveExperience = async (index) => {
    try {
      const response = await api.delete(`/talents/profile/experience/${index}`);
      const updatedProfile = { ...profile, experience: response.data.experience };
      updateProfile(updatedProfile);
      toast.success('تجربه حذف شد');
    } catch (error) {
      console.error('Remove experience error:', error);
      toast.error(error.response?.data?.error || 'خطا در حذف تجربه');
    }
  };

  // Education handlers
  const handleAddEducation = async () => {
    if (!newEducation.degree.trim() || !newEducation.institution.trim() || 
        !newEducation.field.trim() || !newEducation.startDate) {
      toast.error('تمام فیلدهای ضروری را پر کنید');
      return;
    }

    try {
      const response = await api.post('/talents/profile/education', newEducation);
      const updatedProfile = { ...profile, education: response.data.education };
      updateProfile(updatedProfile);
      setNewEducation({
        degree: '', institution: '', field: '', startDate: '', endDate: '', 
        grade: '', description: '', isCurrent: false
      });
      toast.success('تحصیلات اضافه شد');
    } catch (error) {
      console.error('Add education error:', error);
      toast.error(error.response?.data?.error || 'خطا در اضافه کردن تحصیلات');
    }
  };

  const handleRemoveEducation = async (index) => {
    try {
      const response = await api.delete(`/talents/profile/education/${index}`);
      const updatedProfile = { ...profile, education: response.data.education };
      updateProfile(updatedProfile);
      toast.success('تحصیلات حذف شد');
    } catch (error) {
      console.error('Remove education error:', error);
      toast.error(error.response?.data?.error || 'خطا در حذف تحصیلات');
    }
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری پروفایل..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">پروفایل من</h1>
        <p className="text-gray-600">اطلاعات و نمونه کارهای خود را مدیریت کنید</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Image and Portfolio */}
        <div className="space-y-6">
          {/* Headshot */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">عکس پرتره</h3>
            <div className="text-center">
              <div className="relative inline-block">
                {profile?.headshot?.url ? (
                  <img
                    src={profile.headshot.url}
                    alt="عکس پرتره"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <CameraIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <label
                  htmlFor="headshot-upload"
                  className="absolute bottom-0 left-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700"
                >
                  {uploadingHeadshot ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CameraIcon className="w-4 h-4" />
                  )}
                </label>
                <input
                  id="headshot-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleHeadshotUpload}
                  className="hidden"
                  disabled={uploadingHeadshot}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                فرمت JPG، PNG (حداکثر ۵MB)
              </p>
            </div>
          </div>

          {/* Portfolio */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">گالری نمونه کار</h3>
              <label
                htmlFor="portfolio-upload"
                className="btn-outline btn-sm cursor-pointer"
              >
                {uploadingPortfolio ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4 ml-2" />
                    افزودن
                  </>
                )}
              </label>
              <input
                id="portfolio-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePortfolioUpload}
                className="hidden"
                disabled={uploadingPortfolio}
              />
            </div>

            {profile?.portfolio && profile.portfolio.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {profile.portfolio.map((image) => (
                  <div key={image._id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.caption || 'نمونه کار'}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDeletePortfolioImage(image._id)}
                      className="absolute top-1 left-1 bg-secondary-200 hover:bg-secondary-300 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CameraIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">هنوز عکسی اضافه نکرده‌اید</p>
              </div>
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
                    نام هنری *
                  </label>
                  {user?.identificationStatus === 'approved' && (
                    <ApprovalBadge size="sm" />
                  )}
                </div>
                <input
                  type="text"
                  name="artisticName"
                  value={formData.artisticName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وضعیت فعالیت
                </label>
                <select
                  name="availabilityStatus"
                  value={formData.availabilityStatus}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="available">فعال</option>
                  <option value="limited">محدود</option>
                  <option value="unavailable">غیرفعال</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام *
                </label>
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
                  تاریخ تولد *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  جنسیت *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">انتخاب کنید</option>
                  <option value="male">مرد</option>
                  <option value="female">زن</option>
                  <option value="other">سایر</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  قد (سانتی‌متر)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="input-field"
                  min="100"
                  max="250"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وزن (کیلوگرم)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="input-field"
                  min="30"
                  max="200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رنگ چشم
                </label>
                <select
                  name="eyeColor"
                  value={formData.eyeColor}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="brown">قهوه‌ای</option>
                  <option value="blue">آبی</option>
                  <option value="green">سبز</option>
                  <option value="hazel">فندقی</option>
                  <option value="gray">خاکستری</option>
                  <option value="amber">کهربایی</option>
                  <option value="other">سایر</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رنگ مو
                </label>
                <select
                  name="hairColor"
                  value={formData.hairColor}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="black">مشکی</option>
                  <option value="brown">قهوه‌ای</option>
                  <option value="blonde">بلوند</option>
                  <option value="red">قرمز</option>
                  <option value="gray">خاکستری</option>
                  <option value="white">سفید</option>
                  <option value="other">سایر</option>
                </select>
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
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بیوگرافی
              </label>
              <textarea
                name="biography"
                value={formData.biography}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="درباره خود، تجربیات و علایق‌تان بنویسید..."
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

          {/* Skills */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">مهارت‌ها</h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="مهارت جدید..."
                className="input-field flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn-outline"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="mr-2 text-primary-600 hover:text-primary-800"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">هنوز مهارتی اضافه نکرده‌اید</p>
            )}
          </div>

          {/* Languages */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">زبان‌ها</h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newLanguage.language}
                onChange={(e) => setNewLanguage(prev => ({ ...prev, language: e.target.value }))}
                placeholder="زبان..."
                className="input-field flex-1"
              />
              <select
                value={newLanguage.proficiency}
                onChange={(e) => setNewLanguage(prev => ({ ...prev, proficiency: e.target.value }))}
                className="input-field"
              >
                <option value="beginner">مبتدی</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">پیشرفته</option>
                <option value="native">زبان مادری</option>
              </select>
              <button
                type="button"
                onClick={handleAddLanguage}
                className="btn-outline"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            {profile?.languages && profile.languages.length > 0 ? (
              <div className="space-y-2">
                {profile.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <span className="font-medium">{lang.language}</span>
                      <span className="text-sm text-gray-600 mr-2">
                        ({lang.proficiency === 'beginner' ? 'مبتدی' :
                          lang.proficiency === 'intermediate' ? 'متوسط' :
                          lang.proficiency === 'advanced' ? 'پیشرفته' : 'زبان مادری'})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">هنوز زبانی اضافه نکرده‌اید</p>
            )}
          </div>

          {/* Showreel Videos */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ویدیوهای شوریل</h3>
            
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newShowreel.title}
                  onChange={(e) => setNewShowreel(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="عنوان ویدیو..."
                  className="input-field"
                />
                <select
                  value={newShowreel.platform}
                  onChange={(e) => setNewShowreel(prev => ({ ...prev, platform: e.target.value }))}
                  className="input-field"
                >
                  <option value="youtube">یوتیوب</option>
                  <option value="vimeo">ویمو</option>
                  <option value="instagram">اینستاگرام</option>
                  <option value="tiktok">تیک‌تاک</option>
                  <option value="other">سایر</option>
                </select>
              </div>
              <input
                type="url"
                value={newShowreel.url}
                onChange={(e) => setNewShowreel(prev => ({ ...prev, url: e.target.value }))}
                placeholder="لینک ویدیو..."
                className="input-field"
              />
              <textarea
                value={newShowreel.description}
                onChange={(e) => setNewShowreel(prev => ({ ...prev, description: e.target.value }))}
                placeholder="توضیحات (اختیاری)..."
                rows={3}
                className="input-field"
              />
              <button
                type="button"
                onClick={handleAddShowreel}
                className="btn-outline w-full"
              >
                <PlusIcon className="w-4 h-4 ml-2" />
                افزودن ویدیو شوریل
              </button>
            </div>

            {profile?.showreel && profile.showreel.length > 0 ? (
              <div className="space-y-3">
                {profile.showreel.map((video, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{video.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{video.platform}</p>
                        {video.description && (
                          <p className="text-sm text-gray-600 mt-2">{video.description}</p>
                        )}
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                        >
                          مشاهده ویدیو
                        </a>
                      </div>
                      <button
                        onClick={() => handleRemoveShowreel(index)}
                        className="bg-secondary-200 hover:bg-secondary-300 text-white p-1 rounded mr-3 transition-colors duration-200"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">هنوز ویدیو شوریلی اضافه نکرده‌اید</p>
            )}
          </div>

          {/* Experience */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">تجربیات کاری</h3>
            
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="عنوان پروژه..."
                  className="input-field"
                />
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="شرکت/استودیو..."
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={newExperience.projectType}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, projectType: e.target.value }))}
                  className="input-field"
                >
                  <option value="film">فیلم</option>
                  <option value="tv_series">سریال تلویزیونی</option>
                  <option value="commercial">تبلیغات</option>
                  <option value="theater">تئاتر</option>
                  <option value="music_video">موزیک ویدیو</option>
                  <option value="documentary">مستند</option>
                  <option value="web_series">وب سریال</option>
                  <option value="other">سایر</option>
                </select>
                <input
                  type="text"
                  value={newExperience.role}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="نقش..."
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="date"
                  value={newExperience.endDate}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                  className="input-field"
                  disabled={newExperience.isCurrent}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrentExperience"
                  checked={newExperience.isCurrent}
                  onChange={(e) => setNewExperience(prev => ({ 
                    ...prev, 
                    isCurrent: e.target.checked,
                    endDate: e.target.checked ? '' : prev.endDate
                  }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isCurrentExperience" className="text-sm text-gray-700">
                  در حال حاضر مشغول به کار
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newExperience.director}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, director: e.target.value }))}
                  placeholder="کارگردان (اختیاری)..."
                  className="input-field"
                />
                <input
                  type="text"
                  value={newExperience.productionCompany}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, productionCompany: e.target.value }))}
                  placeholder="شرکت تولید (اختیاری)..."
                  className="input-field"
                />
              </div>
              <textarea
                value={newExperience.description}
                onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                placeholder="توضیحات (اختیاری)..."
                rows={3}
                className="input-field"
              />
              <button
                type="button"
                onClick={handleAddExperience}
                className="btn-outline w-full"
              >
                <PlusIcon className="w-4 h-4 ml-2" />
                افزودن تجربه
              </button>
            </div>

            {profile?.experience && profile.experience.length > 0 ? (
              <div className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{exp.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {exp.company} • {exp.role}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(exp.startDate).toLocaleDateString('fa-IR')} - 
                          {exp.isCurrent ? 'حال حاضر' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('fa-IR') : ''}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveExperience(index)}
                        className="bg-secondary-200 hover:bg-secondary-300 text-white p-1 rounded mr-3 transition-colors duration-200"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">هنوز تجربه‌ای اضافه نکرده‌اید</p>
            )}
          </div>

          {/* Education */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">تحصیلات</h3>
            
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="مدرک تحصیلی..."
                  className="input-field"
                />
                <input
                  type="text"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                  placeholder="موسسه آموزشی..."
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newEducation.field}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
                  placeholder="رشته تحصیلی..."
                  className="input-field"
                />
                <input
                  type="text"
                  value={newEducation.grade}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, grade: e.target.value }))}
                  placeholder="معدل (اختیاری)..."
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newEducation.startDate}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, startDate: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="date"
                  value={newEducation.endDate}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, endDate: e.target.value }))}
                  className="input-field"
                  disabled={newEducation.isCurrent}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrentEducation"
                  checked={newEducation.isCurrent}
                  onChange={(e) => setNewEducation(prev => ({ 
                    ...prev, 
                    isCurrent: e.target.checked,
                    endDate: e.target.checked ? '' : prev.endDate
                  }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isCurrentEducation" className="text-sm text-gray-700">
                  در حال تحصیل
                </label>
              </div>
              <textarea
                value={newEducation.description}
                onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="توضیحات (اختیاری)..."
                rows={3}
                className="input-field"
              />
              <button
                type="button"
                onClick={handleAddEducation}
                className="btn-outline w-full"
              >
                <PlusIcon className="w-4 h-4 ml-2" />
                افزودن تحصیلات
              </button>
            </div>

            {profile?.education && profile.education.length > 0 ? (
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {edu.institution} • {edu.field}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(edu.startDate).toLocaleDateString('fa-IR')} - 
                          {edu.isCurrent ? 'حال حاضر' : edu.endDate ? new Date(edu.endDate).toLocaleDateString('fa-IR') : ''}
                        </p>
                        {edu.grade && (
                          <p className="text-sm text-gray-600 mt-1">معدل: {edu.grade}</p>
                        )}
                        {edu.description && (
                          <p className="text-sm text-gray-600 mt-2">{edu.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveEducation(index)}
                        className="bg-secondary-200 hover:bg-secondary-300 text-white p-1 rounded mr-3 transition-colors duration-200"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">هنوز تحصیلاتی اضافه نکرده‌اید</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentProfile;