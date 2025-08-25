import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, BuildingOfficeIcon, MapPinIcon, PhoneIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import ApprovalBadge from '../Common/ApprovalBadge';

const DirectorInfoPopup = ({ isOpen, onClose, directorId, directorName }) => {
  const [directorInfo, setDirectorInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && directorId) {
      fetchDirectorInfo();
    }
  }, [isOpen, directorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDirectorInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/castings/profile/${directorId}`);
      setDirectorInfo(response.data.profile);
    } catch (error) {
      console.error('Error fetching director info:', error);
      setError('خطا در دریافت اطلاعات کارگردان');
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
                اطلاعات کارگردان
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
            ) : directorInfo ? (
              <div className="space-y-4">
                {/* Profile Image and Basic Info */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-2 border-white shadow-lg">
                      {directorInfo.profileImage?.url ? (
                        <img 
                          src={directorInfo.profileImage.url} 
                          alt={directorInfo.firstName}
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
                      {directorInfo.firstName} {directorInfo.lastName}
                    </h4>
                    {directorInfo.companyName && (
                      <p className="text-gray-600 flex items-center gap-1">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        {directorInfo.companyName}
                      </p>
                    )}
                    {directorInfo.position && (
                      <p className="text-sm text-gray-500">
                        {directorInfo.position === 'casting_director' ? 'کارگردان کستینگ' : directorInfo.position}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                {(directorInfo.phoneNumber || directorInfo.website) && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">اطلاعات تماس</h5>
                    <div className="space-y-2">
                      {directorInfo.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{directorInfo.phoneNumber}</span>
                        </div>
                      )}
                      {directorInfo.website && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GlobeAltIcon className="w-4 h-4" />
                          <a 
                            href={directorInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 underline"
                          >
                            {directorInfo.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {(directorInfo.city || directorInfo.province) && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">موقعیت</h5>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4" />
                      <span>
                        {[directorInfo.city, directorInfo.province].filter(Boolean).join('، ')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Biography */}
                {directorInfo.biography && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">درباره</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {directorInfo.biography}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {directorInfo.experience && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">تجربیات</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {directorInfo.experience}
                    </p>
                  </div>
                )}

                {/* Specialties */}
                {directorInfo.specialties && directorInfo.specialties.length > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">تخصص‌ها</h5>
                    <div className="flex flex-wrap gap-2">
                      {directorInfo.specialties.map((specialty, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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

export default DirectorInfoPopup;
