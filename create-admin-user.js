const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nu3pbnb');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@nu3pbnb.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      console.log(`Password: password123`);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@nu3pbnb.com',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('\n=== ADMIN LOGIN CREDENTIALS ===');
    console.log('Email: admin@nu3pbnb.com');
    console.log('Password: password123');
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser(); 