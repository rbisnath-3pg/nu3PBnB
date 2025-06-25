# Database Initialization Script

This script automatically sets up the database with initial data when the nu3PBnB application is run for the first time.

## Features

- **Automatic Initialization**: Runs automatically when the app starts for the first time
- **Smart Detection**: Only initializes if the database hasn't been set up before
- **Comprehensive Setup**: Creates indexes, seed data, and content translations
- **Reset Capability**: Can force re-initialization with the `--reset` flag

## What Gets Created

### 1. Database Indexes
- User indexes (email, role, createdAt)
- Listing indexes (host, location, price, featured, status, text search)
- Content indexes (key, language)
- And more for optimal performance

### 2. Seed Data
- **Admin User**: `admin@nu3pbnb.com` / `password123`
- **Sample Host Users**: 3 host accounts with sample data
- **Sample Listings**: 5 properties with realistic data
- **Content Translations**: English translations for UI elements

### 3. Sample Users

#### Admin User
- Email: `admin@nu3pbnb.com`
- Password: `password123`
- Role: `admin`

#### Host Users
- `john@example.com` / `password123`
- `sarah@example.com` / `password123`
- `mike@example.com` / `password123`

## Usage

### Automatic (Recommended)
The script runs automatically when you start the application:

```bash
npm start
```

### Manual Initialization
To manually initialize the database:

```bash
npm run init-db
```

### Force Reset
To clear all data and re-initialize:

```bash
npm run reset-db
```

Or directly:

```bash
node scripts/init-database.js --reset
```

## Environment Variables

The script uses the same MongoDB connection string as the main application:

- `MONGODB_URI`: MongoDB connection string (defaults to `mongodb://localhost:27017/nu3pbnb`)

## Safety Features

- **Idempotent**: Safe to run multiple times
- **Non-destructive**: Won't overwrite existing data unless `--reset` is used
- **Error Handling**: Graceful error handling and logging
- **Collection Safety**: Only clears application collections, not system collections

## Logging

The script provides detailed console output with emojis for easy reading:

- 🔧 Initializing database...
- 📊 Creating database indexes...
- 🌱 Creating seed data...
- 👤 Admin user created
- 👥 Sample host users created
- 🏠 Sample listings created
- 📝 Content translations created
- ✅ Database initialization completed successfully!

## Troubleshooting

### Database Already Initialized
If you see "Database already initialized, skipping...", the database has already been set up. Use `--reset` to force re-initialization.

### Connection Issues
Make sure MongoDB is running and the connection string is correct.

### Permission Issues
Ensure the MongoDB user has write permissions to create collections and indexes.

## Development

To modify the seed data, edit the functions in `scripts/init-database.js`:

- `createAdminUser()`: Admin user creation
- `createSampleHosts()`: Host user creation
- `createSampleListings()`: Property listings
- `createContentTranslations()`: UI translations

## Integration

The script is automatically imported and called in `index.js` after MongoDB connection is established:

```javascript
const { initializeDatabase } = require('./scripts/init-database');

// In MongoDB connection callback
await initializeDatabase();
``` 