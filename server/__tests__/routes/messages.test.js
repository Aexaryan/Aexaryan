const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const messagesRouter = require('../../routes/messages');
const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const User = require('../../models/User');

// Mock models
jest.mock('../../models/Conversation');
jest.mock('../../models/Message');
jest.mock('../../models/User');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/messages', messagesRouter);

describe('Messages Routes', () => {
  let mockUser;
  let mockDirector;
  let mockTalent;
  let mockConversation;
  let mockMessage;
  let authToken;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock data
    mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'talent',
    };

    mockDirector = {
      _id: 'director123',
      email: 'director@example.com',
      firstName: 'John',
      lastName: 'Director',
      role: 'casting_director',
    };

    mockTalent = {
      _id: 'talent123',
      email: 'talent@example.com',
      firstName: 'Jane',
      lastName: 'Talent',
      role: 'talent',
    };

    mockConversation = {
      _id: 'conv1',
      subject: 'Test Conversation',
      director: mockDirector._id,
      talent: mockTalent._id,
      conversationType: 'director_talent',
      lastMessage: 'Hello there!',
      lastMessageAt: new Date('2024-01-01T12:00:00.000Z'),
      unreadCount: 2,
      createdAt: new Date('2024-01-01T10:00:00.000Z'),
      save: jest.fn(),
    };

    mockMessage = {
      _id: 'msg1',
      conversation: 'conv1',
      sender: mockUser._id,
      content: 'Hello there!',
      isRead: false,
      createdAt: new Date('2024-01-01T12:00:00.000Z'),
      populate: jest.fn().mockReturnThis(),
    };

    // Create auth token
    authToken = jwt.sign({ userId: mockUser._id }, process.env.JWT_SECRET);

    // Mock auth middleware
    jest.doMock('../../middleware/auth', () => ({
      auth: (req, res, next) => {
        req.user = mockUser;
        next();
      },
      requireTalent: (req, res, next) => next(),
      requireCastingDirector: (req, res, next) => next(),
    }));
  });

  describe('GET /conversations', () => {
    it('should return conversations for talent user', async () => {
      const mockConversations = [mockConversation];
      
      Conversation.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockConversations)
            })
          })
        })
      });

      Conversation.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.conversations).toEqual(mockConversations);
      expect(response.body.total).toBe(1);
    });

    it('should return conversations for casting director', async () => {
      mockUser.role = 'casting_director';
      
      const mockConversations = [mockConversation];
      
      Conversation.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockConversations)
            })
          })
        })
      });

      Conversation.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.conversations).toEqual(mockConversations);
    });

    it('should return conversations for journalist', async () => {
      mockUser.role = 'journalist';
      
      const mockConversations = [mockConversation];
      
      Conversation.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockConversations)
            })
          })
        })
      });

      Conversation.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.conversations).toEqual(mockConversations);
    });

    it('should return 403 for unauthorized role', async () => {
      mockUser.role = 'admin';

      const response = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('دسترسی غیرمجاز');
    });

    it('should handle database errors', async () => {
      Conversation.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('خطا در دریافت مکالمات');
    });
  });

  describe('GET /conversations/:conversationId', () => {
    it('should return conversation and messages', async () => {
      const mockMessages = [mockMessage];
      
      Conversation.findById.mockResolvedValue(mockConversation);
      Message.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockMessages)
            })
          })
        })
      });
      Message.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/messages/conversations/conv1')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.conversation).toEqual(mockConversation);
      expect(response.body.messages).toEqual(mockMessages);
    });

    it('should return 404 if conversation not found', async () => {
      Conversation.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/messages/conversations/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('مکالمه یافت نشد');
    });

    it('should return 403 if user not participant', async () => {
      mockConversation.director = 'other-director';
      mockConversation.talent = 'other-talent';
      
      Conversation.findById.mockResolvedValue(mockConversation);

      const response = await request(app)
        .get('/api/messages/conversations/conv1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('دسترسی غیرمجاز');
    });

    it('should handle database errors', async () => {
      Conversation.findById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/messages/conversations/conv1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('خطا در دریافت پیام‌ها');
    });
  });

  describe('POST /conversations/:conversationId/messages', () => {
    it('should send message successfully', async () => {
      Conversation.findById.mockResolvedValue(mockConversation);
      Message.mockImplementation(() => ({
        ...mockMessage,
        save: jest.fn().mockResolvedValue(mockMessage),
      }));

      const response = await request(app)
        .post('/api/messages/conversations/conv1/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Hello there!' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('پیام با موفقیت ارسال شد');
    });

    it('should return 400 if content is missing', async () => {
      const response = await request(app)
        .post('/api/messages/conversations/conv1/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('محتوای پیام الزامی است');
    });

    it('should return 400 if content is empty', async () => {
      const response = await request(app)
        .post('/api/messages/conversations/conv1/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('محتوای پیام الزامی است');
    });

    it('should return 404 if conversation not found', async () => {
      Conversation.findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/messages/conversations/nonexistent/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Hello there!' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('مکالمه یافت نشد');
    });

    it('should return 403 if user not participant', async () => {
      mockConversation.director = 'other-director';
      mockConversation.talent = 'other-talent';
      
      Conversation.findById.mockResolvedValue(mockConversation);

      const response = await request(app)
        .post('/api/messages/conversations/conv1/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Hello there!' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('دسترسی غیرمجاز');
    });

    it('should handle database errors', async () => {
      Conversation.findById.mockResolvedValue(mockConversation);
      Message.mockImplementation(() => ({
        ...mockMessage,
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      }));

      const response = await request(app)
        .post('/api/messages/conversations/conv1/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Hello there!' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('خطا در ارسال پیام');
    });
  });

  describe('POST /conversations', () => {
    it('should create new conversation for casting director', async () => {
      mockUser.role = 'casting_director';
      
      User.findById.mockResolvedValue(mockTalent);
      Conversation.findOne.mockResolvedValue(null);
      Conversation.mockImplementation(() => ({
        ...mockConversation,
        save: jest.fn().mockResolvedValue(mockConversation),
      }));
      Message.mockImplementation(() => ({
        ...mockMessage,
        save: jest.fn().mockResolvedValue(mockMessage),
      }));

      const response = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientId: 'talent123',
          subject: 'Test Conversation',
          initialMessage: 'Hello there!',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('مکالمه با موفقیت ایجاد شد');
    });

    it('should create new conversation for journalist', async () => {
      mockUser.role = 'journalist';
      
      User.findById.mockResolvedValue(mockTalent);
      Conversation.findOne.mockResolvedValue(null);
      Conversation.mockImplementation(() => ({
        ...mockConversation,
        save: jest.fn().mockResolvedValue(mockConversation),
      }));
      Message.mockImplementation(() => ({
        ...mockMessage,
        save: jest.fn().mockResolvedValue(mockMessage),
      }));

      const response = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientId: 'talent123',
          subject: 'Test Conversation',
          initialMessage: 'Hello there!',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientId: 'talent123',
          // Missing subject and initialMessage
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('تمام فیلدهای ضروری را پر کنید');
    });

    it('should return 403 if user cannot start conversations', async () => {
      mockUser.role = 'talent';

      const response = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientId: 'director123',
          subject: 'Test Conversation',
          initialMessage: 'Hello there!',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('فقط کارگردانان کستینگ و نویسندگان می‌توانند مکالمه شروع کنند');
    });

    it('should return 404 if recipient not found', async () => {
      mockUser.role = 'casting_director';
      User.findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientId: 'nonexistent',
          subject: 'Test Conversation',
          initialMessage: 'Hello there!',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('کاربر مورد نظر یافت نشد');
    });

    it('should return 400 if conversation already exists', async () => {
      mockUser.role = 'casting_director';
      
      User.findById.mockResolvedValue(mockTalent);
      Conversation.findOne.mockResolvedValue(mockConversation);

      const response = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientId: 'talent123',
          subject: 'Test Conversation',
          initialMessage: 'Hello there!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('مکالمه قبلاً وجود دارد');
      expect(response.body.conversationId).toBe(mockConversation._id);
    });

    it('should handle database errors', async () => {
      mockUser.role = 'casting_director';
      
      User.findById.mockResolvedValue(mockTalent);
      Conversation.findOne.mockResolvedValue(null);
      Conversation.mockImplementation(() => ({
        ...mockConversation,
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      }));

      const response = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientId: 'talent123',
          subject: 'Test Conversation',
          initialMessage: 'Hello there!',
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('خطا در ایجاد مکالمه');
    });
  });

  describe('PATCH /conversations/:conversationId/read', () => {
    it('should mark conversation as read', async () => {
      Conversation.findById.mockResolvedValue(mockConversation);
      Message.updateMany.mockResolvedValue({ modifiedCount: 2 });

      const response = await request(app)
        .patch('/api/messages/conversations/conv1/read')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('پیام‌ها با موفقیت خوانده شدند');
    });

    it('should return 404 if conversation not found', async () => {
      Conversation.findById.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/messages/conversations/nonexistent/read')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('مکالمه یافت نشد');
    });

    it('should return 403 if user not participant', async () => {
      mockConversation.director = 'other-director';
      mockConversation.talent = 'other-talent';
      
      Conversation.findById.mockResolvedValue(mockConversation);

      const response = await request(app)
        .patch('/api/messages/conversations/conv1/read')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('دسترسی غیرمجاز');
    });

    it('should handle database errors', async () => {
      Conversation.findById.mockResolvedValue(mockConversation);
      Message.updateMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .patch('/api/messages/conversations/conv1/read')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('خطا در خواندن پیام‌ها');
    });
  });

  describe('GET /unread-count', () => {
    it('should return unread count for talent', async () => {
      Message.countDocuments.mockResolvedValue(5);

      const response = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.unreadCount).toBe(5);
    });

    it('should return unread count for casting director', async () => {
      mockUser.role = 'casting_director';
      Message.countDocuments.mockResolvedValue(3);

      const response = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.unreadCount).toBe(3);
    });

    it('should return 403 for unauthorized role', async () => {
      mockUser.role = 'admin';

      const response = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('دسترسی غیرمجاز');
    });

    it('should handle database errors', async () => {
      Message.countDocuments.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('خطا در دریافت تعداد پیام‌های نخوانده');
    });
  });
});
