# Progressive Web App (PWA) Implementation Guide

## Overview
This document outlines the comprehensive PWA implementation for the Casting Platform, providing mobile users with an app-like experience including offline functionality, home screen installation, and enhanced performance.

## 🚀 PWA Features Implemented

### 1. **App Installation**
- **Home Screen Installation**: Users can install the app on their mobile devices
- **Install Prompt**: Automatic prompt when app meets installation criteria
- **App Shortcuts**: Quick access to key features (Search Talents, Create Casting, Messages)
- **Standalone Mode**: App runs in full-screen mode when installed

### 2. **Offline Functionality**
- **Service Worker**: Handles caching and offline requests
- **Offline Page**: Custom offline experience with cached content access
- **Background Sync**: Syncs offline actions when connection is restored
- **Cache Strategies**: Different caching strategies for different content types

### 3. **Performance Optimizations**
- **Static Caching**: Core app files cached for instant loading
- **Dynamic Caching**: API responses cached for offline access
- **Network-First Strategy**: API requests try network first, fallback to cache
- **Cache-First Strategy**: Static assets served from cache first

### 4. **Push Notifications**
- **Notification Support**: Browser notifications for important events
- **Permission Management**: Request and manage notification permissions
- **Custom Notifications**: App-specific notification styling

### 5. **Mobile Optimizations**
- **Responsive Design**: Optimized for all mobile screen sizes
- **Touch-Friendly**: Large touch targets and mobile-optimized interactions
- **Safe Area Support**: Proper handling of device notches and safe areas
- **Viewport Optimization**: Mobile-optimized viewport settings

## 📁 File Structure

```
client/
├── public/
│   ├── manifest.json          # PWA manifest configuration
│   ├── sw.js                  # Service worker
│   ├── offline.html           # Offline page
│   └── index.html             # Updated with PWA meta tags
├── src/
│   ├── services/
│   │   └── pwaService.js      # PWA service management
│   ├── contexts/
│   │   └── PWAContext.js      # React context for PWA state
│   ├── components/
│   │   └── Common/
│   │       ├── PWAInstallPrompt.js    # Install prompt component
│   │       └── OfflineIndicator.js    # Offline status indicator
│   └── index.css              # PWA-specific styles
```

## 🔧 Configuration

### Manifest.json
```json
{
  "short_name": "کستینگ پلت",
  "name": "پلتفرم جامع کستینگ - ارتباط بین استعدادها و کارگردانان",
  "description": "پلتفرم جامع کستینگ برای ارتباط بین استعدادها و کارگردانان کستینگ",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#db0000",
  "background_color": "#000000",
  "scope": "/",
  "lang": "fa",
  "dir": "rtl"
}
```

### Service Worker Features
- **Install Event**: Caches static files on first load
- **Activate Event**: Cleans up old caches
- **Fetch Event**: Handles network requests with caching strategies
- **Background Sync**: Syncs offline actions when online
- **Push Notifications**: Handles push notification events

## 🎯 Usage Examples

### Using PWA Context in Components
```javascript
import { usePWA } from '../contexts/PWAContext';

const MyComponent = () => {
  const { 
    isOnline, 
    isInstalled, 
    installApp, 
    showNotification,
    storeOfflineAction 
  } = usePWA();

  const handleAction = async () => {
    if (!isOnline) {
      // Store action for offline sync
      await storeOfflineAction({
        url: '/api/castings',
        method: 'POST',
        body: JSON.stringify(data)
      });
    } else {
      // Perform action immediately
      await performAction();
    }
  };

  return (
    <div>
      {!isOnline && <p>You're offline</p>}
      {!isInstalled && <button onClick={installApp}>Install App</button>}
    </div>
  );
};
```

### Storing Offline Actions
```javascript
const { storeOfflineAction } = usePWA();

// Store an action for later sync
await storeOfflineAction({
  url: '/api/applications',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(applicationData)
});
```

### Requesting Notification Permission
```javascript
const { requestNotificationPermission, showNotification } = usePWA();

const enableNotifications = async () => {
  const granted = await requestNotificationPermission();
  if (granted) {
    showNotification('اعلان‌ها فعال شد', 'شما اکنون اعلان‌های جدید را دریافت خواهید کرد');
  }
};
```

## 📱 Mobile Features

### App Shortcuts
The PWA includes quick access shortcuts for:
- **جستجوی استعداد**: Search for new talents
- **ایجاد کستینگ**: Create new casting
- **پیام‌ها**: View new messages

### Offline Experience
- **Cached Pages**: Core pages available offline
- **Offline Indicator**: Shows when user is offline
- **Sync Button**: Manual sync for offline actions
- **Retry Connection**: Automatic reconnection attempts

### Performance Optimizations
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Responsive images with proper sizing
- **Code Splitting**: JavaScript bundles split for faster loading
- **Preloading**: Critical resources preloaded

## 🔄 Caching Strategies

### Static Assets (Cache-First)
```javascript
// Files cached immediately on install
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];
```

### API Requests (Network-First)
```javascript
// API endpoints with network-first strategy
const API_ENDPOINTS = [
  '/api/castings',
  '/api/talents',
  '/api/blogs',
  '/api/news'
];
```

### Dynamic Content (Cache-First)
- External resources (fonts, images)
- User-generated content
- Third-party resources

## 🛠 Development and Testing

### Testing PWA Features
1. **Installation**: Use Chrome DevTools > Application > Manifest
2. **Service Worker**: Check Application > Service Workers
3. **Cache**: Monitor Application > Storage > Cache Storage
4. **Offline Mode**: Use DevTools > Network > Offline

### PWA Audit
Use Lighthouse to audit PWA features:
```bash
# Install Lighthouse
npm install -g lighthouse

# Run PWA audit
lighthouse https://your-app.com --view
```

### Debugging Service Worker
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Check cache
caches.keys().then(names => {
  console.log('Cache names:', names);
});
```

## 📊 PWA Metrics

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### PWA Score
- **Installable**: 100%
- **PWA Optimized**: 100%
- **Offline Functionality**: 100%

## 🔒 Security Considerations

### HTTPS Requirement
- PWA features require HTTPS in production
- Service worker only works over secure connections
- Local development uses localhost (considered secure)

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data: https: blob:;
               script-src 'self';
               connect-src 'self' ws: wss:;">
```

## 🚀 Deployment

### Production Checklist
- [ ] HTTPS enabled
- [ ] Service worker registered
- [ ] Manifest.json accessible
- [ ] Icons in all required sizes
- [ ] Offline page working
- [ ] Cache strategies tested
- [ ] Push notifications configured
- [ ] Performance optimized

### Build Process
```bash
# Build the app
npm run build

# Test PWA features
npm run test:pwa

# Deploy to production
npm run deploy
```

## 📈 Analytics and Monitoring

### PWA Metrics to Track
- **Install Rate**: Percentage of users who install the app
- **Offline Usage**: How often users access offline content
- **Cache Hit Rate**: Effectiveness of caching strategies
- **Background Sync Success**: Success rate of offline action sync

### Monitoring Tools
- **Google Analytics**: Track PWA events
- **Lighthouse CI**: Automated PWA audits
- **Web Vitals**: Monitor performance metrics
- **Service Worker Analytics**: Track service worker performance

## 🔮 Future Enhancements

### Planned Features
1. **Advanced Caching**: Intelligent cache invalidation
2. **Background Sync**: More sophisticated sync strategies
3. **Push Notifications**: Rich notifications with actions
4. **App Updates**: Seamless app updates
5. **Offline Analytics**: Track offline usage patterns

### Performance Improvements
- **WebAssembly**: For compute-intensive operations
- **Web Workers**: For background processing
- **Streaming**: For large data transfers
- **Compression**: Better compression algorithms

## 📚 Resources

### Documentation
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

### Testing
- [PWA Testing Checklist](https://web.dev/pwa-checklist/)
- [Service Worker Testing](https://developers.google.com/web/tools/workbox/guides/test)
- [PWA Debugging](https://web.dev/debug-pwa/)

## 🤝 Support

For questions or issues with the PWA implementation:
1. Check the browser console for errors
2. Verify service worker registration
3. Test offline functionality
4. Review cache strategies
5. Contact the development team

---

This PWA implementation provides a native app-like experience for mobile users while maintaining web accessibility and performance. Regular monitoring and updates ensure optimal user experience across all devices and network conditions.
