import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WriterStartConversationModal from './WriterStartConversationModal';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const WriterStartConversationButton = ({ user, className = '' }) => {
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show for journalists (writers)
  if (!currentUser || currentUser.role !== 'journalist') {
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
        className={`inline-flex items-center justify-center gap-1 px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors ${className}`}
      >
        <ChatBubbleLeftIcon className="w-3 h-3" />
        <span>گفتگو</span>
      </button>

      <WriterStartConversationModal
        isOpen={isModalOpen}
        onClose={handleClose}
        user={user}
      />
    </>
  );
};

export default WriterStartConversationButton;
