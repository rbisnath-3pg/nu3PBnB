console.log('Loaded routes/auth.js');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Use a default JWT secret if not provided in environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'guest' } = req.body;
    const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase() : email;
    
    // Validate input
    if (!normalizedEmail || !password) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: req.t('errors.validation') 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        message: 'Please provide a valid email address' 
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password too short',
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Validate role
    if (!['guest', 'host', 'admin'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        message: 'Role must be guest, host, or admin' 
      });
    }
    
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ 
        error: 'User already exists',
        message: req.t('errors.user_exists') 
      });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ 
      name: name || normalizedEmail.split('@')[0], 
      email: normalizedEmail, 
      password: hashed, 
      role 
    });
    
    await user.save();
    
    // Create token and return user data
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    res.status(201).json({ 
      message: req.t('success.user_created'),
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        themePreference: user.themePreference
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: req.t('errors.server') });
  }
});

// Admin-only user creation endpoint
router.post('/admin/create-user', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, role = 'guest' } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    
    // Validate role
    if (!['guest', 'host', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hashed, 
      role 
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Admin user creation error:', err);
    res.status(500).json({ message: 'User creation failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase() : email;
    console.log('[LOGIN] Attempt with email:', normalizedEmail);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('[LOGIN] No user found for email:', normalizedEmail);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password match for', normalizedEmail, ':', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ 
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        themePreference: user.themePreference
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user (protected route)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        themePreference: user.themePreference
      }
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout (client should just delete token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Refresh token
router.post('/refresh', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Generate new token with different expiration
    const newToken = jwt.sign(
      { id: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '2d' } // Different expiration time
    );
    
    res.json({ 
      token: newToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Password reset request
router.post('/reset-password', async (req, res) => {
  try {
    let { email } = req.body;
    const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase() : email;
    if (!normalizedEmail) {
      return res.status(400).json({ 
        error: 'Missing email',
        message: 'Email is required' 
      });
    }
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'No user found with this email' 
      });
    }
    
    // In a real app, you would send an email with a reset link
    // For now, we'll just return a success message
    res.json({ 
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Failed to process password reset' });
  }
});

router.post('/test-login', (req, res) => {
  console.log('[TEST-LOGIN] Handler reached');
  res.json({ message: 'Test login route works' });
});

// Update theme preference
router.post('/theme', auth, async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme. Must be "light" or "dark"' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { themePreference: theme },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Theme preference updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        themePreference: user.themePreference
      }
    });
  } catch (err) {
    console.error('Theme update error:', err);
    res.status(500).json({ message: 'Failed to update theme preference' });
  }
});

module.exports = router; 