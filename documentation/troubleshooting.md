# nu3PBnB - Troubleshooting Guide

## 📋 Common Issues and Solutions

This guide provides solutions for common problems encountered when using or developing the nu3PBnB application.

## 🚀 Installation Issues

### Node.js Version Problems

**Problem**: "Node.js version not supported" error

**Solution**:
```bash
# Check current Node.js version
node --version

# Install Node.js 18+ using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Or install directly from nodejs.org
```

### MongoDB Connection Issues

**Problem**: "MongoDB connection failed" error

**Solutions**:

1. **Check MongoDB service**:
```bash
# macOS
brew services list | grep mongodb
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl status mongodb
sudo systemctl start mongodb

# Windows
# Check Services app for MongoDB service
```

2. **Verify connection string**:
```bash
# Test connection
mongosh "mongodb://localhost:27017/nu3pbnb"
```

3. **Check firewall settings**:
```bash
# Allow MongoDB port
sudo ufw allow 27017
```

### Port Already in Use

**Problem**: "EADDRINUSE" error

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

## 🔧 Development Issues

### Module Not Found Errors

**Problem**: "Cannot find module" errors

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for missing dependencies
npm ls
```

### Frontend Build Failures

**Problem**: Vite build errors

**Solution**:
```bash
# Clear build cache
cd frontend
rm -rf dist node_modules/.vite

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

### Environment Variable Issues

**Problem**: Environment variables not loading

**Solution**:
```bash
# Check .env file exists
ls -la .env

# Verify variable names (no spaces around =)
NODE_ENV=development
PORT=3000

# Restart application after changes
npm run dev
```

## 🗄️ Database Issues

### Connection Timeout

**Problem**: Database connection timeout

**Solution**:
```javascript
// Update MongoDB connection options
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0
});
```

### Data Validation Errors

**Problem**: Mongoose validation errors

**Solution**:
```javascript
// Check model schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  }
});

// Add proper error handling
try {
  const user = new User(data);
  await user.save();
} catch (error) {
  console.error('Validation error:', error.message);
}
```

## 🔐 Authentication Issues

### JWT Token Problems

**Problem**: "Invalid token" errors

**Solutions**:

1. **Check JWT secret**:
```bash
# Verify JWT_SECRET in .env
echo $JWT_SECRET
```

2. **Token expiration**:
```javascript
// Check token expiration
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log('Token expires:', new Date(decoded.exp * 1000));
```

3. **Token format**:
```javascript
// Ensure proper Authorization header
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Password Hashing Issues

**Problem**: Password comparison failures

**Solution**:
```javascript
// Verify bcrypt usage
const bcrypt = require('bcryptjs');

// Hash password
const hashedPassword = await bcrypt.hash(password, 12);

// Compare password
const isValid = await bcrypt.compare(password, hashedPassword);
```

## 🧪 Testing Issues

### Test Database Problems

**Problem**: Tests affecting each other

**Solution**:
```javascript
// Use separate test database
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});
```

### Async Test Failures

**Problem**: Tests failing due to async operations

**Solution**:
```javascript
// Use proper async/await
it('should create user', async () => {
  const user = new User(userData);
  await user.save();
  expect(user.email).toBe(userData.email);
});

// Or use done callback
it('should create user', (done) => {
  const user = new User(userData);
  user.save()
    .then(() => {
      expect(user.email).toBe(userData.email);
      done();
    })
    .catch(done);
});
```

## 🌐 API Issues

### CORS Errors

**Problem**: Cross-origin request blocked

**Solution**:
```javascript
// Configure CORS properly
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Rate Limiting

**Problem**: "Too many requests" errors

**Solution**:
```javascript
// Implement rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 💳 Payment Issues

### Stripe Integration Problems

**Problem**: Payment processing failures

**Solutions**:

1. **Check API keys**:
```bash
# Verify Stripe keys in .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

2. **Test with Stripe CLI**:
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks

# Test payment
stripe payment_intents create --amount=1000 --currency=usd
```

3. **Webhook verification**:
```javascript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

## 📱 Frontend Issues

### React Component Errors

**Problem**: Component rendering issues

**Solutions**:

1. **Check prop types**:
```jsx
import PropTypes from 'prop-types';

Component.propTypes = {
  data: PropTypes.array.isRequired
};
```

2. **Handle loading states**:
```jsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
```

### State Management Issues

**Problem**: State not updating properly

**Solution**:
```jsx
// Use proper state updates
const [data, setData] = useState([]);

// Correct way
setData(prevData => [...prevData, newItem]);

// Use useEffect for side effects
useEffect(() => {
  fetchData();
}, [dependencies]);
```

## 🔍 Debugging Techniques

### Backend Debugging

1. **Enable debug logging**:
```javascript
const debug = require('debug')('app:auth');
debug('User login attempt:', { email });
```

2. **Use Node.js inspector**:
```bash
node --inspect index.js
# Open chrome://inspect in browser
```

3. **Add error tracking**:
```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

### Frontend Debugging

1. **React DevTools**:
- Install React Developer Tools browser extension
- Use Components and Profiler tabs

2. **Console logging**:
```javascript
console.log('Component state:', state);
console.log('Props:', props);
```

3. **Error boundaries**:
```jsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
}
```

## 📊 Performance Issues

### Slow Database Queries

**Problem**: Database queries taking too long

**Solutions**:

1. **Add indexes**:
```javascript
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
```

2. **Use lean queries**:
```javascript
const users = await User.find().lean();
```

3. **Implement pagination**:
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const users = await User.find()
  .skip(skip)
  .limit(limit);
```

### Memory Leaks

**Problem**: Application memory usage increasing

**Solutions**:

1. **Monitor memory usage**:
```bash
# Check Node.js memory usage
node --max-old-space-size=4096 index.js
```

2. **Use PM2 monitoring**:
```bash
pm2 monit
pm2 logs
```

3. **Implement proper cleanup**:
```javascript
useEffect(() => {
  const subscription = someService.subscribe();
  return () => subscription.unsubscribe();
}, []);
```

## 🚨 Emergency Procedures

### Database Recovery

**Problem**: Database corruption or data loss

**Solution**:
```bash
# Restore from backup
mongorestore --db nu3pbnb backup/

# Check database integrity
mongosh --eval "db.repairDatabase()"
```

### Application Rollback

**Problem**: New deployment causing issues

**Solution**:
```bash
# Rollback to previous version
git checkout HEAD~1
npm install
npm start

# Or use PM2
pm2 restart ecosystem.config.js --env production
```

## 📞 Getting Help

### Before Contacting Support

1. **Check logs**:
```bash
tail -f logs/error.log
tail -f logs/combined.log
```

2. **Reproduce the issue**:
- Document exact steps
- Note environment details
- Capture error messages

3. **Search existing issues**:
- Check GitHub issues
- Review documentation
- Search error messages

### Contact Information

- **Email**: support@nu3pbnb.com
- **GitHub Issues**: https://github.com/your-username/nu3PBnB/issues
- **Documentation**: https://docs.nu3pbnb.com

### Information to Provide

When reporting issues, include:
- Error messages and stack traces
- Steps to reproduce
- Environment details (OS, Node.js version, etc.)
- Relevant code snippets
- Screenshots (for UI issues)

---

*This troubleshooting guide is updated regularly. For the latest version, check our documentation.*

*Last Updated: June 2025*
*Version: 1.0* 