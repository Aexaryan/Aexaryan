// Test script to verify user identification logic
const testUserIdentification = () => {
  // Mock user data (writer)
  const currentUser = {
    _id: "68aa415f1a1272942835dcc6",
    id: "68aa415f1a1272942835dcc6",
    role: "journalist"
  };

  // Mock conversation data
  const conversation = {
    _id: "68aa894d13802cc03dedd85a",
    conversationType: "writer_user",
    initiator: {
      _id: "68aa415f1a1272942835dcc6",
      id: "68aa415f1a1272942835dcc6",
      firstName: "نویسنده",
      lastName: "محترم",
      email: "writer@castingplatform.com",
      role: "journalist"
    },
    recipient: {
      _id: "68a79b626e45eae1a312365d",
      id: "68a79b626e45eae1a312365d",
      firstName: "کاربر",
      lastName: "کاربر",
      email: "test@example.com",
      role: "casting_director",
      profileImage: {}
    }
  };

  // Test the getOtherUser logic
  const getOtherUser = (conversation, user) => {
    if (conversation.conversationType === 'writer_user') {
      const currentUserId = user._id || user.id;
      const initiatorId = conversation.initiator._id || conversation.initiator.id;
      const recipientId = conversation.recipient._id || conversation.recipient.id;
      
      const isInitiator = initiatorId === currentUserId;
      console.log('User ID comparison:', {
        currentUserId,
        initiatorId,
        recipientId,
        isInitiator
      });
      
      return isInitiator ? conversation.recipient : conversation.initiator;
    }
    return null;
  };

  const otherUser = getOtherUser(conversation, currentUser);
  
  console.log('Test Results:');
  console.log('Current User:', currentUser);
  console.log('Conversation:', {
    id: conversation._id,
    type: conversation.conversationType,
    initiator: conversation.initiator.firstName + ' ' + conversation.initiator.lastName,
    recipient: conversation.recipient.firstName + ' ' + conversation.recipient.lastName
  });
  console.log('Other User:', otherUser ? {
    id: otherUser._id || otherUser.id,
    name: otherUser.firstName + ' ' + otherUser.lastName,
    role: otherUser.role,
    email: otherUser.email
  } : null);
};

testUserIdentification();
