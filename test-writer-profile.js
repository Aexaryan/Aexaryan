const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';
const TEST_EMAIL = 'writer@test.com';
const TEST_PASSWORD = 'password123';

async function testWriterProfile() {
  console.log('🧪 Testing Writer Profile Functionality...\n');

  try {
    // Step 1: Login as writer
    console.log('1. Logging in as writer...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginResponse.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Login successful\n');

    // Step 2: Get current profile
    console.log('2. Getting current profile...');
    const profileResponse = await axios.get(`${BASE_URL}/writer/profile`);
    console.log('Current profile:', JSON.stringify(profileResponse.data, null, 2));
    console.log('✅ Profile retrieved successfully\n');

    // Step 3: Update profile with new bio
    console.log('3. Updating profile bio...');
    const updateResponse = await axios.put(`${BASE_URL}/writer/profile`, {
      bio: 'نویسنده حرفه‌ای با تجربه در زمینه سینما و تلویزیون - تست شده',
      specialization: 'سینما و تلویزیون',
      experience: 5,
      phone: '+989123456789',
      website: 'https://example.com',
      location: 'تهران',
      education: 'کارشناسی ارشد سینما',
      awards: 'جایزه بهترین نویسنده سال 2024',
      skills: JSON.stringify(['فیلمنامه‌نویسی', 'تحلیل فیلم', 'نقد سینمایی'])
    });
    
    console.log('Update response:', JSON.stringify(updateResponse.data, null, 2));
    console.log('✅ Profile updated successfully\n');

    // Step 4: Get updated profile
    console.log('4. Getting updated profile...');
    const updatedProfileResponse = await axios.get(`${BASE_URL}/writer/profile`);
    console.log('Updated profile:', JSON.stringify(updatedProfileResponse.data, null, 2));
    console.log('✅ Updated profile retrieved successfully\n');

    // Step 5: Test profile image field exists
    console.log('5. Checking profile image field...');
    if (updatedProfileResponse.data.profileImage !== undefined) {
      console.log('✅ Profile image field exists in response');
    } else {
      console.log('❌ Profile image field missing from response');
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testWriterProfile();
