require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || process.argv[2];
console.log('Connecting to MongoDB URI:', MONGODB_URI);

async function listProductionUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to production database');

    // Get all users grouped by role
    const adminUsers = await User.find({ role: 'admin' }).select('name email role');
    const hostUsers = await User.find({ role: 'host' }).select('name email role').limit(5);
    const guestUsers = await User.find({ role: 'guest' }).select('name email role').limit(5);

    console.log('\n' + '='.repeat(80));
    console.log('🏨 nu3PBnB PRODUCTION TEST LOGINS');
    console.log('='.repeat(80));
    
    console.log('\n🔐 ADMIN USERS (Full System Access)');
    console.log('-'.repeat(50));
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found');
      console.log('💡 Create admin user: admin@nu3pbnb.com / admin123');
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} / admin123`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log('');
      });
    }

    console.log('\n🏠 HOST USERS (Property Management)');
    console.log('-'.repeat(50));
    if (hostUsers.length === 0) {
      console.log('❌ No host users found');
      console.log('💡 Create host user: host@nu3pbnb.com / host123');
    } else {
      hostUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} / host123`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log('');
      });
    }

    console.log('\n👤 GUEST USERS (Booking & Travel)');
    console.log('-'.repeat(50));
    if (guestUsers.length === 0) {
      console.log('❌ No guest users found');
      console.log('💡 Create guest user: guest@nu3pbnb.com / guest123');
    } else {
      guestUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} / guest123`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log('');
      });
    }

    // Show total counts
    const totalUsers = await User.countDocuments();
    const totalHosts = await User.countDocuments({ role: 'host' });
    const totalGuests = await User.countDocuments({ role: 'guest' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    console.log('\n📊 USER STATISTICS');
    console.log('-'.repeat(50));
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Admin Users: ${totalAdmins}`);
    console.log(`Host Users: ${totalHosts}`);
    console.log(`Guest Users: ${totalGuests}`);

    console.log('\n🌐 PRODUCTION URLS');
    console.log('-'.repeat(50));
    console.log('Frontend: https://nu3pbnb-frontend.onrender.com');
    console.log('API: https://nu3pbnb-api.onrender.com');

    console.log('\n💡 TESTING TIPS');
    console.log('-'.repeat(50));
    console.log('• Admin users can access: /admin/dashboard');
    console.log('• Host users can access: /host/dashboard');
    console.log('• Guest users can browse listings and make bookings');
    console.log('• All users can access: /profile for account management');
    console.log('• Use different browsers/incognito for testing multiple users');

    console.log('\n' + '='.repeat(80));
    console.log('✅ Production test logins retrieved successfully!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error listing production users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from production database');
  }
}

// Run the script
listProductionUsers(); 