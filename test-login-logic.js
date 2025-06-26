require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testLoginLogic() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    const email = 'admin@nu3pbnb.com';
    const password = 'admin123';
    
    console.log(`Testing login logic for: ${email}`);
    
    // Step 1: Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ No user found for email:', email);
      return;
    }
    console.log('✅ User found:', user.name, `(${user.role})`);
    
    // Step 2: Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match');
      console.log('Current hash:', user.password.substring(0, 20) + '...');
      
      // Let's try to create a new hash and compare
      const newHash = await bcrypt.hash(password, 10);
      console.log('New hash:', newHash.substring(0, 20) + '...');
      
      const newMatch = await bcrypt.compare(password, newHash);
      console.log('New hash match:', newMatch);
      
      // Update the user's password
      user.password = newHash;
      await user.save();
      console.log('✅ Password updated in database');
      
      // Test again
      const finalMatch = await bcrypt.compare(password, user.password);
      console.log('Final password match:', finalMatch);
    } else {
      console.log('✅ Password matches correctly');
    }
    
  } catch (error) {
    console.error('Error testing login logic:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from database');
  }
}

testLoginLogic(); 