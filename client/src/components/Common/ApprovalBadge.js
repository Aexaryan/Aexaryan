import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const ApprovalBadge = ({ size = 'sm', showText = true }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm'
  };

  return (
    <div className="inline-flex items-center space-x-1 space-x-reverse bg-green-100 text-green-800 px-2 py-1 rounded-full">
      <CheckCircleIcon className={`${sizeClasses[size]} text-green-600`} />
      {showText && (
        <span className={`${textSizes[size]} font-medium`}>
          تایید شده
        </span>
      )}
    </div>
  );
};

export default ApprovalBadge;
