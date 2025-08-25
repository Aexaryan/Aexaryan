const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('MongoDB URI not provided');
      return;
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@castingplatform.com',
      password: 'admin123456',
      firstName: 'مدیر',
      lastName: 'سیستم',
      role: 'admin',
      status: 'active',
      isVerified: true
    });

    await adminUser.save();
    console.log('Admin user created successfully:');
    console.log('Email: admin@castingplatform.com');
    console.log('Password: admin123456');
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the script
createAdminUser();
