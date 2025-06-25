const mongoose = require('mongoose');
const User = require('./models/User');

async function updateUserEmailsWithPrefix() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nu3pbnb');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users to update`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      const currentEmail = user.email;
      
      // Check if email already has a prefix
      if (currentEmail.startsWith('guest') || currentEmail.startsWith('host') || currentEmail.startsWith('admin')) {
        console.log(`Skipping ${currentEmail} - already has prefix`);
        skippedCount++;
        continue;
      }

      // Create new email with prefix
      const newEmail = `${user.role}${currentEmail}`;
      
      // Check if the new email already exists
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        console.log(`Skipping ${currentEmail} - ${newEmail} already exists`);
        skippedCount++;
        continue;
      }

      // Update the user's email
      user.email = newEmail;
      await user.save();
      
      console.log(`Updated: ${currentEmail} → ${newEmail} (${user.role})`);
      updatedCount++;
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log('User email update completed!');

    // Show some examples of the new emails
    console.log('\n=== EXAMPLE LOGINS ===');
    const sampleUsers = await User.find().limit(5);
    sampleUsers.forEach(user => {
      console.log(`${user.email} / password123 (${user.role})`);
    });

  } catch (error) {
    console.error('Error updating user emails:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

updateUserEmailsWithPrefix(); 