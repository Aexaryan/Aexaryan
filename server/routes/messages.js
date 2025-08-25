const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const TalentProfile = require('../models/TalentProfile');
const CastingDirectorProfile = require('../models/CastingDirectorProfile');
const { auth, requireTalent, requireCastingDirector } = require('../middleware/auth');

const router = express.Router();

// Get all conversations for the current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = { isActive: true }; // Only show active conversations by default
    
    if (req.user.role === 'casting_director') {
      filter.director = req.user._id;
      filter.conversationType = 'director_talent';
    } else if (req.user.role === 'talent') {
      filter.talent = req.user._id;
      filter.conversationType = 'director_talent';
    } else if (req.user.role === 'journalist') {
      // Writers can be either initiator or recipient
      filter.$or = [
        { initiator: req.user._id, conversationType: 'writer_user' },
        { recipient: req.user._id, conversationType: 'writer_user' }
      ];
    } else {
      return res.status(403).json({ error: 'دسترسی غیرمجاز' });
    }

    const conversations = await Conversation.find(filter)
      .populate('director', 'email firstName lastName role')
      .populate('talent', 'email firstName lastName role')
      .populate('initiator', 'email firstName lastName role')
      .populate('recipient', 'email firstName lastName role')
      .populate('casting', 'title')
      .populate('lastMessage', 'content createdAt')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Populate profile information for directors and talents
    const populatedConversations = await Promise.all(conversations.map(async (conversation) => {
      const conv = conversation.toObject();
      
      if (conversation.conversationType === 'director_talent') {
        // For director-talent conversations
        if (conversation.director) {
          const directorProfile = await CastingDirectorProfile.findOne({ user: conversation.director._id });
          conv.director = {
            ...conv.director,
            profileImage: directorProfile?.profileImage,
            companyName: directorProfile?.companyName
          };
        }
        
        if (conversation.talent) {
          const talentProfile = await TalentProfile.findOne({ user: conversation.talent._id });
          conv.talent = {
            ...conv.talent,
            headshot: talentProfile?.headshot,
            specialization: talentProfile?.specialization
          };
        }
      } else if (conversation.conversationType === 'writer_user') {
        // For writer-user conversations
        if (conversation.initiator) {
          if (conversation.initiator.role === 'casting_director') {
            const directorProfile = await CastingDirectorProfile.findOne({ user: conversation.initiator._id });
            conv.initiator = {
              ...conv.initiator,
              profileImage: directorProfile?.profileImage,
              companyName: directorProfile?.companyName
            };
          } else if (conversation.initiator.role === 'talent') {
            const talentProfile = await TalentProfile.findOne({ user: conversation.initiator._id });
            conv.initiator = {
              ...conv.initiator,
              headshot: talentProfile?.headshot,
              specialization: talentProfile?.specialization
            };
          }
        }
        
        if (conversation.recipient) {
          if (conversation.recipient.role === 'casting_director') {
            const directorProfile = await CastingDirectorProfile.findOne({ user: conversation.recipient._id });
            conv.recipient = {
              ...conv.recipient,
              profileImage: directorProfile?.profileImage,
              companyName: directorProfile?.companyName
            };
          } else if (conversation.recipient.role === 'talent') {
            const talentProfile = await TalentProfile.findOne({ user: conversation.recipient._id });
            conv.recipient = {
              ...conv.recipient,
              headshot: talentProfile?.headshot,
              specialization: talentProfile?.specialization
            };
          }
        }
      }
      
      return conv;
    }));

    res.json({
      success: true,
      conversations: populatedConversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'خطا در دریافت مکالمات' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'مکالمه یافت نشد' });
    }

    // Check if user is a participant
    let isParticipant = false;
    if (conversation.conversationType === 'director_talent') {
      isParticipant = conversation.director?.toString() === req.user._id.toString() ||
                     conversation.talent?.toString() === req.user._id.toString();
    } else if (conversation.conversationType === 'writer_user') {
      isParticipant = conversation.initiator?.toString() === req.user._id.toString() ||
                     conversation.recipient?.toString() === req.user._id.toString();
    }

    if (!isParticipant) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark messages as read for the current user
    const unreadMessages = messages.filter(msg => 
      !msg.isRead && msg.sender._id.toString() !== req.user._id.toString()
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg._id);
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { isRead: true, readAt: new Date() }
      );

      // Update messages in response
      messages.forEach(msg => {
        if (unreadMessages.some(unread => unread._id.toString() === msg._id.toString())) {
          msg.isRead = true;
          msg.readAt = new Date();
        }
      });
    }

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'خطا در دریافت پیام‌ها' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'محتوای پیام الزامی است' });
    }

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'مکالمه یافت نشد' });
    }

    // Check if user is a participant
    let isParticipant = false;
    if (conversation.conversationType === 'director_talent') {
      isParticipant = conversation.director?.toString() === req.user._id.toString() ||
                     conversation.talent?.toString() === req.user._id.toString();
    } else if (conversation.conversationType === 'writer_user') {
      isParticipant = conversation.initiator?.toString() === req.user._id.toString() ||
                     conversation.recipient?.toString() === req.user._id.toString();
    }

    if (!isParticipant) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز' });
    }

    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: req.user._id,
      content: content.trim(),
      isDelivered: true
    });

    await message.save();

    // Populate sender information
    await message.populate('sender', 'firstName lastName role');

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(201).json({
      success: true,
      message: 'پیام با موفقیت ارسال شد',
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'خطا در ارسال پیام' });
  }
});

// Start a new conversation (for directors and writers)
router.post('/conversations', auth, async (req, res) => {
  try {
    const { recipientId, subject, initialMessage, castingId } = req.body;

    if (!recipientId || !subject || !initialMessage) {
      return res.status(400).json({ error: 'تمام فیلدهای ضروری را پر کنید' });
    }

    // Only directors and writers can start conversations
    if (req.user.role !== 'casting_director' && req.user.role !== 'journalist') {
      return res.status(403).json({ error: 'فقط کارگردانان کستینگ و نویسندگان می‌توانند مکالمه شروع کنند' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'کاربر مورد نظر یافت نشد' });
    }

    // Check if conversation already exists
    let existingConversation;
    if (req.user.role === 'casting_director') {
      existingConversation = await Conversation.findOne({
        director: req.user._id,
        talent: recipientId,
        conversationType: 'director_talent'
      });
    } else if (req.user.role === 'journalist') {
      existingConversation = await Conversation.findOne({
        $or: [
          { initiator: req.user._id, recipient: recipientId, conversationType: 'writer_user' },
          { initiator: recipientId, recipient: req.user._id, conversationType: 'writer_user' }
        ]
      });
    }

    if (existingConversation) {
      return res.status(400).json({ 
        error: 'مکالمه قبلاً وجود دارد',
        conversationId: existingConversation._id 
      });
    }

    // Create new conversation
    const conversationData = {
      subject,
      casting: castingId || null,
      conversationType: req.user.role === 'casting_director' ? 'director_talent' : 'writer_user'
    };

    if (req.user.role === 'casting_director') {
      conversationData.director = req.user._id;
      conversationData.talent = recipientId;
    } else {
      conversationData.initiator = req.user._id;
      conversationData.recipient = recipientId;
    }

    const conversation = new Conversation(conversationData);
    await conversation.save();

    // Create initial message
    const message = new Message({
      conversation: conversation._id,
      sender: req.user._id,
      content: initialMessage.trim(),
      isDelivered: true
    });

    await message.save();
    await message.populate('sender', 'firstName lastName role');

    // Update conversation with last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(201).json({
      success: true,
      message: 'مکالمه با موفقیت ایجاد شد',
      conversation,
      initialMessage: message
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'خطا در ایجاد مکالمه' });
  }
});

// Mark conversation as read
router.patch('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'مکالمه یافت نشد' });
    }

    // Check if user is a participant
    let isParticipant = false;
    if (conversation.conversationType === 'director_talent') {
      isParticipant = conversation.director?.toString() === req.user._id.toString() ||
                     conversation.talent?.toString() === req.user._id.toString();
    } else if (conversation.conversationType === 'writer_user') {
      isParticipant = conversation.initiator?.toString() === req.user._id.toString() ||
                     conversation.recipient?.toString() === req.user._id.toString();
    }

    if (!isParticipant) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز' });
    }

    // Mark all unread messages as read
    const result = await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'پیام‌ها با موفقیت خوانده شدند',
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'خطا در خواندن پیام‌ها' });
  }
});

// Close a conversation
router.patch('/conversations/:conversationId/close', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'مکالمه یافت نشد' });
    }

    // Check if user is a participant
    let isParticipant = false;
    if (conversation.conversationType === 'director_talent') {
      isParticipant = conversation.director?.toString() === req.user._id.toString() ||
                     conversation.talent?.toString() === req.user._id.toString();
    } else if (conversation.conversationType === 'writer_user') {
      isParticipant = conversation.initiator?.toString() === req.user._id.toString() ||
                     conversation.recipient?.toString() === req.user._id.toString();
    }

    if (!isParticipant) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز' });
    }

    // Close the conversation
    conversation.isActive = false;
    await conversation.save();

    res.json({
      success: true,
      message: 'مکالمه با موفقیت بسته شد'
    });
  } catch (error) {
    console.error('Error closing conversation:', error);
    res.status(500).json({ error: 'خطا در بستن مکالمه' });
  }
});

// Delete a conversation
router.delete('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'مکالمه یافت نشد' });
    }

    // Check if user is a participant
    let isParticipant = false;
    if (conversation.conversationType === 'director_talent') {
      isParticipant = conversation.director?.toString() === req.user._id.toString() ||
                     conversation.talent?.toString() === req.user._id.toString();
    } else if (conversation.conversationType === 'writer_user') {
      isParticipant = conversation.initiator?.toString() === req.user._id.toString() ||
                     conversation.recipient?.toString() === req.user._id.toString();
    }

    if (!isParticipant) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز' });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversation: conversationId });

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.json({
      success: true,
      message: 'مکالمه با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'خطا در حذف مکالمه' });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    let filter = { isActive: true };
    
    if (req.user.role === 'casting_director') {
      filter.director = req.user._id;
      filter.conversationType = 'director_talent';
    } else if (req.user.role === 'talent') {
      filter.talent = req.user._id;
      filter.conversationType = 'director_talent';
    } else if (req.user.role === 'journalist') {
      filter.$or = [
        { initiator: req.user._id, conversationType: 'writer_user' },
        { recipient: req.user._id, conversationType: 'writer_user' }
      ];
    }

    const conversations = await Conversation.find(filter);
    const conversationIds = conversations.map(conv => conv._id);

    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.user._id },
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'خطا در دریافت تعداد پیام‌های نخوانده' });
  }
});

module.exports = router;
