const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  // For director-talent conversations
  director: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  talent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // For writer-user conversations
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // Conversation type to distinguish between director-talent and writer-user
  conversationType: {
    type: String,
    enum: ['director_talent', 'writer_user'],
    required: true
  },
  casting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Casting',
    required: false // Optional, for casting-specific conversations
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    director: {
      type: Number,
      default: 0
    },
    talent: {
      type: Number,
      default: 0
    },
    initiator: {
      type: Number,
      default: 0
    },
    recipient: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique conversations between director and talent (only for director_talent type)
conversationSchema.index(
  { director: 1, talent: 1, conversationType: 1 }, 
  { unique: true, partialFilterExpression: { conversationType: 'director_talent' } }
);

// Ensure unique conversations between initiator and recipient (only for writer_user type)
conversationSchema.index(
  { initiator: 1, recipient: 1, conversationType: 1 }, 
  { unique: true, partialFilterExpression: { conversationType: 'writer_user' } }
);

// Update the updatedAt field before saving
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
