import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, HomeIcon } from '@heroicons/react/24/outline';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
      <Link 
        to="/" 
        className="flex items-center hover:text-primary-600 transition-colors"
      >
        <HomeIcon className="w-4 h-4 ml-1" />
        خانه
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronLeftIcon className="w-4 h-4 text-gray-400" />
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link 
              to={item.href} 
              className="hover:text-primary-600 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
