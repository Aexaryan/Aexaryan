# Professional Messaging System

## Overview

The casting platform now features a comprehensive, professional messaging system that enables seamless communication between casting directors and talents. The system is designed with a modern, user-friendly interface that provides an excellent user experience.

## Features

### 🎨 **Modern UI/UX Design**
- **Full-screen chat interface** with responsive design
- **Professional color scheme** with primary brand colors
- **Smooth animations** and hover effects
- **Mobile-responsive** design with touch-friendly interactions
- **RTL (Right-to-Left)** support for Persian language

### 💬 **Conversation Management**
- **Conversation list** with unread message indicators
- **Real-time message status** (sent, delivered, read)
- **Message timestamps** with smart formatting
- **Date separators** for better message organization
- **Auto-scroll** to latest messages

### 👥 **User Experience**
- **Clickable user avatars** that link to profiles
- **Online status indicators** (green dots)
- **Unread message badges** with count
- **Message preview** in conversation list
- **Professional conversation headers** with user info

### 📱 **Mobile Optimization**
- **Responsive layout** that adapts to screen size
- **Mobile navigation** with back buttons
- **Touch-friendly** buttons and interactions
- **Optimized for mobile** chat experience

## Components

### 1. **MessagingPage** (`/src/pages/Messaging/MessagingPage.js`)
- Main messaging interface
- Handles conversation selection
- Mobile-responsive layout
- Professional header with statistics

### 2. **ConversationsList** (`/src/components/Messaging/ConversationsList.js`)
- Displays all conversations
- Shows user avatars and online status
- Unread message indicators
- Message previews and timestamps

### 3. **MessageList** (`/src/components/Messaging/MessageList.js`)
- Displays messages in a conversation
- Message bubbles with proper alignment
- Date separators
- Read receipts and timestamps

### 4. **MessageInput** (`/src/components/Messaging/MessageInput.js`)
- Auto-resizing textarea
- File upload support (ready for implementation)
- Character counter
- Emoji button (ready for implementation)
- Professional send button with animations

### 5. **StartConversationButton** (`/src/components/Messaging/StartConversationButton.js`)
- Reusable button component with gradient styling
- Opens conversation modal
- Only visible to casting directors
- Enhanced with hover effects and animations
- Used in talent profiles and search results

### 6. **StartConversationModal** (`/src/components/Messaging/StartConversationModal.js`)
- Modal for starting new conversations
- Form validation
- Subject and initial message fields
- Professional styling

### 7. **FloatingMessagingButton** (`/src/components/Messaging/FloatingMessagingButton.js`)
- Floating action button for quick access
- Bottom-left positioning
- Unread count indicator with animation
- Tooltip on hover
- Available throughout the application

## Usage

### For Casting Directors

1. **Start a Conversation:**
   - Visit any talent's profile (`/director/talents/:id`)
   - Click the prominent "شروع مکالمه" (Start Conversation) button
   - Fill in the subject and initial message
   - Submit to start the conversation
   - **OR** use the quick conversation button in talent search results

2. **Access Messages:**
   - **Header**: Click the enhanced chat icon with unread count
   - **Sidebar**: Use the messaging menu item with notification badges
   - **Floating Button**: Use the floating messaging button (bottom-left)
   - View all conversations in the left panel
   - Click on any conversation to view messages
   - Send new messages using the enhanced input at the bottom

### For Talents

1. **Receive Messages:**
   - Messages appear in the conversation list
   - Unread messages are highlighted with badges
   - Click on conversations to view and reply

2. **Access Messages:**
   - **Header**: Click the enhanced chat icon with unread count
   - **Sidebar**: Use the messaging menu item with notification badges  
   - **Floating Button**: Use the floating messaging button (bottom-left)
   - View all conversations
   - Reply to messages from directors

## Technical Implementation

### Backend API Endpoints

```javascript
// Get conversations
GET /messages/conversations

// Get messages in a conversation
GET /messages/conversations/:conversationId

// Send a message
POST /messages/conversations/:conversationId/messages

// Start a new conversation
POST /messages/conversations

// Mark conversation as read
PATCH /messages/conversations/:conversationId/read

// Get unread count
GET /messages/unread-count
```

### Context Management

The messaging system uses React Context (`MessagingContext`) for state management:

```javascript
const {
  conversations,
  selectedConversation,
  messages,
  unreadCount,
  sendMessage,
  startConversation,
  selectConversation
} = useMessaging();
```

### Database Schema

```javascript
// Conversation Schema
{
  _id: ObjectId,
  director: ObjectId,
  talent: ObjectId,
  subject: String,
  lastMessage: String,
  lastMessageAt: Date,
  unreadCount: {
    director: Number,
    talent: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// Message Schema
{
  _id: ObjectId,
  conversationId: ObjectId,
  sender: ObjectId,
  content: String,
  isRead: Boolean,
  createdAt: Date
}
```

## Styling

The messaging system uses Tailwind CSS with custom components:

### Color Scheme
- **Primary**: `primary-600` (brand blue)
- **Background**: `gray-50` for chat area
- **Messages**: `white` for received, `primary-600` for sent
- **Accents**: `red-500` for unread indicators

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Hover effects and transitions
- **Inputs**: Focus states with ring effects
- **Avatars**: Circular with border styling

## Future Enhancements

### Planned Features
1. **Real-time messaging** with WebSocket integration
2. **File sharing** (images, documents)
3. **Emoji picker** integration
4. **Message reactions** (like, heart, etc.)
5. **Voice messages** support
6. **Message search** functionality
7. **Conversation archiving**
8. **Message editing** and deletion
9. **Typing indicators**
10. **Push notifications**

### Technical Improvements
1. **WebSocket** for real-time updates
2. **Message encryption** for security
3. **File upload** to cloud storage
4. **Message caching** for performance
5. **Offline support** with message queuing

## Accessibility

The messaging system includes several accessibility features:

- **Keyboard navigation** support
- **Screen reader** compatibility
- **Focus management** for modals
- **ARIA labels** for interactive elements
- **Color contrast** compliance
- **Touch targets** sized appropriately

## Performance

### Optimizations
- **Lazy loading** of conversation lists
- **Message pagination** for large conversations
- **Image optimization** for avatars
- **Debounced** input handling
- **Memoized** components for better performance

### Best Practices
- **Efficient re-renders** with React.memo
- **Proper cleanup** of event listeners
- **Optimized API calls** with caching
- **Minimal DOM updates** with virtual scrolling

## Conclusion

The messaging system provides a professional, modern chat experience that enhances communication between casting directors and talents. With its responsive design, intuitive interface, and comprehensive feature set, it serves as a solid foundation for real-time communication in the casting platform.

The system is built with scalability in mind and can easily accommodate future enhancements like real-time messaging, file sharing, and advanced features as the platform grows.
