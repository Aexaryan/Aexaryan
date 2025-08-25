import React, { useState } from 'react';
import { FlagIcon } from '@heroicons/react/24/outline';
import ReportModal from './ReportModal';

const ReportButton = ({ 
  reportType, 
  targetId, 
  targetTitle, 
  className = '',
  variant = 'button' // 'button' or 'icon'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      {variant === 'button' ? (
        <button
          onClick={handleReport}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors ${className}`}
        >
          <FlagIcon className="w-4 h-4" />
          گزارش
        </button>
      ) : (
        <button
          onClick={handleReport}
          className={`p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${className}`}
          title="گزارش"
        >
          <FlagIcon className="w-5 h-5" />
        </button>
      )}

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reportType={reportType}
        targetId={targetId}
        targetTitle={targetTitle}
      />
    </>
  );
};

export default ReportButton;
