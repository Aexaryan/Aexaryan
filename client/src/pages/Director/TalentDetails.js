import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ApprovalBadge from '../../components/Common/ApprovalBadge';
import StartConversationButton from '../../components/Messaging/StartConversationButton';
import {
  ArrowRightIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UserIcon,
  EyeIcon,
  PhoneIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const TalentDetails = () => {
  const { id } = useParams();
  const [talent, setTalent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchTalentDetails();
  }, [id]);

  const fetchTalentDetails = async () => {
    try {
      const response = await api.get(`/talents/${id}`);
      setTalent(response.data.talent);
    } catch (error) {
      console.error('Error fetching talent details:', error);
    } finally {
      setLoading(false);
    }
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
      available: 'text-green-600 bg-green-100',
      limited: 'text-yellow-600 bg-yellow-100',
      unavailable: 'text-red-600 bg-red-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  };

  const getGenderText = (gender) => {
    const genderMap = {
      male: 'مرد',
      female: 'زن',
      other: 'سایر'
    };
    return genderMap[gender] || gender;
  };

  const getEyeColorText = (color) => {
    const colorMap = {
      brown: 'قهوه‌ای',
      blue: 'آبی',
      green: 'سبز',
      hazel: 'فندقی',
      gray: 'خاکستری',
      amber: 'کهربایی',
      other: 'سایر'
    };
    return colorMap[color] || color;
  };

  const getHairColorText = (color) => {
    const colorMap = {
      black: 'مشکی',
      brown: 'قهوه‌ای',
      blonde: 'بلوند',
      red: 'قرمز',
      gray: 'خاکستری',
      white: 'سفید',
      other: 'سایر'
    };
    return colorMap[color] || color;
  };

  const getProficiencyText = (proficiency) => {
    const proficiencyMap = {
      beginner: 'مبتدی',
      intermediate: 'متوسط',
      advanced: 'پیشرفته',
      native: 'زبان مادری'
    };
    return proficiencyMap[proficiency] || proficiency;
  };

  if (loading) {
    return <LoadingSpinner text="در حال بارگذاری پروفایل استعداد..." />;
  }

  if (!talent) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">استعداد یافت نشد</h2>
          <p className="text-gray-600 mb-4">پروفایل مورد نظر وجود ندارد یا حذف شده است</p>
          <Link to="/director/talents" className="btn-primary">
            بازگشت به لیست استعدادها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/director/talents"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowRightIcon className="w-5 h-5 ml-2" />
          بازگشت به لیست استعدادها
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar - Profile Image and Basic Info */}
        <div className="space-y-6">
          {/* Profile Image */}
          <div className="card text-center">
            {talent.headshot?.url ? (
              <img
                src={talent.headshot.url}
                alt={talent.artisticName}
                className="w-48 h-48 rounded-full object-cover mx-auto mb-4"
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-24 h-24 text-gray-400" />
              </div>
            )}
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {talent.artisticName}
              </h1>
              {talent.identificationStatus === 'approved' && (
                <ApprovalBadge size="md" />
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(talent.availabilityStatus)}`}>
                {getAvailabilityText(talent.availabilityStatus)}
              </span>
            </div>

            <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
              <EyeIcon className="w-4 h-4 ml-1" />
              {talent.profileViews || 0} بازدید پروفایل
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <StartConversationButton 
                talent={talent}
                className="w-full"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات پایه</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">نام کامل:</span>
                <span className="font-medium">{talent.firstName} {talent.lastName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">سن:</span>
                <span className="font-medium">{talent.age} سال</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">جنسیت:</span>
                <span className="font-medium">{getGenderText(talent.gender)}</span>
              </div>
              
              {talent.height && (
                <div className="flex justify-between">
                  <span className="text-gray-600">قد:</span>
                  <span className="font-medium">{talent.height} سانتی‌متر</span>
                </div>
              )}
              
              {talent.weight && (
                <div className="flex justify-between">
                  <span className="text-gray-600">وزن:</span>
                  <span className="font-medium">{talent.weight} کیلوگرم</span>
                </div>
              )}
              
              {talent.eyeColor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">رنگ چشم:</span>
                  <span className="font-medium">{getEyeColorText(talent.eyeColor)}</span>
                </div>
              )}
              
              {talent.hairColor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">رنگ مو:</span>
                  <span className="font-medium">{getHairColorText(talent.hairColor)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات تماس</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <MapPinIcon className="w-4 h-4 ml-2 text-gray-400" />
                <span>{talent.city}, {talent.province}</span>
              </div>
              
              {talent.phoneNumber && (
                <div className="flex items-center text-sm">
                  <PhoneIcon className="w-4 h-4 ml-2 text-gray-400" />
                  <span>{talent.phoneNumber}</span>
                </div>
              )}
              
              {talent.socialMedia?.website && (
                <div className="flex items-center text-sm">
                  <GlobeAltIcon className="w-4 h-4 ml-2 text-gray-400" />
                  <a 
                    href={talent.socialMedia.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    وب‌سایت شخصی
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">آمار</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">کل درخواست‌ها:</span>
                <span className="font-medium">{talent.totalApplications || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">کستینگ‌های موفق:</span>
                <span className="font-medium">{talent.successfulCastings || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">عضویت از:</span>
                <span className="font-medium">
                  {new Date(talent.createdAt).toLocaleDateString('fa-IR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biography */}
          {talent.biography && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">بیوگرافی</h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                {talent.biography.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {talent.skills?.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">مهارت‌ها</h2>
              <div className="flex flex-wrap gap-2">
                {talent.skills.map((skill, index) => (
                  <span key={index} className="bg-primary-100 text-primary-800 px-3 py-2 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {talent.languages?.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">زبان‌ها</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {talent.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{lang.language}</span>
                    <span className="text-sm text-gray-600">
                      {getProficiencyText(lang.proficiency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {talent.portfolio?.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">گالری نمونه کار</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {talent.portfolio.map((image, index) => (
                  <div
                    key={image._id}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image.url}
                      alt={image.caption || `نمونه کار ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Showreel Videos */}
          {talent.showreel?.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ویدیوهای شوریل</h2>
              <div className="space-y-4">
                {talent.showreel.map((video, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{video.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">پلتفرم: {video.platform}</p>
                        {video.description && (
                          <p className="text-sm text-gray-600 mt-2">{video.description}</p>
                        )}
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                        >
                          مشاهده ویدیو →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {talent.experience?.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">تجربیات کاری</h2>
              <div className="space-y-4">
                {talent.experience.map((exp, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{exp.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {exp.company} • {exp.role}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(exp.startDate).toLocaleDateString('fa-IR')} - 
                          {exp.isCurrent ? 'حال حاضر' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('fa-IR') : ''}
                        </p>
                        {exp.director && (
                          <p className="text-sm text-gray-600 mt-1">کارگردان: {exp.director}</p>
                        )}
                        {exp.productionCompany && (
                          <p className="text-sm text-gray-600 mt-1">شرکت تولید: {exp.productionCompany}</p>
                        )}
                        {exp.description && (
                          <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {talent.education?.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">تحصیلات</h2>
              <div className="space-y-4">
                {talent.education.map((edu, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{edu.degree}</h3>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage.url}
              alt={selectedImage.caption || 'نمونه کار'}
              className="max-w-full max-h-full object-contain"
            />
            {selectedImage.caption && (
              <p className="text-white text-center mt-4">{selectedImage.caption}</p>
            )}
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 left-4 text-white hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>
      )}


    </div>
  );
};

export default TalentDetails;