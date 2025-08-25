const mongoose = require('mongoose');
const User = require('./models/User');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkAllUsers() {
  console.log('🔍 Checking All Users in Database...\n');

  try {
    // Get all users
    const allUsers = await User.find({});
    console.log(`📊 Total users in database: ${allUsers.length}`);
    
    // Group users by role
    const usersByRole = {};
    allUsers.forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });
    
    // Display users by role
    Object.keys(usersByRole).forEach(role => {
      console.log(`\n👤 ${role.toUpperCase()} Users (${usersByRole[role].length}):`);
      usersByRole[role].forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Created: ${user.createdAt}`);
      });
    });
    
    // Check if we need to create a director user
    if (!usersByRole['castingDirector'] || usersByRole['castingDirector'].length === 0) {
      console.log('\n⚠️  No director users found!');
      console.log('   This explains why director blogs are missing.');
      console.log('   We need to create a director user to test director blog functionality.');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the check
checkAllUsers();
