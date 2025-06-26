#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

console.log('🌱 Seeding Production Database...');
console.log('='.repeat(60));

async function seedProductionDatabase() {
  try {
    // Use the same MONGODB_URI that the production API uses
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log('📡 Connecting to production database...');
    console.log('   Host:', MONGODB_URI.split('@')[1]?.split('/')[0] || 'unknown');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to production database');
    
    // Check current state
    const currentUsers = await User.countDocuments();
    const currentAdmins = await User.countDocuments({ role: 'admin' });
    const currentHosts = await User.countDocuments({ role: 'host' });
    const currentGuests = await User.countDocuments({ role: 'guest' });
    
    console.log('\n📊 Current Database State:');
    console.log(`   Total users: ${currentUsers}`);
    console.log(`   Admins: ${currentAdmins}`);
    console.log(`   Hosts: ${currentHosts}`);
    console.log(`   Guests: ${currentGuests}`);
    
    // Test users to create/update
    const testUsers = [
      {
        email: 'admin@nu3pbnb.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'davonte_runolfsdottir-russel@hotmail.com',
        password: 'host123',
        name: 'Davonte Runolfsdottir-Russel',
        role: 'host'
      },
      {
        email: 'georgette_klocko@hotmail.com',
        password: 'host123',
        name: 'Georgette Klocko',
        role: 'host'
      },
      {
        email: 'josh15@hotmail.com',
        password: 'host123',
        name: 'Josh',
        role: 'host'
      },
      {
        email: 'patience_kutch78@hotmail.com',
        password: 'guest123',
        name: 'Patience Kutch',
        role: 'guest'
      },
      {
        email: 'rubie.maggio38@gmail.com',
        password: 'guest123',
        name: 'Rubie Maggio',
        role: 'guest'
      }
    ];
    
    console.log('\n👥 Processing test users...');
    
    for (const userData of testUsers) {
      const normalizedEmail = userData.email.toLowerCase();
      
      // Check if user exists
      let user = await User.findOne({ email: normalizedEmail });
      
      if (user) {
        console.log(`   ✅ User exists: ${normalizedEmail}`);
        
        // Check if password is correct
        const isValidPassword = await bcrypt.compare(userData.password, user.password);
        if (!isValidPassword) {
          console.log(`   🔄 Updating password for: ${normalizedEmail}`);
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          user.password = hashedPassword;
          await user.save();
          console.log(`   ✅ Password updated for: ${normalizedEmail}`);
        } else {
          console.log(`   ✅ Password is correct for: ${normalizedEmail}`);
        }
      } else {
        console.log(`   ➕ Creating user: ${normalizedEmail}`);
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        user = new User({
          email: normalizedEmail,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          isVerified: true
        });
        await user.save();
        console.log(`   ✅ User created: ${normalizedEmail}`);
      }
    }
    
    // Final state
    const finalUsers = await User.countDocuments();
    const finalAdmins = await User.countDocuments({ role: 'admin' });
    const finalHosts = await User.countDocuments({ role: 'host' });
    const finalGuests = await User.countDocuments({ role: 'guest' });
    
    console.log('\n📊 Final Database State:');
    console.log(`   Total users: ${finalUsers}`);
    console.log(`   Admins: ${finalAdmins}`);
    console.log(`   Hosts: ${finalHosts}`);
    console.log(`   Guests: ${finalGuests}`);
    
    console.log('\n🎉 Production database seeding completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test login: npm run deploy:check');
    console.log('2. Visit frontend: https://nu3pbnb.onrender.com');
    console.log('3. Try logging in with admin@nu3pbnb.com / admin123');
    
  } catch (error) {
    console.error('❌ Production database seeding failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the seeding
seedProductionDatabase().catch(console.error); 