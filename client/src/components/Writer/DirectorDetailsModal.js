import React from 'react';
import { XMarkIcon, MapPinIcon, BriefcaseIcon, StarIcon, PhoneIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const DirectorDetailsModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user || user.role !== 'casting_director') return null;

  const getExperienceText = (experience) => {
    const experienceConfig = {
      beginner: 'تازه‌کار (0-2 سال)',
      intermediate: 'متوسط (2-5 سال)',
      advanced: 'پیشرفته (5-10 سال)',
      expert: 'متخصص (10+ سال)'
    };
    return experienceConfig[experience] || 'نامشخص';
  };

  const getSpecialtyText = (specialty) => {
    const specialtyConfig = {
      film: 'فیلم',
      tv: 'تلویزیون',
      commercial: 'تبلیغات',
      theater: 'تئاتر',
      music_video: 'موزیک ویدیو',
      documentary: 'مستند',
      other: 'سایر'
    };
    return specialtyConfig[specialty] || specialty;
  };

  const getProfileImage = () => {
    return user.castingDirectorProfile?.profileImage?.url || null;
  };

  const getUserName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  const getLocation = () => {
    return user.castingDirectorProfile?.city || user.castingDirectorProfile?.location || 'نامشخص';
  };

  const getCompany = () => {
    return user.castingDirectorProfile?.companyName || 'نامشخص';
  };

  const getBiography = () => {
    return user.castingDirectorProfile?.biography || user.castingDirectorProfile?.bio || 'بیوگرافی موجود نیست';
  };

  const getExperience = () => {
    return user.castingDirectorProfile?.experience || 'نامشخص';
  };

  const getSpecialties = () => {
    return user.castingDirectorProfile?.specialties || user.castingDirectorProfile?.specialization || [];
  };

  const getPhone = () => {
    return user.castingDirectorProfile?.phoneNumber || user.castingDirectorProfile?.phone || 'نامشخص';
  };

  const getWebsite = () => {
    return user.castingDirectorProfile?.website || null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">جزئیات کارگردان</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Image and Basic Info */}
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
              {getProfileImage() ? (
                <img 
                  src={getProfileImage()} 
                  alt={getUserName()}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary-600 font-semibold text-2xl">
                  {getUserName().charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{getUserName()}</h3>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <BriefcaseIcon className="w-4 h-4" />
                  <span>{getCompany()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{getLocation()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">بیوگرافی</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{getBiography()}</p>
            </div>
          </div>

          {/* Professional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Experience */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <StarIcon className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">تجربه</h4>
              </div>
              <p className="text-blue-800">{getExperienceText(getExperience())}</p>
            </div>

            {/* Specialties */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BriefcaseIcon className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900">تخصص‌ها</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {getSpecialties().length > 0 ? (
                  getSpecialties().map((specialty, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {getSpecialtyText(specialty)}
                    </span>
                  ))
                ) : (
                  <span className="text-purple-700">تخصص خاصی ثبت نشده</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">اطلاعات تماس</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <PhoneIcon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">تلفن</p>
                  <p className="font-medium text-gray-900">{getPhone()}</p>
                </div>
              </div>
              
              {getWebsite() && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <GlobeAltIcon className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">وب‌سایت</p>
                    <a 
                      href={getWebsite()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      {getWebsite()}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats (if available) */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-primary-900 mb-3">آمار فعالیت</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-700">-</p>
                <p className="text-sm text-primary-600">کستینگ‌ها</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-700">-</p>
                <p className="text-sm text-primary-600">استعدادها</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-700">-</p>
                <p className="text-sm text-primary-600">پروژه‌ها</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-700">-</p>
                <p className="text-sm text-primary-600">سال‌ها تجربه</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectorDetailsModal;
