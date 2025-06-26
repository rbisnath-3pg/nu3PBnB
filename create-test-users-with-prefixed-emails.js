const mongoose = require('mongoose');
const User = require('./models/User');

const TEST_USERS = [
  { email: 'admin_robbie@google.com', password: 'admin123', role: 'admin' },
  { email: 'host_davonte@hotmail.com', password: 'host123', role: 'host' },
  { email: 'host_georgette@hotmail.com', password: 'host123', role: 'host' },
  { email: 'host_josh@hotmail.com', password: 'host123', role: 'host' },
  { email: 'guest_patience@hotmail.com', password: 'guest123', role: 'guest' },
  { email: 'guest_rubie@gmail.com', password: 'guest123', role: 'guest' },
];

async function createTestUsersWithPrefixedEmails() {
  try {
    // Connect to production database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nu3pbnb';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    console.log('Creating test users with prefixed emails...');
    console.log('Test users to create:', TEST_USERS.map(u => ({ email: u.email, role: u.role })));

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const testUser of TEST_USERS) {
      try {
        // Check if user already exists
        let existingUser = await User.findOne({ email: testUser.email });
        
        if (existingUser) {
          // Update existing user's password and role
          existingUser.password = testUser.password;
          existingUser.role = testUser.role;
          await existingUser.save();
          console.log(`✅ Updated existing user: ${testUser.email} (${testUser.role})`);
          updatedCount++;
        } else {
          // Create new user
          const newUser = new User({
            name: `${testUser.role.charAt(0).toUpperCase() + testUser.role.slice(1)} TestUser`,
            email: testUser.email,
            password: testUser.password,
            role: testUser.role,
            onboardingCompleted: true,
            onboarded: true,
            themePreference: 'light',
            language: 'en',
            bio: `Test ${testUser.role} user for automated testing`,
            location: 'Test Location'
          });
          
          await newUser.save();
          console.log(`✅ Created new user: ${testUser.email} (${testUser.role})`);
          createdCount++;
        }
      } catch (userError) {
        console.error(`❌ Error processing user ${testUser.email}:`, userError.message);
        skippedCount++;
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total test users: ${TEST_USERS.length}`);
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);

    // Verify the users exist
    console.log('\n=== VERIFICATION ===');
    for (const testUser of TEST_USERS) {
      const user = await User.findOne({ email: testUser.email });
      if (user) {
        console.log(`✅ Verified: ${user.email} (${user.role}) - Name: ${user.name}`);
      } else {
        console.log(`❌ Missing: ${testUser.email}`);
      }
    }

    // Show login credentials
    console.log('\n=== LOGIN CREDENTIALS ===');
    TEST_USERS.forEach(user => {
      console.log(`${user.email} / ${user.password} (${user.role})`);
    });

    console.log('\n🎉 Test user creation completed!');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createTestUsersWithPrefixedEmails(); 