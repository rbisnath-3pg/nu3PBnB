#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

console.log('🔍 Checking Nu3PBnB Database and Users...');
console.log('='.repeat(60));

async function checkAndReseed() {
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully');

    // Check if admin user exists
    console.log('\n👤 Checking admin user...');
    const adminUser = await User.findOne({ email: 'admin@nu3pbnb.com' });
    
    if (adminUser) {
      console.log('✅ Admin user exists');
      console.log(`   ID: ${adminUser._id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Created: ${adminUser.createdAt}`);
      
      // Test password
      const isValidPassword = await bcrypt.compare('admin123', adminUser.password);
      console.log(`   Password valid: ${isValidPassword ? '✅' : '❌'}`);
      
      if (!isValidPassword) {
        console.log('🔄 Updating admin password...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        adminUser.password = hashedPassword;
        await adminUser.save();
        console.log('✅ Admin password updated');
      }
    } else {
      console.log('❌ Admin user not found, creating...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = new User({
        email: 'admin@nu3pbnb.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        isVerified: true
      });
      await newAdmin.save();
      console.log('✅ Admin user created');
    }

    // Check host users
    console.log('\n🏠 Checking host users...');
    const hostUsers = [
      'davonte_runolfsdottir-russel@hotmail.com',
      'georgette_klocko@hotmail.com',
      'josh15@hotmail.com'
    ];

    for (const email of hostUsers) {
      const hostUser = await User.findOne({ email: email.toLowerCase() });
      if (hostUser) {
        console.log(`✅ Host user exists: ${email}`);
        const isValidPassword = await bcrypt.compare('host123', hostUser.password);
        console.log(`   Password valid: ${isValidPassword ? '✅' : '❌'}`);
        if (!isValidPassword) {
          console.log(`🔄 Updating password for ${email}...`);
          const hashedPassword = await bcrypt.hash('host123', 10);
          hostUser.password = hashedPassword;
          await hostUser.save();
          console.log(`✅ Password updated for ${email}`);
        }
      } else {
        console.log(`❌ Host user not found: ${email}, creating...`);
        const hashedPassword = await bcrypt.hash('host123', 10);
        const newHost = new User({
          email: email.toLowerCase(),
          password: hashedPassword,
          name: email.split('@')[0].replace(/_/g, ' '),
          role: 'host',
          isVerified: true
        });
        await newHost.save();
        console.log(`✅ Host user created: ${email}`);
      }
    }

    // Check guest users
    console.log('\n👤 Checking guest users...');
    const guestUsers = [
      'patience_kutch78@hotmail.com',
      'rubie.maggio38@gmail.com'
    ];

    for (const email of guestUsers) {
      const guestUser = await User.findOne({ email: email.toLowerCase() });
      if (guestUser) {
        console.log(`✅ Guest user exists: ${email}`);
        const isValidPassword = await bcrypt.compare('guest123', guestUser.password);
        console.log(`   Password valid: ${isValidPassword ? '✅' : '❌'}`);
        if (!isValidPassword) {
          console.log(`🔄 Updating password for ${email}...`);
          const hashedPassword = await bcrypt.hash('guest123', 10);
          guestUser.password = hashedPassword;
          await guestUser.save();
          console.log(`✅ Password updated for ${email}`);
        }
      } else {
        console.log(`❌ Guest user not found: ${email}, creating...`);
        const hashedPassword = await bcrypt.hash('guest123', 10);
        const newGuest = new User({
          email: email.toLowerCase(),
          password: hashedPassword,
          name: email.split('@')[0].replace(/_/g, ' '),
          role: 'guest',
          isVerified: true
        });
        await newGuest.save();
        console.log(`✅ Guest user created: ${email}`);
      }
    }

    // Summary
    console.log('\n📊 Database Summary:');
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const hostCount = await User.countDocuments({ role: 'host' });
    const guestCount = await User.countDocuments({ role: 'guest' });
    
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Hosts: ${hostCount}`);
    console.log(`   Guests: ${guestCount}`);

    console.log('\n🎉 Database check and reseed completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test login: npm run deploy:check');
    console.log('2. Run startup tests: npm run test:startup');
    console.log('3. Visit frontend: https://nu3pbnb.onrender.com');

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the check and reseed
checkAndReseed().catch(console.error); 