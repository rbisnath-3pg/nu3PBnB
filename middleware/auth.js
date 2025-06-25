const jwt = require('jsonwebtoken');

// Use the same JWT secret as auth routes
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Environment-based logging control
const isDevelopment = process.env.NODE_ENV === 'development';

function auth(req, res, next) {
  if (isDevelopment) {
    console.log('auth middleware hit');
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Ensure req.user._id is always set
    if (decoded.id && !decoded._id) {
      decoded._id = decoded.id;
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (isDevelopment) {
      console.log('requireRole middleware hit, required:', role, 'user:', req.user);
    }
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = { auth, requireRole }; 