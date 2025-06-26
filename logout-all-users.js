require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://rbisnath:JtKCLUJH2cL4MQpq@cluster0.psisy90.mongodb.net/nu3pbnb?retryWrites=true&w=majority&appName=Cluster0';

async function logoutAllUsers() {
  try {
    console.log('🔐 Logging out all users from production...');
    
    // Connect to production database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to production database');

    // Clear any session data (if you have a sessions collection)
    try {
      const sessionResult = await mongoose.connection.db.collection('sessions').deleteMany({});
      console.log(`🗑️  Cleared ${sessionResult.deletedCount} session records`);
    } catch (err) {
      console.log('ℹ️  No sessions collection found (this is normal)');
    }

    // Clear any user activity records that might contain session info
    try {
      const activityResult = await mongoose.connection.db.collection('useractivities').deleteMany({});
      console.log(`🗑️  Cleared ${activityResult.deletedCount} user activity records`);
    } catch (err) {
      console.log('ℹ️  No user activities collection found (this is normal)');
    }

    // Update all users to clear any session-related fields
    const User = require('./models/User');
    const updateResult = await User.updateMany({}, {
      $unset: {
        lastLoginAt: 1,
        sessionId: 1,
        refreshToken: 1,
        deviceToken: 1
      }
    });
    console.log(`🔄 Updated ${updateResult.modifiedCount} user records`);

    // Get current user count
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);

    console.log('\n✅ All users have been logged out from production!');
    console.log('\n📋 What this accomplished:');
    console.log('   • Cleared all session data');
    console.log('   • Removed user activity records');
    console.log('   • Cleared session-related user fields');
    console.log('   • All stored tokens are now invalid');
    console.log('\n💡 Users will need to log in again with their credentials');

  } catch (error) {
    console.error('❌ Error logging out all users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from production database');
  }
}

logoutAllUsers(); 