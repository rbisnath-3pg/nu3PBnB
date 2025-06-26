// WARNING: DO NOT MODIFY THIS SCRIPT OR THE locked-test-users.json FILE WITHOUT APPROVAL.
// This script enforces the locked set of default users for all environments.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const lockedUsersPath = path.join(__dirname, '../locked-test-users.json');
const { users: LOCKED_USERS } = JSON.parse(fs.readFileSync(lockedUsersPath, 'utf-8'));

async function seedLockedUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nu3pbnb';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    // Remove all users not in the locked list
    const lockedEmails = LOCKED_USERS.map(u => u.email.toLowerCase());
    await User.deleteMany({ email: { $nin: lockedEmails } });
    console.log('Deleted all users not in locked list.');

    for (const userData of LOCKED_USERS) {
      const email = userData.email.toLowerCase();
      let user = await User.findOne({ email });
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      if (user) {
        user.password = hashedPassword;
        user.role = userData.role;
        user.name = userData.name;
        user.isVerified = true;
        await user.save();
        console.log(`Updated user: ${email}`);
      } else {
        user = new User({
          email,
          password: hashedPassword,
          role: userData.role,
          name: userData.name,
          isVerified: true,
          onboardingCompleted: true,
          onboarded: true,
          themePreference: 'light',
          language: 'en',
          bio: `Locked ${userData.role} user`,
          location: 'Locked User Location'
        });
        await user.save();
        console.log(`Created user: ${email}`);
      }
    }
    console.log('✅ Locked users seeded.');
  } catch (err) {
    console.error('Error seeding locked users:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedLockedUsers(); 