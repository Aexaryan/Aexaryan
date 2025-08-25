const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const createWriterUser = async () => {
  try {
    // Connect to MongoDB
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('MongoDB URI not provided');
      return;
    }

    // Check if writer user already exists
    const existingWriter = await User.findOne({ email: 'writer@castingplatform.com' });
    if (existingWriter) {
      console.log('Writer user already exists:', existingWriter.email);
      console.log('Email: writer@castingplatform.com');
      console.log('Password: writer123456');
      console.log('Role: journalist');
      return;
    }

    // Create writer user
    const writerUser = new User({
      email: 'writer@castingplatform.com',
      password: 'writer123456',
      firstName: 'نویسنده',
      lastName: 'محترم',
      role: 'journalist',
      status: 'active',
      isVerified: true,
      writerProfile: {
        isApprovedWriter: true,
        totalArticles: 0,
        totalViews: 0,
        autoApproval: true,
        autoApprovalGrantedAt: new Date(),
        autoApprovalGrantedBy: null,
        bio: 'نویسنده حرفه‌ای با تجربه در زمینه سینما و تلویزیون',
        skills: ['نویسندگی', 'تحلیل فیلم', 'نقد سینمایی', 'خبرنگاری'],
        phone: '+989123456789',
        website: 'https://writer.example.com'
      }
    });

    await writerUser.save();
    console.log('Writer user created successfully:');
    console.log('Email: writer@castingplatform.com');
    console.log('Password: writer123456');
    console.log('Role: journalist');
    console.log('Writer Profile: Approved with auto-approval');

  } catch (error) {
    console.error('Error creating writer user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the script
createWriterUser();
