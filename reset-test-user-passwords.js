require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || process.argv[2];
console.log('Connecting to MongoDB URI:', MONGODB_URI);

const TEST_USERS = [
  { email: 'admin@nu3pbnb.com', password: 'admin123', role: 'admin' },
  { email: 'Raul50@gmail.com', password: 'host123', role: 'host' },
  { email: 'Ashtyn.Barrows99@gmail.com', password: 'host123', role: 'host' },
  { email: 'Evelyn_Feeney68@gmail.com', password: 'guest123', role: 'guest' },
  { email: 'Kristopher32@hotmail.com', password: 'guest123', role: 'guest' },
];

async function resetPasswords() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to production database');
    for (const user of TEST_USERS) {
      const found = await User.findOne({ email: user.email.toLowerCase() });
      if (!found) {
        console.log(`❌ User not found: ${user.email}`);
        continue;
      }
      const hashed = await bcrypt.hash(user.password, 10);
      found.password = hashed;
      await found.save();
      console.log(`✅ Password reset for ${user.email} (${user.role})`);
    }
  } catch (err) {
    console.error('Error resetting passwords:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from production database');
  }
}

resetPasswords(); 