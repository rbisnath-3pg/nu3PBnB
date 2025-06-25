require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Listing = require('./models/Listing');
const BookingRequest = require('./models/BookingRequest');
const Review = require('./models/Review');
const Message = require('./models/Message');
const Feedback = require('./models/Feedback');
const { faker } = require('@faker-js/faker');

// Multilingual data
const multilingualData = {
  en: {
    propertyTypes: ['Apartment', 'House', 'Villa', 'Cottage', 'Loft', 'Studio', 'Bungalow', 'Cabin', 'Penthouse', 'Townhouse'],
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Pool', 'Air Conditioning', 'Pet Friendly', 'Washer', 'Dryer', 'Heating', 'TV', 'Gym', 'Balcony'],
    cities: [
      { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
      { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
      { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
      { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
      { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
      { city: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298 },
      { city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918 },
      { city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207 },
      { city: 'Montreal', country: 'Canada', lat: 45.5017, lng: -73.5673 },
      { city: 'Seattle', country: 'USA', lat: 47.6062, lng: -122.3321 }
    ]
  },
  fr: {
    propertyTypes: ['Appartement', 'Maison', 'Villa', 'Cottage', 'Loft', 'Studio', 'Bungalow', 'Chalet', 'Penthouse', 'Maison de ville'],
    amenities: ['WiFi', 'Cuisine', 'Parking', 'Piscine', 'Climatisation', 'Animaux acceptés', 'Machine à laver', 'Sèche-linge', 'Chauffage', 'TV', 'Salle de sport', 'Balcon'],
    cities: [
      { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
      { city: 'Lyon', country: 'France', lat: 45.7578, lng: 4.8320 },
      { city: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698 },
      { city: 'Toulouse', country: 'France', lat: 43.6047, lng: 1.4442 },
      { city: 'Nice', country: 'France', lat: 43.7102, lng: 7.2620 },
      { city: 'Bordeaux', country: 'France', lat: 44.8378, lng: -0.5792 },
      { city: 'Nantes', country: 'France', lat: 47.2184, lng: -1.5536 },
      { city: 'Strasbourg', country: 'France', lat: 48.5734, lng: 7.7521 },
      { city: 'Montpellier', country: 'France', lat: 43.6108, lng: 3.8767 },
      { city: 'Lille', country: 'France', lat: 50.6292, lng: 3.0573 }
    ]
  },
  es: {
    propertyTypes: ['Apartamento', 'Casa', 'Villa', 'Cabaña', 'Loft', 'Estudio', 'Bungalow', 'Casa de campo', 'Penthouse', 'Casa adosada'],
    amenities: ['WiFi', 'Cocina', 'Estacionamiento', 'Piscina', 'Aire acondicionado', 'Mascotas permitidas', 'Lavadora', 'Secadora', 'Calefacción', 'TV', 'Gimnasio', 'Balcón'],
    cities: [
      { city: 'Madrid', country: 'España', lat: 40.4168, lng: -3.7038 },
      { city: 'Barcelona', country: 'España', lat: 41.3851, lng: 2.1734 },
      { city: 'Valencia', country: 'España', lat: 39.4699, lng: -0.3763 },
      { city: 'Sevilla', country: 'España', lat: 37.3891, lng: -5.9845 },
      { city: 'Zaragoza', country: 'España', lat: 41.6488, lng: -0.8891 },
      { city: 'Málaga', country: 'España', lat: 36.7213, lng: -4.4217 },
      { city: 'Bilbao', country: 'España', lat: 43.2627, lng: -2.9253 },
      { city: 'Granada', country: 'España', lat: 37.1765, lng: -3.5976 },
      { city: 'Alicante', country: 'España', lat: 38.3452, lng: -0.4815 },
      { city: 'Córdoba', country: 'España', lat: 37.8882, lng: -4.7794 }
    ]
  }
};

// Guaranteed working Unsplash image URLs
const guaranteedImages = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519974719765-e6559eac2575?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1460474647541-4edd0cd0c746?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600566753376-12c8ab8c8a2f?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1460474647541-4edd0cd0c746?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519974719765-e6559eac2575?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop'
];

// Multilingual descriptions
const descriptions = {
  en: [
    "Beautiful and modern accommodation in the heart of the city. Perfect for both business and leisure travelers.",
    "Cozy and comfortable space with all the amenities you need for a perfect stay.",
    "Luxurious property with stunning views and premium facilities for an unforgettable experience.",
    "Charming and well-maintained accommodation in a quiet neighborhood, close to all attractions.",
    "Contemporary design with high-end finishes and excellent location for exploring the city.",
    "Spacious and bright accommodation with modern amenities and convenient access to public transport.",
    "Elegant property featuring beautiful architecture and a peaceful atmosphere for relaxation.",
    "Well-equipped accommodation with everything you need for a comfortable and enjoyable stay.",
    "Stylish and modern space with excellent facilities and a prime location in the city center.",
    "Comfortable and clean accommodation with great amenities and easy access to local attractions."
  ],
  fr: [
    "Hébergement beau et moderne au cœur de la ville. Parfait pour les voyageurs d'affaires et de loisirs.",
    "Espace confortable et chaleureux avec tous les équipements nécessaires pour un séjour parfait.",
    "Propriété luxueuse avec des vues magnifiques et des installations premium pour une expérience inoubliable.",
    "Hébergement charmant et bien entretenu dans un quartier calme, près de toutes les attractions.",
    "Design contemporain avec des finitions haut de gamme et un excellent emplacement pour explorer la ville.",
    "Hébergement spacieux et lumineux avec des équipements modernes et un accès pratique aux transports publics.",
    "Propriété élégante avec une belle architecture et une atmosphère paisible pour la détente.",
    "Hébergement bien équipé avec tout ce dont vous avez besoin pour un séjour confortable et agréable.",
    "Espace élégant et moderne avec d'excellentes installations et un emplacement privilégié au centre-ville.",
    "Hébergement confortable et propre avec de grands équipements et un accès facile aux attractions locales."
  ],
  es: [
    "Hermoso alojamiento moderno en el corazón de la ciudad. Perfecto para viajeros de negocios y ocio.",
    "Espacio acogedor y cómodo con todas las comodidades que necesitas para una estancia perfecta.",
    "Propiedad de lujo con vistas impresionantes e instalaciones premium para una experiencia inolvidable.",
    "Alojamiento encantador y bien mantenido en un barrio tranquilo, cerca de todas las atracciones.",
    "Diseño contemporáneo con acabados de alta gama y excelente ubicación para explorar la ciudad.",
    "Alojamiento espacioso y luminoso con comodidades modernas y acceso conveniente al transporte público.",
    "Propiedad elegante con hermosa arquitectura y ambiente tranquilo para la relajación.",
    "Alojamiento bien equipado con todo lo que necesitas para una estancia cómoda y agradable.",
    "Espacio elegante y moderno con excelentes instalaciones y ubicación privilegiada en el centro de la ciudad.",
    "Alojamiento cómodo y limpio con grandes comodidades y fácil acceso a las atracciones locales."
  ]
};

// Function to generate multiple random images for a listing
function generateListingImages() {
  const numImages = Math.floor(Math.random() * 4) + 3; // 3-6 images per listing
  const selectedImages = [];
  
  // Shuffle the array to get random images
  const shuffled = [...guaranteedImages].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < numImages && i < shuffled.length; i++) {
    selectedImages.push(shuffled[i]);
  }
  
  return selectedImages;
}

// Function to generate multilingual names
function generateMultilingualNames() {
  return {
    en: faker.person.fullName(),
    fr: faker.person.fullName(),
    es: faker.person.fullName()
  };
}

async function seedMultilingual() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await BookingRequest.deleteMany({});
    await Review.deleteMany({});
    await Message.deleteMany({});
    await Feedback.deleteMany({});
    console.log('Cleared existing data');

    // Create hosts for each language
    console.log('Creating multilingual hosts...');
    const hosts = [];
    const languages = ['en', 'fr', 'es'];
    
    for (const lang of languages) {
      for (let i = 0; i < 5; i++) {
        const names = generateMultilingualNames();
        const email = faker.internet.email();
        const hashedPassword = await bcrypt.hash('host123', 10);
        const host = new User({
          name: names[lang],
          email,
          password: hashedPassword,
          role: 'host',
          wishlist: [],
          onboarded: true,
          language: lang
        });
        await host.save();
        hosts.push(host);
        console.log(`Created ${lang} host ${i + 1}/5: ${names[lang]}`);
      }
    }

    // Create guests for each language
    console.log('Creating multilingual guests...');
    for (const lang of languages) {
      for (let i = 0; i < 10; i++) {
        const names = generateMultilingualNames();
        const email = faker.internet.email();
        const hashedPassword = await bcrypt.hash('guest123', 10);
        const guest = new User({
          name: names[lang],
          email,
          password: hashedPassword,
          role: 'guest',
          wishlist: [],
          onboarded: true,
          language: lang
        });
        await guest.save();
        console.log(`Created ${lang} guest ${i + 1}/10: ${names[lang]}`);
      }
    }

    // Create listings for each language
    console.log('Creating multilingual listings...');
    const listings = [];
    
    for (const lang of languages) {
      const langData = multilingualData[lang];
      const langHosts = hosts.filter(h => h.language === lang);
      
      for (let i = 0; i < 15; i++) {
        const cityObj = langData.cities[Math.floor(Math.random() * langData.cities.length)];
        const host = langHosts[Math.floor(Math.random() * langHosts.length)];
        const type = langData.propertyTypes[Math.floor(Math.random() * langData.propertyTypes.length)];
        const price = Math.floor(Math.random() * 400) + 50;
        const location = `${faker.location.streetAddress()}, ${cityObj.city}, ${cityObj.country}`;
        
        // Generate multiple guaranteed working images
        const photos = generateListingImages();
        
        // Calculate random coordinates within the city area
        const latitude = cityObj.lat + (Math.random() - 0.5) * 0.1;
        const longitude = cityObj.lng + (Math.random() - 0.5) * 0.1;
        
        // Get random description in the appropriate language
        const description = descriptions[lang][Math.floor(Math.random() * descriptions[lang].length)];
        
        const listing = new Listing({
          title: lang === 'fr' ? `${type} à ${cityObj.city}` : 
                 lang === 'es' ? `${type} en ${cityObj.city}` : 
                 `${type} in ${cityObj.city}`,
          description,
          host: host._id,
          location,
          city: cityObj.city,
          country: cityObj.country,
          price,
          type,
          photos,
          latitude,
          longitude,
          amenities: faker.helpers.arrayElements(langData.amenities, Math.floor(Math.random() * 5) + 3),
          maxGuests: Math.floor(Math.random() * 6) + 2,
          bedrooms: Math.floor(Math.random() * 4) + 1,
          bathrooms: Math.floor(Math.random() * 3) + 1,
          available: true,
          language: lang
        });
        await listing.save();
        listings.push(listing);
        console.log(`Created ${lang} listing ${i + 1}/15: ${type} in ${cityObj.city}`);
      }
    }

    console.log('Multilingual seed data created successfully!');
    console.log(`Created ${hosts.length} hosts, ${languages.length * 10} guests, and ${listings.length} listings across ${languages.length} languages`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedMultilingual(); 