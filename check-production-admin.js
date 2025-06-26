#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

console.log('🔍 Checking Production Admin User...');
console.log('='.repeat(60));

async function checkProductionAdmin() {
  try {
    // Connect to the same database that the API is using
    // We need to use the MONGODB_URI from Render, not local .env
    const MONGODB_URI = 'mongodb+srv://rbisnath:JtKCLUJH2cL4MQpq@cluster0.psisy90.mongodb.net/nu3pbnb?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('📡 Connecting to production database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to production database');
    
    // Find the admin user
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (adminUser) {
      console.log('\n👤 Admin User Found:');
      console.log(`   ID: ${adminUser._id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Created: ${adminUser.createdAt}`);
      
      // Test the password
      const isCorrectPassword = await bcrypt.compare('admin123', adminUser.password);
      console.log(`   Password correct for 'admin123': ${isCorrectPassword ? '✅' : '❌'}`);
      
      if (!isCorrectPassword) {
        console.log('\n🔄 Updating admin password...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        adminUser.password = hashedPassword;
        await adminUser.save();
        console.log('✅ Admin password updated to "admin123"');
      }
      
      // Also check if the email is correct
      if (adminUser.email !== 'admin@nu3pbnb.com') {
        console.log(`\n⚠️ Admin email is "${adminUser.email}", not "admin@nu3pbnb.com"`);
        console.log('🔄 Updating admin email...');
        adminUser.email = 'admin@nu3pbnb.com';
        await adminUser.save();
        console.log('✅ Admin email updated to "admin@nu3pbnb.com"');
      }
      
    } else {
      console.log('\n❌ No admin user found! Creating one...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = new User({
        email: 'admin@nu3pbnb.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        isVerified: true
      });
      await newAdmin.save();
      console.log('✅ Admin user created with email: admin@nu3pbnb.com, password: admin123');
    }
    
    // Test login
    console.log('\n🧪 Testing login...');
    const testUser = await User.findOne({ email: 'admin@nu3pbnb.com' });
    if (testUser) {
      const testPassword = await bcrypt.compare('admin123', testUser.password);
      console.log(`   Login test: ${testPassword ? '✅ SUCCESS' : '❌ FAILED'}`);
    } else {
      console.log('   ❌ Test user not found');
    }
    
    console.log('\n🎉 Production admin check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the check
checkProductionAdmin().catch(console.error); 