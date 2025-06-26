console.log('Loaded routes/auth.js');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Use a default JWT secret if not provided in environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Enhanced Authentication Logger
class AuthLogger {
  constructor() {
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };
    this.currentLevel = this.logLevels.INFO;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  generateSessionId() {
    return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  log(level, message, data = null, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      level,
      message,
      data,
      context: {
        ...context,
        sessionId: this.sessionId,
        component: 'Authentication',
        userAgent: context.userAgent || 'unknown',
        ip: context.ip || 'unknown',
        url: context.url || 'unknown'
      }
    };

    // Console output with appropriate styling
    const levelColors = {
      DEBUG: 'color: #6B7280; font-weight: bold;',
      INFO: 'color: #3B82F6; font-weight: bold;',
      WARN: 'color: #F59E0B; font-weight: bold;',
      ERROR: 'color: #EF4444; font-weight: bold;'
    };

    const levelIcons = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌'
    };

    const timeStr = new Date().toLocaleTimeString();
    
    console.groupCollapsed(
      `%c${levelIcons[level]} [${timeStr}] AUTH ${level} - ${message}`,
      levelColors[level]
    );
    
    if (data) {
      console.log('Data:', data);
    }
    
    if (Object.keys(context).length > 0) {
      console.log('Context:', context);
    }
    
    console.groupEnd();

    return logEntry;
  }

  debug(message, data = null, context = {}) {
    if (this.currentLevel <= this.logLevels.DEBUG) {
      return this.log('DEBUG', message, data, context);
    }
  }

  info(message, data = null, context = {}) {
    if (this.currentLevel <= this.logLevels.INFO) {
      return this.log('INFO', message, data, context);
    }
  }

  warn(message, data = null, context = {}) {
    if (this.currentLevel <= this.logLevels.WARN) {
      return this.log('WARN', message, data, context);
    }
  }

  error(message, error = null, context = {}) {
    if (this.currentLevel <= this.logLevels.ERROR) {
      const errorData = error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      } : null;
      return this.log('ERROR', message, errorData, context);
    }
  }

  setLogLevel(level) {
    this.currentLevel = this.logLevels[level] || this.logLevels.INFO;
    this.info(`Log level set to ${level}`);
  }

  // Authentication-specific logging methods
  logLoginAttempt(email, context = {}) {
    return this.info('Login attempt initiated', { 
      email: this.maskEmail(email),
      attemptTime: new Date().toISOString()
    }, context);
  }

  logLoginSuccess(user, context = {}) {
    return this.info('Login successful', {
      userId: user._id,
      email: this.maskEmail(user.email),
      role: user.role,
      loginTime: new Date().toISOString()
    }, context);
  }

  logLoginFailure(email, reason, context = {}) {
    return this.warn('Login failed', {
      email: this.maskEmail(email),
      reason,
      failureTime: new Date().toISOString()
    }, context);
  }

  logRegistrationAttempt(email, context = {}) {
    return this.info('Registration attempt initiated', {
      email: this.maskEmail(email),
      attemptTime: new Date().toISOString()
    }, context);
  }

  logRegistrationSuccess(user, context = {}) {
    return this.info('Registration successful', {
      userId: user._id,
      email: this.maskEmail(user.email),
      role: user.role,
      registrationTime: new Date().toISOString()
    }, context);
  }

  logRegistrationFailure(email, reason, context = {}) {
    return this.warn('Registration failed', {
      email: this.maskEmail(email),
      reason,
      failureTime: new Date().toISOString()
    }, context);
  }

  logTokenRefresh(userId, context = {}) {
    return this.info('Token refresh', {
      userId,
      refreshTime: new Date().toISOString()
    }, context);
  }

  logLogout(userId, context = {}) {
    return this.info('Logout', {
      userId,
      logoutTime: new Date().toISOString()
    }, context);
  }

  logSecurityEvent(event, details, context = {}) {
    return this.warn('Security event', {
      event,
      details,
      timestamp: new Date().toISOString()
    }, context);
  }

  // Utility methods
  maskEmail(email) {
    if (!email || typeof email !== 'string') return 'invalid-email';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.length > 2 ? 
      local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1) : 
      local;
    return `${maskedLocal}@${domain}`;
  }

  getRequestContext(req) {
    return {
      ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      url: req.originalUrl || req.url,
      method: req.method,
      headers: {
        'content-type': req.headers['content-type'],
        'accept': req.headers['accept']
      }
    };
  }
}

// Create logger instance
const authLogger = new AuthLogger();

// Set log level based on environment
if (process.env.NODE_ENV === 'development') {
  authLogger.setLogLevel('DEBUG');
} else if (process.env.AUTH_LOG_LEVEL) {
  authLogger.setLogLevel(process.env.AUTH_LOG_LEVEL);
}

// Register
router.post('/register', async (req, res) => {
  const startTime = Date.now();
  const context = authLogger.getRequestContext(req);
  
  try {
    const { name, email, password, role = 'guest' } = req.body;
    const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase() : email;
    
    // Log registration attempt
    authLogger.logRegistrationAttempt(normalizedEmail, context);
    
    // Validate input
    if (!normalizedEmail || !password) {
      authLogger.logRegistrationFailure(normalizedEmail, 'Missing email or password', context);
      return res.status(400).json({ 
        error: 'Validation failed',
        message: req.t('errors.validation') 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      authLogger.logRegistrationFailure(normalizedEmail, 'Invalid email format', context);
      return res.status(400).json({ 
        error: 'Invalid email format',
        message: 'Please provide a valid email address' 
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      authLogger.logRegistrationFailure(normalizedEmail, 'Password too short', context);
      return res.status(400).json({ 
        error: 'Password too short',
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Validate role
    if (!['guest', 'host', 'admin'].includes(role)) {
      authLogger.logRegistrationFailure(normalizedEmail, 'Invalid role', context);
      return res.status(400).json({ 
        error: 'Invalid role',
        message: 'Role must be guest, host, or admin' 
      });
    }
    
    authLogger.debug('Checking for existing user', { email: authLogger.maskEmail(normalizedEmail) }, context);
    
    // Check for existing user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      authLogger.logRegistrationFailure(normalizedEmail, 'User already exists', context);
      return res.status(400).json({ 
        error: 'User already exists',
        message: req.t('errors.user_exists') 
      });
    }
    
    authLogger.debug('Hashing password', { email: authLogger.maskEmail(normalizedEmail) }, context);
    
    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({ 
      name: name || normalizedEmail.split('@')[0], 
      email: normalizedEmail, 
      password: hashed, 
      role 
    });
    
    authLogger.debug('Saving user to database', { 
      email: authLogger.maskEmail(normalizedEmail),
      role,
      name: user.name
    }, context);
    
    await user.save();
    
    authLogger.debug('Generating JWT token', { userId: user._id }, context);
    
    // Create token and return user data
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    // Log successful registration
    authLogger.logRegistrationSuccess(user, context);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    authLogger.info('Registration request completed', { 
      responseTime: `${responseTime}ms`,
      userId: user._id,
      email: authLogger.maskEmail(normalizedEmail)
    }, context);
    
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
    const responseTime = Date.now() - startTime;
    
    authLogger.error('Registration error occurred', err, {
      ...context,
      responseTime: `${responseTime}ms`,
      email: authLogger.maskEmail(normalizedEmail)
    });

    // Log security event for unexpected errors
    authLogger.logSecurityEvent('registration_error', {
      error: err.message,
      stack: err.stack,
      responseTime: `${responseTime}ms`
    }, context);
    
    res.status(500).json({ message: req.t('errors.server') });
  }
});

// Admin-only user creation endpoint
router.post('/admin/create-user', auth, requireRole('admin'), async (req, res) => {
  const startTime = Date.now();
  const context = authLogger.getRequestContext(req);
  
  try {
    const { name, email, password, role = 'guest' } = req.body;
    const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase() : email;
    
    authLogger.info('Admin user creation attempt', { 
      adminUserId: req.user.id,
      targetEmail: authLogger.maskEmail(normalizedEmail),
      targetRole: role
    }, context);
    
    // Validate input
    if (!name || !email || !password) {
      authLogger.warn('Admin user creation failed - missing required fields', {
        adminUserId: req.user.id,
        targetEmail: authLogger.maskEmail(normalizedEmail),
        hasName: !!name,
        hasEmail: !!email,
        hasPassword: !!password
      }, context);
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    
    // Validate role
    if (!['guest', 'host', 'admin'].includes(role)) {
      authLogger.warn('Admin user creation failed - invalid role', {
        adminUserId: req.user.id,
        targetEmail: authLogger.maskEmail(normalizedEmail),
        invalidRole: role
      }, context);
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    authLogger.debug('Checking for existing user', { 
      targetEmail: authLogger.maskEmail(normalizedEmail)
    }, context);
    
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      authLogger.warn('Admin user creation failed - user already exists', {
        adminUserId: req.user.id,
        targetEmail: authLogger.maskEmail(normalizedEmail)
      }, context);
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    authLogger.debug('Hashing password for admin-created user', { 
      targetEmail: authLogger.maskEmail(normalizedEmail)
    }, context);
    
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email: normalizedEmail, 
      password: hashed, 
      role 
    });
    
    authLogger.debug('Saving admin-created user to database', { 
      targetEmail: authLogger.maskEmail(normalizedEmail),
      role,
      name
    }, context);
    
    await user.save();
    
    const responseTime = Date.now() - startTime;
    authLogger.info('Admin user creation successful', { 
      responseTime: `${responseTime}ms`,
      adminUserId: req.user.id,
      newUserId: user._id,
      targetEmail: authLogger.maskEmail(normalizedEmail),
      role
    }, context);
    
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
    const responseTime = Date.now() - startTime;
    
    authLogger.error('Admin user creation error', err, {
      ...context,
      responseTime: `${responseTime}ms`,
      adminUserId: req.user?.id,
      targetEmail: authLogger.maskEmail(normalizedEmail)
    });
    
    res.status(500).json({ message: 'User creation failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const startTime = Date.now();
  const context = authLogger.getRequestContext(req);
  
  console.log('[LOGIN][START] Login request received');
  console.log('[LOGIN][DEBUG] Request body:', JSON.stringify(req.body));
  console.log('[LOGIN][DEBUG] Request headers:', JSON.stringify(req.headers));
  
  try {
    let { email, password } = req.body;
    const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase() : email;
    
    // Explicit logging for diagnosis
    console.log('[LOGIN][DEBUG] Raw email:', email);
    console.log('[LOGIN][DEBUG] Normalized email:', normalizedEmail);
    console.log('[LOGIN][DEBUG] Password provided:', !!password);
    console.log('[LOGIN][DEBUG] Password length:', password ? password.length : 0);
    
    // Log login attempt
    authLogger.logLoginAttempt(normalizedEmail, context);
    
    // Validate input
    if (!normalizedEmail || !password) {
      console.warn('[LOGIN][WARN] Missing email or password');
      console.warn('[LOGIN][WARN] Email present:', !!normalizedEmail);
      console.warn('[LOGIN][WARN] Password present:', !!password);
      authLogger.logLoginFailure(normalizedEmail, 'Missing email or password', context);
      const errorResponse = { message: 'Invalid credentials' };
      console.log('[LOGIN][RESPONSE] Sending error response:', JSON.stringify(errorResponse));
      return res.status(401).json(errorResponse);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      console.warn('[LOGIN][WARN] Invalid email format:', normalizedEmail);
      authLogger.logLoginFailure(normalizedEmail, 'Invalid email format', context);
      const errorResponse = { message: 'Invalid credentials' };
      console.log('[LOGIN][RESPONSE] Sending error response:', JSON.stringify(errorResponse));
      return res.status(401).json(errorResponse);
    }

    // Validate password length
    if (password.length < 1) {
      console.warn('[LOGIN][WARN] Empty password');
      authLogger.logLoginFailure(normalizedEmail, 'Empty password', context);
      const errorResponse = { message: 'Invalid credentials' };
      console.log('[LOGIN][RESPONSE] Sending error response:', JSON.stringify(errorResponse));
      return res.status(401).json(errorResponse);
    }

    authLogger.debug('Looking up user in database', { email: authLogger.maskEmail(normalizedEmail) }, context);
    console.log('[LOGIN][DEBUG] Looking up user in database for email:', normalizedEmail);
    
    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.warn('[LOGIN][WARN] No user found for email:', normalizedEmail);
      authLogger.logLoginFailure(normalizedEmail, 'User not found', context);
      const errorResponse = { message: 'Invalid credentials' };
      console.log('[LOGIN][RESPONSE] Sending error response:', JSON.stringify(errorResponse));
      return res.status(401).json(errorResponse);
    }
    console.log('[LOGIN][DEBUG] User found:', {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    authLogger.debug('User found, verifying password', { 
      userId: user._id, 
      role: user.role,
      email: authLogger.maskEmail(normalizedEmail)
    }, context);

    // Verify password
    console.log('[LOGIN][DEBUG] Verifying password...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN][DEBUG] Password match result:', isMatch);
    if (!isMatch) {
      console.warn('[LOGIN][WARN] Password did not match for user:', normalizedEmail);
      authLogger.logLoginFailure(normalizedEmail, 'Invalid password', context);
      const errorResponse = { message: 'Invalid credentials' };
      console.log('[LOGIN][RESPONSE] Sending error response:', JSON.stringify(errorResponse));
      return res.status(401).json(errorResponse);
    }

    authLogger.debug('Password verified successfully', { 
      userId: user._id,
      email: authLogger.maskEmail(normalizedEmail)
    }, context);
    console.log('[LOGIN][DEBUG] Login successful for user:', normalizedEmail);

    // Generate JWT token
    console.log('[LOGIN][DEBUG] Generating JWT token...');
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    console.log('[LOGIN][DEBUG] JWT token generated successfully');
    
    authLogger.debug('JWT token generated', { 
      userId: user._id,
      tokenExpiry: '1d',
      email: authLogger.maskEmail(normalizedEmail)
    }, context);

    // Log successful login
    authLogger.logLoginSuccess(user, context);

    // Calculate response time
    const responseTime = Date.now() - startTime;
    authLogger.info('Login request completed', { 
      responseTime: `${responseTime}ms`,
      userId: user._id,
      email: authLogger.maskEmail(normalizedEmail)
    }, context);

    // Return success response
    const loginResponse = {
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        themePreference: user.themePreference
      }
    };
    console.log('[LOGIN][SUCCESS] Login response prepared:', JSON.stringify(loginResponse));
    console.log('[LOGIN][RESPONSE] Sending success response with token length:', token ? token.length : 0);
    
    // Set response headers for debugging
    res.setHeader('X-Login-Status', 'success');
    res.setHeader('X-User-ID', user._id.toString());
    res.setHeader('X-User-Role', user.role);
    
    res.json(loginResponse);
    console.log('[LOGIN][END] Login request completed successfully');

  } catch (err) {
    const responseTime = Date.now() - startTime;
    
    console.error('[LOGIN][ERROR] Login error occurred:', err);
    console.error('[LOGIN][ERROR] Error stack:', err.stack);
    authLogger.error('Login error occurred', err, {
      ...context,
      responseTime: `${responseTime}ms`,
      email: authLogger.maskEmail(email)
    });

    // Log security event for unexpected errors
    authLogger.logSecurityEvent('login_error', {
      error: err.message,
      stack: err.stack,
      responseTime: `${responseTime}ms`
    }, context);

    const errorResponse = { message: 'Login failed' };
    console.log('[LOGIN][RESPONSE] Sending error response:', JSON.stringify(errorResponse));
    res.status(500).json(errorResponse);
    console.log('[LOGIN][END] Login request failed with error');
  }
});

// Get current user (protected route)
router.get('/me', auth, async (req, res) => {
  const startTime = Date.now();
  const context = authLogger.getRequestContext(req);
  
  try {
    authLogger.debug('Fetching current user', { userId: req.user.id }, context);
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      authLogger.warn('User not found for token', { userId: req.user.id }, context);
      return res.status(404).json({ message: 'User not found' });
    }
    
    authLogger.debug('Current user retrieved successfully', { 
      userId: user._id,
      email: authLogger.maskEmail(user.email),
      role: user.role
    }, context);
    
    const responseTime = Date.now() - startTime;
    authLogger.info('Get current user request completed', { 
      responseTime: `${responseTime}ms`,
      userId: user._id
    }, context);
    
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
    const responseTime = Date.now() - startTime;
    
    authLogger.error('Get current user error', err, {
      ...context,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id
    });
    
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout (client should just delete token)
router.post('/logout', (req, res) => {
  const context = authLogger.getRequestContext(req);
  
  // Note: We can't get userId here since token is deleted client-side
  authLogger.info('Logout request received', { 
    note: 'Token deletion handled client-side'
  }, context);
  
  res.json({ message: 'Logout successful' });
});

// Refresh token
router.post('/refresh', auth, async (req, res) => {
  const startTime = Date.now();
  const context = authLogger.getRequestContext(req);
  
  try {
    authLogger.debug('Token refresh initiated', { userId: req.user.id }, context);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      authLogger.warn('User not found during token refresh', { userId: req.user.id }, context);
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Generate new token with different expiration
    const newToken = jwt.sign(
      { id: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '2d' } // Different expiration time
    );
    
    authLogger.logTokenRefresh(user._id, context);
    
    const responseTime = Date.now() - startTime;
    authLogger.info('Token refresh completed', { 
      responseTime: `${responseTime}ms`,
      userId: user._id,
      newExpiry: '2d'
    }, context);
    
    res.json({ 
      token: newToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    authLogger.error('Token refresh error', error, {
      ...context,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id
    });
    
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Password reset request
router.post('/reset-password', async (req, res) => {
  const startTime = Date.now();
  const context = authLogger.getRequestContext(req);
  
  try {
    let { email } = req.body;
    const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase() : email;
    
    authLogger.info('Password reset request', { 
      email: authLogger.maskEmail(normalizedEmail)
    }, context);
    
    if (!normalizedEmail) {
      authLogger.warn('Password reset failed - missing email', {}, context);
      return res.status(400).json({ 
        error: 'Missing email',
        message: 'Email is required' 
      });
    }
    
    authLogger.debug('Looking up user for password reset', { 
      email: authLogger.maskEmail(normalizedEmail)
    }, context);
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      authLogger.warn('Password reset failed - user not found', { 
        email: authLogger.maskEmail(normalizedEmail)
      }, context);
      return res.status(404).json({ 
        error: 'User not found',
        message: 'No user found with this email' 
      });
    }
    
    authLogger.info('Password reset email would be sent', { 
      userId: user._id,
      email: authLogger.maskEmail(normalizedEmail)
    }, context);
    
    // In a real app, you would send an email with a reset link
    // For now, we'll just return a success message
    const responseTime = Date.now() - startTime;
    authLogger.info('Password reset request completed', { 
      responseTime: `${responseTime}ms`,
      userId: user._id
    }, context);
    
    res.json({ 
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    authLogger.error('Password reset error', error, {
      ...context,
      responseTime: `${responseTime}ms`
    });
    
    res.status(500).json({ message: 'Failed to process password reset' });
  }
});

router.post('/test-login', (req, res) => {
  const context = authLogger.getRequestContext(req);
  
  authLogger.info('Test login route accessed', {
    note: 'This is a test endpoint for debugging'
  }, context);
  
  res.json({ message: 'Test login route works' });
});

// Update theme preference
router.post('/theme', auth, async (req, res) => {
  const startTime = Date.now();
  const context = authLogger.getRequestContext(req);
  
  try {
    const { theme } = req.body;
    
    authLogger.info('Theme preference update request', { 
      userId: req.user.id,
      requestedTheme: theme
    }, context);
    
    if (!['light', 'dark'].includes(theme)) {
      authLogger.warn('Theme update failed - invalid theme', { 
        userId: req.user.id,
        invalidTheme: theme
      }, context);
      return res.status(400).json({ message: 'Invalid theme. Must be "light" or "dark"' });
    }
    
    authLogger.debug('Updating user theme preference', { 
      userId: req.user.id,
      newTheme: theme
    }, context);
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { themePreference: theme },
      { new: true }
    ).select('-password');
    
    if (!user) {
      authLogger.warn('Theme update failed - user not found', { 
        userId: req.user.id
      }, context);
      return res.status(404).json({ message: 'User not found' });
    }
    
    const responseTime = Date.now() - startTime;
    authLogger.info('Theme preference updated successfully', { 
      responseTime: `${responseTime}ms`,
      userId: user._id,
      newTheme: theme
    }, context);
    
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
    const responseTime = Date.now() - startTime;
    
    authLogger.error('Theme update error', err, {
      ...context,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id
    });
    
    res.status(500).json({ message: 'Failed to update theme preference' });
  }
});

// Minimal JSON test route for diagnostics
router.get('/test-json', (req, res) => {
  res.json({ test: 'ok', time: new Date().toISOString() });
});

// Simple login test route
router.post('/test-login-simple', (req, res) => {
  console.log('[TEST-LOGIN] Simple test route hit');
  console.log('[TEST-LOGIN] Request body:', req.body);
  
  const testResponse = {
    message: 'Test login route works',
    timestamp: new Date().toISOString(),
    receivedData: req.body
  };
  
  console.log('[TEST-LOGIN] Sending response:', JSON.stringify(testResponse));
  res.json(testResponse);
});

module.exports = router; 