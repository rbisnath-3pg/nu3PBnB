require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || process.argv[2];
console.log('Connecting to MongoDB URI:', MONGODB_URI);

const TEST_USERS = [
  { email: 'admin@nu3pbnb.com', password: 'admin123', role: 'admin' },
  { email: 'Raul50@gmail.com', password: 'host123', role: 'host' },
  { email: 'Ashtyn.Barrows99@gmail.com', password: 'host123', role: 'host' },
  { email: 'Evelyn_Feeney68@gmail.com', password: 'guest123', role: 'guest' },
  { email: 'Kristopher32@hotmail.com', password: 'guest123', role: 'guest' },
];

async function debugLoginIssue() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to production database');
    
    for (const testUser of TEST_USERS) {
      console.log(`\n--- Checking ${testUser.email} ---`);
      
      const user = await User.findOne({ email: testUser.email.toLowerCase() });
      if (!user) {
        console.log(`❌ User not found: ${testUser.email}`);
        continue;
      }
      
      console.log(`✅ User found: ${user.name} (${user.role})`);
      console.log(`Current password hash: ${user.password.substring(0, 20)}...`);
      
      // Test password match
      const isMatch = await bcrypt.compare(testUser.password, user.password);
      console.log(`Password match: ${isMatch}`);
      
      if (!isMatch) {
        console.log(`🔄 Resetting password for ${testUser.email}`);
        const newHash = await bcrypt.hash(testUser.password, 10);
        user.password = newHash;
        await user.save();
        console.log(`✅ Password reset for ${testUser.email}`);
        
        // Verify the new password works
        const verifyMatch = await bcrypt.compare(testUser.password, user.password);
        console.log(`Verification after reset: ${verifyMatch}`);
      }
    }
    
  } catch (err) {
    console.error('Error debugging login issue:', err);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from production database');
  }
}

debugLoginIssue(); 