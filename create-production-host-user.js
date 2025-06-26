const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nu3pbnb';

async function createHostUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to production database');

    const email = 'testhost@example.com';
    const password = 'password123';
    const name = 'Test Host';
    const role = 'host';

    let user = await User.findOne({ email });
    if (user) {
      console.log(`User already exists: ${email}`);
      // Optionally reset password
      user.password = await bcrypt.hash(password, 10);
      user.name = name;
      user.role = role;
      await user.save();
      console.log(`✅ Password reset and user updated for ${email}`);
    } else {
      const hashed = await bcrypt.hash(password, 10);
      user = new User({ name, email, password: hashed, role });
      await user.save();
      console.log(`✅ Created new host user: ${email}`);
    }
  } catch (err) {
    console.error('Error creating host user:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from production database');
  }
}

createHostUser(); 