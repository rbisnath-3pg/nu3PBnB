const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function resetUserPasswords() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nu3pbnb');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users to update`);

    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let updatedCount = 0;

    for (const user of users) {
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
      
      console.log(`Updated password for: ${user.email} (${user.role})`);
      updatedCount++;
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`New password for all users: ${newPassword}`);
    console.log('Password reset completed!');

    // Show some example logins
    console.log('\n=== EXAMPLE LOGINS ===');
    const sampleUsers = await User.find().limit(5);
    sampleUsers.forEach(user => {
      console.log(`${user.email} / ${newPassword} (${user.role})`);
    });

  } catch (error) {
    console.error('Error resetting user passwords:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

resetUserPasswords(); 