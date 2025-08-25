import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StartConversationModal from './StartConversationModal';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const StartConversationButton = ({ talent, casting = null, className = '' }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show for casting directors
  if (!user || user.role !== 'casting_director') {
    return null;
  }

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium ${className}`}
      >
        <ChatBubbleLeftIcon className="w-5 h-5" />
        <span>شروع مکالمه</span>
      </button>

      <StartConversationModal
        isOpen={isModalOpen}
        onClose={handleClose}
        talent={talent}
        casting={casting}
      />
    </>
  );
};

export default StartConversationButton;
