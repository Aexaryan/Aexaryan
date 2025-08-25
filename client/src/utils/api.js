import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with custom configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 30000, // 30 seconds timeout
});

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableStatuses: [429, 500, 502, 503, 504],
};

// Calculate exponential backoff delay
const calculateDelay = (attempt) => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
    RETRY_CONFIG.maxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add CSRF token if available
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config, response } = error;
    
    // If no config or response, or not a retryable error, reject immediately
    if (!config || !response || !RETRY_CONFIG.retryableStatuses.includes(response.status)) {
      return Promise.reject(error);
    }
    
    // Initialize retry count if not exists
    config.retryCount = config.retryCount || 0;
    
    // Check if we should retry
    if (config.retryCount >= RETRY_CONFIG.maxRetries) {
      // Max retries reached, handle the error
      handleMaxRetriesReached(error);
      return Promise.reject(error);
    }
    
    // Increment retry count
    config.retryCount++;
    
    // Calculate delay
    const delay = calculateDelay(config.retryCount);
    
    console.log(`Retrying request (${config.retryCount}/${RETRY_CONFIG.maxRetries}) after ${delay}ms:`, config.url);
    
    // Show user-friendly message for rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers['retry-after'];
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay;
      
      toast.error(
        `درخواست‌های شما بیش از حد مجاز است. در حال تلاش مجدد... (${config.retryCount}/${RETRY_CONFIG.maxRetries})`,
        { duration: 3000 }
      );
      
      // Wait for the specified time or calculated delay
      await new Promise(resolve => setTimeout(resolve, waitTime));
    } else {
      // For other errors, use exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Retry the request
    return api(config);
  }
);

// Handle max retries reached
const handleMaxRetriesReached = (error) => {
  const { response } = error;
  
  if (response?.status === 429) {
    toast.error(
      'درخواست‌های شما بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید و دوباره تلاش کنید.',
      { duration: 5000 }
    );
  } else if (response?.status >= 500) {
    toast.error(
      'خطا در سرور. لطفاً بعداً تلاش کنید.',
      { duration: 5000 }
    );
  }
  
  console.error('Max retries reached:', error);
};

// Helper function to check if error is rate limiting
export const isRateLimitError = (error) => {
  return error.response?.status === 429;
};

// Helper function to get retry-after time
export const getRetryAfterTime = (error) => {
  const retryAfter = error.response?.headers['retry-after'];
  return retryAfter ? parseInt(retryAfter) : null;
};

// Helper function to create a debounced request
export const createDebouncedRequest = (requestFn, delay = 1000) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        requestFn(...args).then(resolve).catch(reject);
      }, delay);
    });
  };
};

// Helper function to batch requests
export const batchRequests = async (requests, batchSize = 5, delay = 100) => {
  const results = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch);
    results.push(...batchResults);
    
    // Add delay between batches to prevent rate limiting
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
};

export default api;
