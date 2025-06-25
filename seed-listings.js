const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://rbisnath:JtKCLUJH2cL4MQpq@cluster0.psisy90.mongodb.net/nu3pbnb?retryWrites=true&w=majority&appName=Cluster0";

const sampleListings = [
  {
    title: "Cozy Downtown Apartment",
    description: "A beautiful and cozy apartment in the heart of downtown.",
    price: 120,
    location: { type: "Point", coordinates: [-79.3832, 43.6532] }, // Toronto
    hostId: "host1",
    status: "active"
  },
  {
    title: "Beachside Bungalow",
    description: "Enjoy the ocean breeze in this lovely bungalow by the beach.",
    price: 200,
    location: { type: "Point", coordinates: [-123.1216, 49.2827] }, // Vancouver
    hostId: "host2",
    status: "active"
  },
  {
    title: "Mountain Cabin Retreat",
    description: "A peaceful cabin retreat in the mountains.",
    price: 150,
    location: { type: "Point", coordinates: [-115.5708, 51.1784] }, // Banff
    hostId: "host3",
    status: "active"
  }
];

async function seed() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db("nu3pbnb");
    const listings = db.collection("listings");
    await listings.deleteMany({}); // Clear existing data
    const result = await listings.insertMany(sampleListings);
    console.log(`Inserted ${result.insertedCount} listings!`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.close();
  }
}

seed(); 