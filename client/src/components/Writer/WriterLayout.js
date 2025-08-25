import React from 'react';
import WriterHeader from './WriterHeader';
import WriterSidebar from './WriterSidebar';

const WriterLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <WriterHeader />
      
      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <WriterSidebar />
        
        {/* Content Area */}
        <div className="flex-1">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default WriterLayout;
