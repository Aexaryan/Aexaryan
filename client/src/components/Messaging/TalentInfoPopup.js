import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, MapPinIcon, PhoneIcon, GlobeAltIcon, CalendarIcon, StarIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import ApprovalBadge from '../Common/ApprovalBadge';

const TalentInfoPopup = ({ isOpen, onClose, talentId, talentName }) => {
  const [talentInfo, setTalentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && talentId) {
      fetchTalentInfo();
    }
  }, [isOpen, talentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTalentInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/talents/${talentId}`);
      setTalentInfo(response.data.talent);
    } catch (error) {
      console.error('Error fetching talent info:', error);
      setError('خطا در دریافت اطلاعات هنرمند');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                اطلاعات هنرمند
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner text="در حال بارگذاری..." />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-2">
                  <UserIcon className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : talentInfo ? (
              <div className="space-y-4">
                {/* Profile Image and Basic Info */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-2 border-white shadow-lg">
                      {talentInfo.headshot?.url ? (
                        <img 
                          src={talentInfo.headshot.url} 
                          alt={talentInfo.firstName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '';
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <UserIcon className="w-8 h-8 text-primary-600" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      <ApprovalBadge size="sm" showText={false} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">
                      {talentInfo.firstName} {talentInfo.lastName}
                    </h4>
                    {talentInfo.age && (
                      <p className="text-gray-600 flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {talentInfo.age} سال
                      </p>
                    )}
                    {talentInfo.gender && (
                      <p className="text-sm text-gray-500">
                        {talentInfo.gender === 'male' ? 'مرد' : talentInfo.gender === 'female' ? 'زن' : talentInfo.gender}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                {(talentInfo.phoneNumber || talentInfo.website) && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">اطلاعات تماس</h5>
                    <div className="space-y-2">
                      {talentInfo.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{talentInfo.phoneNumber}</span>
                        </div>
                      )}
                      {talentInfo.website && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GlobeAltIcon className="w-4 h-4" />
                          <a 
                            href={talentInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 underline"
                          >
                            {talentInfo.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {(talentInfo.city || talentInfo.province) && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">موقعیت</h5>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4" />
                      <span>
                        {[talentInfo.city, talentInfo.province].filter(Boolean).join('، ')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Physical Characteristics */}
                {(talentInfo.height || talentInfo.weight || talentInfo.eyeColor || talentInfo.hairColor) && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">ویژگی‌های ظاهری</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      {talentInfo.height && (
                        <div>قد: {talentInfo.height} سانتی‌متر</div>
                      )}
                      {talentInfo.weight && (
                        <div>وزن: {talentInfo.weight} کیلوگرم</div>
                      )}
                      {talentInfo.eyeColor && (
                        <div>رنگ چشم: {talentInfo.eyeColor}</div>
                      )}
                      {talentInfo.hairColor && (
                        <div>رنگ مو: {talentInfo.hairColor}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Biography */}
                {talentInfo.biography && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">درباره</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {talentInfo.biography}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {talentInfo.experience && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">تجربیات</h5>
                    {Array.isArray(talentInfo.experience) ? (
                      <div className="space-y-3">
                        {talentInfo.experience.map((exp, index) => (
                          <div key={exp._id || index} className="text-sm text-gray-600">
                            <div className="font-medium text-gray-800">{exp.title}</div>
                            <div className="text-gray-600">{exp.company} • {exp.role}</div>
                            <div className="text-gray-500 text-xs">
                              {exp.startDate} - {exp.isCurrent ? 'حال حاضر' : exp.endDate}
                            </div>
                            {exp.description && (
                              <div className="mt-1 text-gray-600">{exp.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {talentInfo.experience}
                      </p>
                    )}
                  </div>
                )}

                {/* Skills */}
                {talentInfo.skills && talentInfo.skills.length > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">مهارت‌ها</h5>
                    <div className="flex flex-wrap gap-2">
                      {talentInfo.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {typeof skill === 'string' ? skill : skill.name || skill.title || 'مهارت'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {talentInfo.languages && talentInfo.languages.length > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">زبان‌ها</h5>
                    <div className="flex flex-wrap gap-2">
                      {talentInfo.languages.map((language, index) => (
                        <span 
                          key={language._id || index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {typeof language === 'string' ? language : `${language.language} (${language.proficiency})`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visit Profile Link */}
                <div className="border-t pt-4">
                  <a
                    href={`/director/talents/${talentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                  >
                    <StarIcon className="w-4 h-4 ml-2" />
                    مشاهده پروفایل کامل
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <UserIcon className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600">اطلاعاتی یافت نشد</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentInfoPopup;
