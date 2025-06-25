const mongoose = require('mongoose');
const User = require('./models/User');

async function listAdminUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nu3pbnb');
    console.log('Connected to MongoDB');

    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' });
    
    console.log(`\n=== ADMIN USERS (${adminUsers.length} found) ===`);
    
    if (adminUsers.length === 0) {
      console.log('No admin users found in the database.');
      console.log('\nTo create an admin user, you can:');
      console.log('1. Use the signup form and select "Admin" role');
      console.log('2. Or run a script to create an admin user');
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} / password123 (${user.role})`);
        console.log(`   Name: ${user.name}`);
        console.log(`   ID: ${user._id}`);
        console.log('');
      });
    }

    // Also show all user roles for reference
    const allUsers = await User.find();
    const roleCounts = {};
    allUsers.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    
    console.log('=== USER ROLE SUMMARY ===');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`${role}: ${count} users`);
    });

  } catch (error) {
    console.error('Error listing admin users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

listAdminUsers(); 