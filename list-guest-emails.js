const mongoose = require('mongoose');
const User = require('./models/User');

async function listGuestEmails() {
  await mongoose.connect(process.env.MONGODB_URI);
  const guests = await User.find({ role: 'guest', language: 'en' }, { email: 1, _id: 0 }).limit(5);
  console.log('Sample guest emails:');
  guests.forEach(g => console.log(g.email));
  await mongoose.disconnect();
}

listGuestEmails(); 