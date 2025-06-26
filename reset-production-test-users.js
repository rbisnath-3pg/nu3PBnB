#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = 'mongodb+srv://rbisnath:JtKCLUJH2cL4MQpq@cluster0.psisy90.mongodb.net/nu3pbnb?retryWrites=true&w=majority&appName=Cluster0';

const newTestUsers = [
  { email: 'admin_robbie@google.com', password: 'admin123', name: 'Robbie Admin', role: 'admin' },
  { email: 'host_jane@google.com', password: 'host123', name: 'Jane Host', role: 'host' },
  { email: 'host_mike@google.com', password: 'host123', name: 'Mike Host', role: 'host' },
  { email: 'guest_john@google.com', password: 'guest123', name: 'John Guest', role: 'guest' },
  { email: 'guest_emma@google.com', password: 'guest123', name: 'Emma Guest', role: 'guest' }
];

const oldTestUserEmails = [
  'admin@nu3pbnb.com',
  'davonte_runolfsdottir-russel@hotmail.com',
  'georgette_klocko@hotmail.com',
  'josh15@hotmail.com',
  'patience_kutch78@hotmail.com',
  'rubie.maggio38@gmail.com',
  // Any user with email starting with admin_, host_, guest_
];

async function resetTestUsers() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to production DB.');

  // Delete old test users by exact email
  for (const email of oldTestUserEmails) {
    const res = await User.deleteMany({ email });
    if (res.deletedCount > 0) console.log(`Deleted old test user: ${email}`);
  }
  // Delete any user with email starting with admin_, host_, or guest_
  const res2 = await User.deleteMany({ email: { $regex: '^(admin_|host_|guest_)', $options: 'i' } });
  if (res2.deletedCount > 0) console.log(`Deleted ${res2.deletedCount} users with admin_/host_/guest_ prefix`);

  // Create new test users
  for (const { email, password, name, role } of newTestUsers) {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashed,
      name,
      role,
      isVerified: true
    });
    await user.save();
    console.log(`Created user: ${email} (${role}) / password: ${password}`);
  }

  // Print summary
  const adminCount = await User.countDocuments({ role: 'admin' });
  const hostCount = await User.countDocuments({ role: 'host' });
  const guestCount = await User.countDocuments({ role: 'guest' });
  console.log(`\nSummary: Admins: ${adminCount}, Hosts: ${hostCount}, Guests: ${guestCount}`);

  await mongoose.disconnect();
  console.log('Disconnected. All done!');
}

resetTestUsers().catch(console.error); 