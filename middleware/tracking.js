const UserActivity = require('../models/UserActivity');
const { v4: uuidv4 } = require('uuid');

// Generate session ID
const generateSessionId = () => uuidv4();

// Get client IP address
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

// Track page view
const trackPageView = async (req, res, next) => {
  try {
    if (!req.user) return next();

    const sessionId = req.headers['x-session-id'] || generateSessionId();
    const page = req.path;
    const referrer = req.headers.referer || null;
    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = getClientIP(req);

    await UserActivity.create({
      userId: req.user.id,
      sessionId,
      eventType: 'page_view',
      page,
      referrer,
      userAgent,
      ipAddress,
      timestamp: new Date()
    });

    // Add session ID to response headers
    res.setHeader('X-Session-ID', sessionId);
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
  next();
};

// Track user click
const trackClick = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { element, elementType, elementId, elementText, page } = req.body;
    const sessionId = req.headers['x-session-id'] || generateSessionId();
    const ipAddress = getClientIP(req);

    await UserActivity.create({
      userId: req.user.id,
      sessionId,
      eventType: 'click',
      page: page || req.path,
      element,
      elementType,
      elementId,
      elementText,
      ipAddress,
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
};

// Track session start
const trackSessionStart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const sessionId = generateSessionId();
    const page = req.body.page || req.path;
    const referrer = req.headers.referer || null;
    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = getClientIP(req);

    await UserActivity.create({
      userId: req.user.id,
      sessionId,
      eventType: 'session_start',
      page,
      referrer,
      userAgent,
      ipAddress,
      timestamp: new Date()
    });

    res.json({ sessionId });
  } catch (error) {
    console.error('Error tracking session start:', error);
    res.status(500).json({ error: 'Failed to track session start' });
  }
};

// Track session end
const trackSessionEnd = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { sessionId, timeSpent, page } = req.body;
    const ipAddress = getClientIP(req);

    await UserActivity.create({
      userId: req.user.id,
      sessionId,
      eventType: 'session_end',
      page: page || req.path,
      timeSpent,
      ipAddress,
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking session end:', error);
    res.status(500).json({ error: 'Failed to track session end' });
  }
};

// Track bounce (user leaves without interaction)
const trackBounce = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { sessionId, page, timeSpent } = req.body;
    const ipAddress = getClientIP(req);

    await UserActivity.create({
      userId: req.user.id,
      sessionId,
      eventType: 'bounce',
      page: page || req.path,
      timeSpent,
      ipAddress,
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking bounce:', error);
    res.status(500).json({ error: 'Failed to track bounce' });
  }
};

module.exports = {
  trackPageView,
  trackClick,
  trackSessionStart,
  trackSessionEnd,
  trackBounce,
  generateSessionId
}; 