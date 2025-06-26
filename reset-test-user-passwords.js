require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const TEST_USERS = [
  { email: 'admin_robbie@google.com', password: 'admin123', role: 'admin' },
  { email: 'host_davonte@hotmail.com', password: 'host123', role: 'host' },
  { email: 'host_georgette@hotmail.com', password: 'host123', role: 'host' },
  { email: 'host_josh@hotmail.com', password: 'host123', role: 'host' },
  { email: 'guest_patience@hotmail.com', password: 'guest123', role: 'guest' },
  { email: 'guest_rubie@gmail.com', password: 'guest123', role: 'guest' },
];

async function resetTestUserPasswords() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nu3pbnb';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    console.log('Resetting passwords for test users...');

    for (const testUser of TEST_USERS) {
      try {
        const user = await User.findOne({ email: testUser.email });
        
        if (user) {
          // Hash the password
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(testUser.password, saltRounds);
          
          // Update the user's password
          user.password = hashedPassword;
          await user.save();
          
          console.log(`✅ Password reset for: ${testUser.email} (${testUser.role})`);
        } else {
          console.log(`❌ User not found: ${testUser.email}`);
        }
      } catch (userError) {
        console.error(`❌ Error resetting password for ${testUser.email}:`, userError.message);
      }
    }

    console.log('\n=== PASSWORD RESET COMPLETE ===');
    console.log('Test users ready for login:');
    TEST_USERS.forEach(user => {
      console.log(`${user.email} / ${user.password} (${user.role})`);
    });

  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

resetTestUserPasswords(); 