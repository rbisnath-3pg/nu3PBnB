const mongoose = require('mongoose');
const Content = require('./models/Content');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/nu3pbnb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const initialContent = [
  // Hero Section Content
  {
    key: 'hero_title',
    title: 'Hero Section Title',
    content: '<h1>Find Your Perfect Stay</h1>',
    type: 'html',
    section: 'hero',
    language: 'en',
    isActive: true
  },
  {
    key: 'hero_subtitle',
    title: 'Hero Section Subtitle',
    content: '<p>Discover unique accommodations around the world</p>',
    type: 'html',
    section: 'hero',
    language: 'en',
    isActive: true
  },
  {
    key: 'hero_title',
    title: 'Hero Section Title',
    content: '<h1>Trouvez Votre Séjour Parfait</h1>',
    type: 'html',
    section: 'hero',
    language: 'fr',
    isActive: true
  },
  {
    key: 'hero_subtitle',
    title: 'Hero Section Subtitle',
    content: '<p>Découvrez des hébergements uniques autour du monde</p>',
    type: 'html',
    section: 'hero',
    language: 'fr',
    isActive: true
  },
  {
    key: 'hero_title',
    title: 'Hero Section Title',
    content: '<h1>Encuentra Tu Estancia Perfecta</h1>',
    type: 'html',
    section: 'hero',
    language: 'es',
    isActive: true
  },
  {
    key: 'hero_subtitle',
    title: 'Hero Section Subtitle',
    content: '<p>Descubre alojamientos únicos alrededor del mundo</p>',
    type: 'html',
    section: 'hero',
    language: 'es',
    isActive: true
  },

  // About Section Content
  {
    key: 'about_title',
    title: 'About Section Title',
    content: '<h2>About nu3PBnB</h2>',
    type: 'html',
    section: 'about',
    language: 'en',
    isActive: true
  },
  {
    key: 'about_description',
    title: 'About Section Description',
    content: '<p>We connect travelers with unique accommodations and experiences around the world. Our platform makes it easy to find the perfect place to stay, whether you\'re looking for a cozy apartment, a luxury villa, or an unforgettable experience.</p>',
    type: 'html',
    section: 'about',
    language: 'en',
    isActive: true
  },
  {
    key: 'about_title',
    title: 'About Section Title',
    content: '<h2>À Propos de nu3PBnB</h2>',
    type: 'html',
    section: 'about',
    language: 'fr',
    isActive: true
  },
  {
    key: 'about_description',
    title: 'About Section Description',
    content: '<p>Nous connectons les voyageurs avec des hébergements et des expériences uniques autour du monde. Notre plateforme facilite la recherche du lieu de séjour parfait, que vous cherchiez un appartement confortable, une villa de luxe ou une expérience inoubliable.</p>',
    type: 'html',
    section: 'about',
    language: 'fr',
    isActive: true
  },
  {
    key: 'about_title',
    title: 'About Section Title',
    content: '<h2>Sobre nu3PBnB</h2>',
    type: 'html',
    section: 'about',
    language: 'es',
    isActive: true
  },
  {
    key: 'about_description',
    title: 'About Section Description',
    content: '<p>Conectamos viajeros con alojamientos y experiencias únicas alrededor del mundo. Nuestra plataforma facilita encontrar el lugar perfecto para quedarse, ya sea que busques un apartamento acogedor, una villa de lujo o una experiencia inolvidable.</p>',
    type: 'html',
    section: 'about',
    language: 'es',
    isActive: true
  },

  // Footer Content
  {
    key: 'footer_description',
    title: 'Footer Description',
    content: 'Find your perfect stay with our unique accommodations.',
    type: 'text',
    section: 'footer',
    language: 'en',
    isActive: true
  },
  {
    key: 'footer_description',
    title: 'Footer Description',
    content: 'Trouvez votre séjour parfait avec nos hébergements uniques.',
    type: 'text',
    section: 'footer',
    language: 'fr',
    isActive: true
  },
  {
    key: 'footer_description',
    title: 'Footer Description',
    content: 'Encuentra tu estancia perfecta con nuestros alojamientos únicos.',
    type: 'text',
    section: 'footer',
    language: 'es',
    isActive: true
  },

  // Legal Content
  {
    key: 'privacy_policy',
    title: 'Privacy Policy',
    content: `<h1>Privacy Policy</h1>
<p>Last updated: January 2024</p>
<p>This Privacy Policy describes how nu3PBnB collects, uses, and shares your personal information when you use our platform.</p>
<h2>Information We Collect</h2>
<ul>
<li>Account information (name, email, phone number)</li>
<li>Payment information (processed securely through third-party providers)</li>
<li>Booking and travel preferences</li>
<li>Communication with hosts and guests</li>
<li>Device and usage information</li>
</ul>`,
    type: 'html',
    section: 'legal',
    language: 'en',
    isActive: true
  },
  {
    key: 'terms_of_service',
    title: 'Terms of Service',
    content: `<h1>Terms of Service</h1>
<p>Last updated: January 2024</p>
<p>By using nu3PBnB, you agree to these terms and conditions governing your use of our platform.</p>
<h2>User Responsibilities</h2>
<ul>
<li>Provide accurate and truthful information</li>
<li>Respect property rules and local laws</li>
<li>Maintain appropriate behavior and communication</li>
<li>Pay all fees and charges promptly</li>
<li>Report any issues or concerns immediately</li>
</ul>`,
    type: 'html',
    section: 'legal',
    language: 'en',
    isActive: true
  },

  // Help Content
  {
    key: 'help_center_intro',
    title: 'Help Center Introduction',
    content: `<h1>Help Center</h1>
<p>Welcome to the nu3PBnB Help Center. We're here to help you with any questions or concerns you may have about using our platform.</p>
<h2>Getting Started</h2>
<ul>
<li>How to create an account</li>
<li>Booking your first stay</li>
<li>Understanding cancellation policies</li>
<li>Payment methods and security</li>
</ul>`,
    type: 'html',
    section: 'help',
    language: 'en',
    isActive: true
  },

  // Homepage Content
  {
    key: 'homepage_welcome',
    title: 'Homepage Welcome Message',
    content: `<h2>Welcome to nu3PBnB</h2>
<p>Your journey to amazing stays starts here. Discover unique accommodations and unforgettable experiences around the world.</p>`,
    type: 'html',
    section: 'homepage',
    language: 'en',
    isActive: true
  },
  {
    key: 'homepage_welcome',
    title: 'Homepage Welcome Message',
    content: `<h2>Bienvenue sur nu3PBnB</h2>
<p>Votre voyage vers des séjours incroyables commence ici. Découvrez des hébergements uniques et des expériences inoubliables autour du monde.</p>`,
    type: 'html',
    section: 'homepage',
    language: 'fr',
    isActive: true
  },
  {
    key: 'homepage_welcome',
    title: 'Homepage Welcome Message',
    content: `<h2>Bienvenido a nu3PBnB</h2>
<p>Tu viaje hacia estancias increíbles comienza aquí. Descubre alojamientos únicos y experiencias inolvidables alrededor del mundo.</p>`,
    type: 'html',
    section: 'homepage',
    language: 'es',
    isActive: true
  }
];

async function seedContent() {
  try {
    console.log('Starting content seeding...');
    
    // Clear existing content
    await Content.deleteMany({});
    console.log('Cleared existing content');
    
    // Insert new content
    const result = await Content.insertMany(initialContent);
    console.log(`Successfully seeded ${result.length} content items`);
    
    // Display summary
    const summary = await Content.aggregate([
      {
        $group: {
          _id: { section: '$section', language: '$language' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.section': 1, '_id.language': 1 }
      }
    ]);
    
    console.log('\nContent Summary:');
    summary.forEach(item => {
      console.log(`${item._id.section} (${item._id.language}): ${item.count} items`);
    });
    
    console.log('\nContent seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding content:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedContent(); 