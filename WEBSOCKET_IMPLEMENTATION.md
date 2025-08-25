# 🔌 WebSocket Implementation for Real-Time Messaging

## 📋 Overview

This document describes the WebSocket implementation for real-time messaging in the casting platform. The system replaces the previous polling-based approach with a more efficient WebSocket-based solution using Socket.IO.

## 🏗️ Architecture

### Server-Side Components

#### 1. **Socket.IO Server Setup** (`server/index.js`)
- Integrated Socket.IO with Express.js server
- CORS configuration for client connections
- Global socket service instance

#### 2. **Socket Service** (`server/services/socketService.js`)
- **Authentication Middleware**: JWT token validation
- **Event Handlers**: Connection, disconnection, and custom events
- **Message Broadcasting**: Real-time message delivery
- **Room Management**: Conversation-based rooms
- **Typing Indicators**: Real-time typing status
- **Read Receipts**: Message read status updates

### Client-Side Components

#### 1. **Socket Service** (`client/src/services/socketService.js`)
- **Connection Management**: Automatic reconnection with exponential backoff
- **Event Handling**: Custom event system for React components
- **Error Handling**: Graceful error recovery
- **Typing Indicators**: Send/receive typing status

#### 2. **Messaging Context** (`client/src/contexts/MessagingContext.js`)
- **WebSocket Integration**: Real-time message updates
- **State Management**: Conversation and message state
- **Event Listeners**: WebSocket event handling
- **Typing Indicators**: Real-time typing status

#### 3. **UI Components**
- **MessageList**: Real-time message display with typing indicators
- **MessageInput**: Typing indicator integration
- **ConversationsList**: Real-time conversation updates

## 🔄 Event Flow

### Message Sending Flow
```
1. User types message → MessageInput component
2. Typing indicator sent → WebSocket (typing-start)
3. Message submitted → HTTP POST to /messages/conversations/:id/messages
4. Server saves message → Database
5. Server broadcasts → WebSocket (new-message)
6. Recipients receive → Real-time update in UI
7. Typing indicator stopped → WebSocket (typing-stop)
```

### Message Reading Flow
```
1. User opens conversation → HTTP GET messages
2. Messages marked as read → HTTP PATCH /messages/conversations/:id/read
3. Server updates database → Mark messages as read
4. Server broadcasts → WebSocket (messages-read)
5. Sender receives → Real-time read receipt update
```

## 📡 WebSocket Events

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `new-message` | `{conversationId, message}` | New message received |
| `messages-read` | `{conversationId, messageIds, readBy}` | Messages marked as read |
| `conversation-updated` | `{conversationId, conversation}` | Conversation updated |
| `conversation-deleted` | `{conversationId}` | Conversation deleted |
| `user-typing` | `{conversationId, userId, userName}` | User started typing |
| `user-stop-typing` | `{conversationId, userId}` | User stopped typing |
| `notification` | `{type, senderName, ...}` | General notification |

### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `join-conversation` | `conversationId` | Join conversation room |
| `leave-conversation` | `conversationId` | Leave conversation room |
| `typing-start` | `conversationId` | Start typing indicator |
| `typing-stop` | `conversationId` | Stop typing indicator |
| `mark-read` | `{conversationId, messageIds}` | Mark messages as read |

## 🔐 Authentication

### JWT Token Validation
- WebSocket connections require valid JWT tokens
- Tokens are validated on connection and for each event
- Invalid tokens result in connection rejection

### User Session Management
- User-socket mapping for targeted message delivery
- Automatic cleanup on disconnection
- Support for multiple browser tabs per user

## 🚀 Performance Features

### Connection Management
- **Automatic Reconnection**: Exponential backoff strategy
- **Connection Pooling**: Efficient socket management
- **Error Recovery**: Graceful handling of network issues

### Message Optimization
- **Room-Based Broadcasting**: Messages only sent to conversation participants
- **Typing Debouncing**: Prevents excessive typing indicators
- **Read Receipt Batching**: Efficient read status updates

### Memory Management
- **Event Listener Cleanup**: Proper cleanup on component unmount
- **Socket Disconnection**: Automatic cleanup on user logout
- **Memory Leak Prevention**: Proper event listener management

## 🛠️ Implementation Details

### Server-Side Implementation

```javascript
// Socket.IO server setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket service initialization
const socketService = new SocketService(io);
global.socketService = socketService;
```

### Client-Side Implementation

```javascript
// Socket service connection
socketService.connect(token);

// Event listeners
socketService.on('message:new', handleNewMessage);
socketService.on('typing:start', handleTypingStart);
socketService.on('typing:stop', handleTypingStop);
```

### Message Broadcasting

```javascript
// Server-side message broadcasting
await global.socketService.sendMessageToConversation(conversationId, message);

// Client-side message reception
const handleNewMessage = (data) => {
  const { conversationId, message } = data;
  setMessages(prev => [...prev, message]);
};
```

## 🔧 Configuration

### Environment Variables

#### Server (.env)
```env
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
```

#### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5001
```

### Socket.IO Configuration

#### Server
- **Transports**: WebSocket with polling fallback
- **CORS**: Configured for client origin
- **Authentication**: JWT token validation
- **Rooms**: Conversation-based room management

#### Client
- **Reconnection**: Exponential backoff (1s, 2s, 4s, 8s, 16s)
- **Max Attempts**: 5 reconnection attempts
- **Timeout**: 20 seconds connection timeout
- **Transports**: WebSocket preferred, polling fallback

## 🧪 Testing

### Manual Testing
1. Start server: `cd server && npm start`
2. Start client: `cd client && npm start`
3. Open multiple browser tabs/windows
4. Login with different users
5. Start conversations and send messages
6. Verify real-time updates across tabs

### Automated Testing
```bash
# Test WebSocket connection
node test-websocket.js

# Expected output:
# 🔌 Testing WebSocket connection...
# ❌ WebSocket connection error (expected due to invalid token): Authentication error: Invalid token
# ⏰ Test completed
```

## 📊 Monitoring

### Connection Status
- Real-time connection status in browser console
- Automatic reconnection attempts logging
- Error tracking and reporting

### Performance Metrics
- Message delivery latency
- Connection stability
- Reconnection frequency
- Error rates

## 🚨 Error Handling

### Common Issues

1. **Connection Failures**
   - Automatic reconnection with exponential backoff
   - User notification on persistent failures
   - Fallback to HTTP polling if WebSocket unavailable

2. **Authentication Errors**
   - Token validation on connection
   - Automatic logout on invalid tokens
   - Clear error messages to users

3. **Message Delivery Issues**
   - Retry mechanism for failed messages
   - Offline message queuing
   - Delivery status tracking

### Error Recovery
- **Network Issues**: Automatic reconnection
- **Server Restarts**: Client reconnection
- **Token Expiry**: Automatic logout and redirect
- **Message Failures**: Retry with exponential backoff

## 🔄 Migration from Polling

### Changes Made
1. **Removed Polling**: Eliminated 3-5 second polling intervals
2. **Added WebSocket**: Real-time event-driven updates
3. **Enhanced UX**: Typing indicators and read receipts
4. **Improved Performance**: Reduced server load and latency

### Benefits
- **Real-time Updates**: Instant message delivery
- **Reduced Latency**: No polling delays
- **Better UX**: Typing indicators and read receipts
- **Lower Server Load**: Event-driven vs. constant polling
- **Improved Scalability**: Efficient resource usage

## 📈 Future Enhancements

### Planned Features
1. **File Sharing**: Real-time file upload progress
2. **Voice Messages**: Audio message support
3. **Video Calls**: WebRTC integration
4. **Push Notifications**: Browser notifications
5. **Message Encryption**: End-to-end encryption
6. **Message Reactions**: Emoji reactions
7. **Message Threading**: Reply to specific messages
8. **Message Search**: Real-time search functionality

### Performance Optimizations
1. **Message Compression**: Reduce bandwidth usage
2. **Connection Pooling**: Optimize socket management
3. **Message Batching**: Batch multiple messages
4. **Offline Support**: Queue messages when offline
5. **Message Sync**: Sync across multiple devices

## 🔍 Debugging

### Server-Side Debugging
```javascript
// Enable Socket.IO debugging
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL },
  debug: true // Enable debug logging
});
```

### Client-Side Debugging
```javascript
// Enable Socket.IO client debugging
const socket = io(process.env.REACT_APP_API_URL, {
  debug: true // Enable debug logging
});
```

### Common Debug Commands
```bash
# Check WebSocket connections
netstat -an | grep :5001

# Monitor Socket.IO events
# Add console.log statements in event handlers

# Test WebSocket connection
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" \
  http://localhost:5001
```

## 📚 Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
- [Real-time Communication Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [JWT Authentication](https://jwt.io/introduction/)

---

**Note**: This implementation provides a robust, scalable real-time messaging system that significantly improves user experience while maintaining security and performance standards.
