// Manual test script for rate limiting functionality
// Run this in browser console to test rate limiting

const testRateLimiting = async () => {
  console.log('🧪 Starting manual rate limiting test...');
  
  // Test 1: Make rapid API calls to trigger rate limiting
  console.log('\n📡 Test 1: Making rapid API calls...');
  
  const rapidCalls = async () => {
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        fetch('/api/blogs?page=1&limit=12&sort=newest')
          .then(response => {
            console.log(`Call ${i + 1}: Status ${response.status}`);
            return response;
          })
          .catch(error => {
            console.log(`Call ${i + 1}: Error ${error.message}`);
            return error;
          })
      );
    }
    
    const results = await Promise.allSettled(promises);
    return results;
  };
  
  const results = await rapidCalls();
  
  // Analyze results
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
  const rateLimited = results.filter(r => r.status === 'fulfilled' && r.value.status === 429).length;
  const errors = results.filter(r => r.status === 'rejected').length;
  
  console.log(`\n📊 Results:`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`🚫 Rate Limited: ${rateLimited}`);
  console.log(`❌ Errors: ${errors}`);
  
  // Test 2: Test retry logic
  console.log('\n🔄 Test 2: Testing retry logic...');
  
  const testRetry = async () => {
    try {
      const response = await fetch('/api/blogs?page=1&limit=12&sort=newest');
      console.log(`Retry test response: ${response.status}`);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        console.log(`Retry after: ${retryAfter} seconds`);
      }
    } catch (error) {
      console.log(`Retry test error: ${error.message}`);
    }
  };
  
  await testRetry();
  
  // Test 3: Test service worker caching
  console.log('\n💾 Test 3: Testing service worker caching...');
  
  const testCaching = async () => {
    try {
      // Make a request that should be cached
      const response1 = await fetch('/api/blogs?page=1&limit=12&sort=newest');
      console.log(`First request: ${response1.status}`);
      
      // Make the same request again (should use cache if available)
      const response2 = await fetch('/api/blogs?page=1&limit=12&sort=newest');
      console.log(`Second request: ${response2.status}`);
      
      // Check if responses are the same (indicating cache usage)
      const text1 = await response1.text();
      const text2 = await response2.text();
      console.log(`Responses identical: ${text1 === text2}`);
      
    } catch (error) {
      console.log(`Caching test error: ${error.message}`);
    }
  };
  
  await testCaching();
  
  console.log('\n✅ Manual rate limiting test completed!');
  console.log('\n📝 Check the browser console for detailed logs from the API utility.');
  console.log('🔍 Look for retry attempts, rate limit detection, and cache usage.');
};

// Test rate limiting hook functionality
const testRateLimitHook = () => {
  console.log('🧪 Testing rate limit hook functionality...');
  
  // This would need to be run in a React component context
  console.log('Note: Rate limit hook testing requires React component context.');
  console.log('Navigate to the UserManagement page to test the hook functionality.');
};

// Export functions for use in browser console
window.testRateLimiting = testRateLimiting;
window.testRateLimitHook = testRateLimitHook;

console.log('🚀 Rate limiting test functions loaded!');
console.log('Run testRateLimiting() to start testing.');
console.log('Navigate to /admin/users to test the UserManagement component.');

// Auto-run basic test if in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔄 Auto-running basic test in 3 seconds...');
  setTimeout(() => {
    testRateLimiting();
  }, 3000);
}
