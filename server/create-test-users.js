const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const WriterProfile = require('./models/WriterProfile');
const TalentProfile = require('./models/TalentProfile');
const CastingDirectorProfile = require('./models/CastingDirectorProfile');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/casting-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestUsers() {
  try {
    console.log('Creating test users...');
    
    // Create a writer user
    const writerPassword = await bcrypt.hash('writer123456', 10);
    const writer = new User({
      email: 'writer@castingplatform.com',
      password: writerPassword,
      firstName: 'نویسنده',
      lastName: 'تست',
      role: 'journalist',
      isVerified: true,
      isActive: true
    });
    
    await writer.save();
    console.log('Writer user created:', writer.email);
    
    // Create writer profile
    const writerProfile = new WriterProfile({
      user: writer._id,
      specialization: 'نویسنده محتوا',
      bio: 'نویسنده حرفه‌ای با تجربه در زمینه محتوا',
      phone: '09123456789',
      website: 'https://writer-test.com'
    });
    
    await writerProfile.save();
    console.log('Writer profile created');
    
    // Create a talent user
    const talentPassword = await bcrypt.hash('talent123456', 10);
    const talent = new User({
      email: 'talent@castingplatform.com',
      password: talentPassword,
      firstName: 'استعداد',
      lastName: 'تست',
      role: 'talent',
      isVerified: true,
      isActive: true
    });
    
    await talent.save();
    console.log('Talent user created:', talent.email);
    
    // Create talent profile
    const talentProfile = new TalentProfile({
      user: talent._id,
      specialization: 'بازیگر',
      bio: 'بازیگر حرفه‌ای با تجربه در سینما و تلویزیون',
      phoneNumber: '09123456788',
      city: 'تهران',
      experience: 'intermediate'
    });
    
    await talentProfile.save();
    console.log('Talent profile created');
    
    // Create a casting director user
    const directorPassword = await bcrypt.hash('director123456', 10);
    const director = new User({
      email: 'director@castingplatform.com',
      password: directorPassword,
      firstName: 'کارگردان',
      lastName: 'کستینگ',
      role: 'casting_director',
      isVerified: true,
      isActive: true
    });
    
    await director.save();
    console.log('Casting director user created:', director.email);
    
    // Create casting director profile
    const directorProfile = new CastingDirectorProfile({
      user: director._id,
      companyName: 'شرکت تولید فیلم تست',
      biography: 'کارگردان کستینگ حرفه‌ای با تجربه در صنعت سینما',
      phoneNumber: '02112345678',
      city: 'تهران',
      experience: 'advanced',
      specialties: ['film', 'tv']
    });
    
    await directorProfile.save();
    console.log('Casting director profile created');
    
    console.log('\nTest users created successfully!');
    console.log('Writer: writer@castingplatform.com / writer123456');
    console.log('Talent: talent@castingplatform.com / talent123456');
    console.log('Director: director@castingplatform.com / director123456');
    
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUsers();
