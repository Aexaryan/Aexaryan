const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const removeAndCreateAdmin = async () => {
  try {
    // Connect to MongoDB
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('MongoDB URI not provided');
      return;
    }

    // Remove all existing admin users
    const deleteResult = await User.deleteMany({ role: 'admin' });
    console.log(`Removed ${deleteResult.deletedCount} existing admin user(s)`);

    // Create new admin user
    const adminUser = new User({
      email: 'admin@castingplatform.com',
      password: 'admin123456',
      role: 'admin',
      status: 'active',
      isVerified: true
    });

    await adminUser.save();
    console.log('\n✅ New admin user created successfully:');
    console.log('📧 Email: admin@castingplatform.com');
    console.log('🔑 Password: admin123456');
    console.log('👤 Role: admin');
    console.log('✅ Status: active');
    console.log('✅ Verified: true');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

// Run the script
removeAndCreateAdmin();
