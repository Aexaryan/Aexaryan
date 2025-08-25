// Test utility for rate limiting functionality
import api, { isRateLimitError, getRetryAfterTime, createDebouncedRequest, batchRequests } from './api';

// Mock rate limit error
const createMockRateLimitError = (retryAfter = 60) => ({
  response: {
    status: 429,
    headers: {
      'retry-after': retryAfter.toString()
    },
    data: {
      error: 'درخواست‌های شما بیش از حد مجاز است'
    }
  }
});

// Mock server error
const createMockServerError = () => ({
  response: {
    status: 500,
    data: {
      error: 'خطا در سرور'
    }
  }
});

// Test rate limit detection
export const testRateLimitDetection = () => {
  console.log('🧪 Testing rate limit detection...');
  
  const rateLimitError = createMockRateLimitError();
  const serverError = createMockServerError();
  const networkError = { message: 'Network Error' };
  
  console.log('Rate limit error detection:', isRateLimitError(rateLimitError)); // Should be true
  console.log('Server error detection:', isRateLimitError(serverError)); // Should be false
  console.log('Network error detection:', isRateLimitError(networkError)); // Should be false
  
  const retryAfter = getRetryAfterTime(rateLimitError);
  console.log('Retry after time:', retryAfter); // Should be 60
  
  console.log('✅ Rate limit detection tests completed');
};

// Test debounced request
export const testDebouncedRequest = async () => {
  console.log('🧪 Testing debounced request...');
  
  let callCount = 0;
  const mockRequest = () => {
    callCount++;
    return Promise.resolve({ data: { success: true } });
  };
  
  const debouncedRequest = createDebouncedRequest(mockRequest, 100);
  
  // Make multiple rapid calls
  debouncedRequest();
  debouncedRequest();
  debouncedRequest();
  
  // Wait for debounce delay
  await new Promise(resolve => setTimeout(resolve, 150));
  
  console.log('Call count:', callCount); // Should be 1
  console.log('✅ Debounced request test completed');
};

// Test batch requests
export const testBatchRequests = async () => {
  console.log('🧪 Testing batch requests...');
  
  const requests = [
    () => Promise.resolve({ data: { id: 1 } }),
    () => Promise.resolve({ data: { id: 2 } }),
    () => Promise.resolve({ data: { id: 3 } }),
    () => Promise.resolve({ data: { id: 4 } }),
    () => Promise.resolve({ data: { id: 5 } }),
    () => Promise.resolve({ data: { id: 6 } })
  ];
  
  const results = await batchRequests(requests, 2, 50);
  
  console.log('Batch results:', results.length); // Should be 6
  console.log('✅ Batch requests test completed');
};

// Test API retry logic (simulated)
export const testApiRetryLogic = async () => {
  console.log('🧪 Testing API retry logic...');
  
  // This would require a mock server that returns 429 errors
  // For now, we'll just test the error detection
  try {
    // Simulate a request that might fail
    await api.get('/test-endpoint');
  } catch (error) {
    if (isRateLimitError(error)) {
      console.log('Rate limit error detected and handled');
    } else {
      console.log('Other error:', error.message);
    }
  }
  
  console.log('✅ API retry logic test completed');
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Starting rate limiting tests...\n');
  
  try {
    testRateLimitDetection();
    console.log('');
    
    await testDebouncedRequest();
    console.log('');
    
    await testBatchRequests();
    console.log('');
    
    await testApiRetryLogic();
    console.log('');
    
    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Export for use in development
if (process.env.NODE_ENV === 'development') {
  window.testRateLimiting = {
    testRateLimitDetection,
    testDebouncedRequest,
    testBatchRequests,
    testApiRetryLogic,
    runAllTests
  };
}
