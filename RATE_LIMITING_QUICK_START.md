# Rate Limiting Quick Start Guide

## Quick Implementation Steps

### 1. Replace Axios with API Utility

**Before:**
```javascript
import axios from 'axios';

const fetchData = async () => {
  try {
    const response = await axios.get('/api/endpoint');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

**After:**
```javascript
import api from '../utils/api';

const fetchData = async () => {
  try {
    const response = await api.get('/api/endpoint');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 2. Add Rate Limiting Hook

```javascript
import { useRateLimit } from '../hooks/useRateLimit';

const MyComponent = () => {
  const {
    isRateLimited,
    formatCountdown,
    shouldDisableActions,
    handleRateLimitError,
    resetRateLimit
  } = useRateLimit();

  const handleAction = async () => {
    try {
      await api.post('/api/action');
      // Success handling
    } catch (error) {
      if (handleRateLimitError(error)) {
        // Rate limit error handled by hook
        toast.error('درخواست‌های شما محدود شده است');
      } else {
        // Other error handling
        toast.error('خطا در انجام عملیات');
      }
    }
  };

  return (
    <div>
      {/* Rate limit warning */}
      {isRateLimited && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
          <p className="text-yellow-800">
            درخواست‌های شما محدود شده است. {formatCountdown() && `${formatCountdown()} صبر کنید`}
          </p>
        </div>
      )}

      {/* Disabled button during rate limiting */}
      <button 
        onClick={handleAction}
        disabled={shouldDisableActions()}
        className="btn-primary disabled:opacity-50"
      >
        انجام عملیات
      </button>
    </div>
  );
};
```

### 3. Handle Rate Limit Errors

```javascript
// Simple error handling
try {
  const response = await api.get('/api/data');
  // Handle success
} catch (error) {
  if (isRateLimitError(error)) {
    const retryAfter = getRetryAfterTime(error);
    toast.error(`درخواست‌های شما محدود شده است. ${retryAfter ? `${retryAfter} ثانیه صبر کنید` : 'لطفاً صبر کنید'}`);
  } else {
    toast.error('خطا در دریافت اطلاعات');
  }
}
```

### 4. Use Debounced Requests

```javascript
import { createDebouncedRequest } from '../utils/api';

const MyComponent = () => {
  const debouncedSearch = createDebouncedRequest(
    async (searchTerm) => {
      const response = await api.get(`/api/search?q=${searchTerm}`);
      return response.data;
    },
    500 // 500ms delay
  );

  const handleSearch = (searchTerm) => {
    debouncedSearch(searchTerm).then(results => {
      // Handle results
    });
  };
};
```

### 5. Batch Multiple Requests

```javascript
import { batchRequests } from '../utils/api';

const MyComponent = () => {
  const fetchMultipleItems = async (itemIds) => {
    const requests = itemIds.map(id => 
      () => api.get(`/api/items/${id}`)
    );
    
    const results = await batchRequests(requests, 5, 100);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Item ${itemIds[index]}:`, result.value.data);
      } else {
        console.error(`Failed to fetch item ${itemIds[index]}:`, result.reason);
      }
    });
  };
};
```

## Common Patterns

### Form Submission with Rate Limiting

```javascript
const MyForm = () => {
  const { handleRateLimitError, shouldDisableActions } = useRateLimit();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await api.post('/api/submit', formData);
      toast.success('اطلاعات با موفقیت ثبت شد');
    } catch (error) {
      if (handleRateLimitError(error)) {
        toast.error('درخواست‌های شما محدود شده است');
      } else {
        toast.error('خطا در ثبت اطلاعات');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={loading || shouldDisableActions()}
        className="btn-primary disabled:opacity-50"
      >
        {loading ? 'در حال ثبت...' : 'ثبت'}
      </button>
    </form>
  );
};
```

### Data Fetching with Retry

```javascript
const MyDataComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { handleRateLimitError } = useRateLimit();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/data');
      setData(response.data);
    } catch (error) {
      if (handleRateLimitError(error)) {
        // Rate limit handled automatically by API utility
        // Data will be retried with exponential backoff
      } else {
        toast.error('خطا در دریافت اطلاعات');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>در حال بارگذاری...</div>;
  if (!data) return <div>اطلاعاتی یافت نشد</div>;

  return <div>{/* Render data */}</div>;
};
```

### Real-time Updates with Rate Limiting

```javascript
const MyRealTimeComponent = () => {
  const [updates, setUpdates] = useState([]);
  const { handleRateLimitError } = useRateLimit();

  const fetchUpdates = async () => {
    try {
      const response = await api.get('/api/updates');
      setUpdates(response.data);
    } catch (error) {
      if (handleRateLimitError(error)) {
        // Rate limit handled, will retry automatically
      } else {
        console.error('Failed to fetch updates:', error);
      }
    }
  };

  // Poll for updates with rate limiting awareness
  useEffect(() => {
    const interval = setInterval(fetchUpdates, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  return <div>{/* Render updates */}</div>;
};
```

## Best Practices

### 1. Always Use the API Utility
- Replace all `axios` imports with `api`
- Use the provided error handling utilities
- Leverage automatic retry logic

### 2. Implement Rate Limit Awareness
- Use the `useRateLimit` hook for components that make API calls
- Show appropriate UI feedback during rate limiting
- Disable actions when rate limited

### 3. Optimize Request Patterns
- Use debouncing for search inputs
- Batch related requests
- Cache frequently accessed data
- Implement proper pagination

### 4. Provide User Feedback
- Show loading states during requests
- Display rate limit warnings
- Provide countdown timers when available
- Use clear, actionable error messages

### 5. Handle Edge Cases
- Network failures
- Server errors
- Authentication issues
- Data validation errors

## Testing Your Implementation

```javascript
// In browser console (development only)
import { runAllTests } from './utils/test-rate-limiting';
runAllTests();

// Or test individual functions
window.testRateLimiting.testRateLimitDetection();
```

## Monitoring

Check browser console for:
- Retry attempt logs
- Rate limit detection
- Cache usage information
- Error details

## Troubleshooting

### Common Issues

1. **Requests still failing**: Ensure you're using `api` instead of `axios`
2. **No retry attempts**: Check that error status is in `retryableStatuses`
3. **UI not updating**: Verify `useRateLimit` hook is properly integrated
4. **Cache not working**: Check service worker registration and cache configuration

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'rate-limiting');
```

This will show detailed logs for rate limiting behavior.
