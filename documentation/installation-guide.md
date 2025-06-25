# nu3PBnB - Installation Guide

## 📋 Prerequisites

Before installing nu3PBnB, ensure you have the following software installed on your system:

### Required Software
- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **MongoDB** (v5.0 or higher)
- **Git** (v2.30 or higher)

### Optional Software
- **Docker** (v20.0 or higher) - for containerized deployment
- **Redis** (v6.0 or higher) - for caching and sessions
- **PM2** (v5.0 or higher) - for process management

## 🔧 System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB available space
- **Network**: Stable internet connection

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Network**: High-speed internet connection

## 📥 Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/nu3PBnB.git

# Navigate to the project directory
cd nu3PBnB
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/nu3pbnb

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# File Upload Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Logging Configuration
LOG_LEVEL=info
```

### Step 4: Database Setup

#### Option A: Local MongoDB Installation

1. **Install MongoDB** (if not already installed):

   **macOS (using Homebrew):**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

   **Ubuntu/Debian:**
   ```bash
   sudo apt update
   sudo apt install mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

   **Windows:**
   Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

2. **Create Database:**
   ```bash
   # Connect to MongoDB
   mongosh
   
   # Create and use the database
   use nu3pbnb
   
   # Exit MongoDB shell
   exit
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### Step 5: Seed the Database (Optional)

```bash
# Run database seeding
npm run seed

# Or run specific seed files
npm run seed:content
npm run seed:multilingual
npm run seed:wishlist
```

### Step 6: Start the Application

#### Development Mode

```bash
# Start the backend server
npm run dev

# In a new terminal, start the frontend
cd frontend
npm run dev
```

#### Production Mode

```bash
# Build the frontend
cd frontend
npm run build
cd ..

# Start the production server
npm start
```

## 🐳 Docker Installation (Alternative)

### Using Docker Compose

1. **Create docker-compose.yml:**

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/nu3pbnb
    depends_on:
      - mongo
      - redis
    volumes:
      - ./logs:/app/logs

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:6.0-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

2. **Build and run:**
```bash
docker-compose up -d
```

## 🔍 Verification

### Check if the application is running:

1. **Backend API:** http://localhost:3000
   - Should display: "nu3PBnB API is running"

2. **Frontend:** http://localhost:5173
   - Should display the nu3PBnB application

3. **API Health Check:** http://localhost:3000/api/health
   - Should return status information

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- --testPathPattern=bookings
npm test -- --testPathPattern=payments
```

## 🚀 Production Deployment

### Using PM2 (Recommended)

1. **Install PM2 globally:**
```bash
npm install -g pm2
```

2. **Create ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'nu3pbnb',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

3. **Start the application:**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Using Systemd (Linux)

1. **Create service file:**
```bash
sudo nano /etc/systemd/system/nu3pbnb.service
```

2. **Add service configuration:**
```ini
[Unit]
Description=nu3PBnB Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/nu3pbnb
ExecStart=/usr/bin/node index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

3. **Enable and start the service:**
```bash
sudo systemctl enable nu3pbnb
sudo systemctl start nu3pbnb
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Application environment | `development` | Yes |
| `PORT` | Server port | `3000` | Yes |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` | No |
| `EMAIL_SERVICE` | Email service provider | - | No |
| `EMAIL_USER` | Email username | - | No |
| `EMAIL_PASS` | Email password | - | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | - | No |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | - | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - | No |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - | No |
| `REDIS_URL` | Redis connection URL | - | No |
| `LOG_LEVEL` | Logging level | `info` | No |

### Database Configuration

The application supports MongoDB with the following features:
- Connection pooling
- Automatic reconnection
- Index optimization
- Data validation

### Security Configuration

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation and sanitization

## 🛠️ Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **MongoDB connection failed:**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongodb
   
   # Start MongoDB if not running
   sudo systemctl start mongodb
   ```

3. **Permission denied:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /path/to/nu3pbnb
   chmod +x /path/to/nu3pbnb
   ```

4. **Node modules issues:**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs

Check application logs:
```bash
# Application logs
tail -f logs/combined.log

# Error logs
tail -f logs/error.log

# PM2 logs (if using PM2)
pm2 logs nu3pbnb
```

### Performance Monitoring

```bash
# Monitor system resources
htop

# Monitor Node.js process
node --inspect index.js

# Monitor database performance
mongosh --eval "db.stats()"
```

## 📞 Support

If you encounter issues during installation:

1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review the [Development Guide](./development-guide.md)
3. Check the application logs
4. Create an issue on the project repository

---

*Last Updated: June 2025*
*Version: 1.0* 