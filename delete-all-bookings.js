require('dotenv').config();
const mongoose = require('mongoose');

const BookingRequest = require('./models/BookingRequest');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nu3pbnb';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB:', uri);

  const result = await BookingRequest.deleteMany({});
  console.log(`🗑️ Deleted ${result.deletedCount} bookings from the database.`);

  await mongoose.disconnect();
  console.log('✅ Database cleanup complete.');
}

main().catch(err => {
  console.error('❌ Error cleaning up bookings:', err);
  process.exit(1);
}); 