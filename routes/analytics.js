const express = require('express');
const User = require('../models/User');
const Listing = require('../models/Listing');
const BookingRequest = require('../models/BookingRequest');
const UserActivity = require('../models/UserActivity');
const { auth, requireRole } = require('../middleware/auth');
const { trackClick, trackSessionStart, trackSessionEnd, trackBounce } = require('../middleware/tracking');

const router = express.Router();

// Custom middleware to allow admin or host accessing their own analytics
function allowAdminOrSelfHost(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  if (
    req.user &&
    req.user.role === 'host' &&
    req.user._id &&
    req.query.hostId &&
    req.query.hostId.toString() === req.user._id.toString()
  ) {
    return next();
  }
  // Allow users to access their own profile analytics
  if (
    req.user &&
    req.user._id &&
    req.query.profileId &&
    req.query.profileId.toString() === req.user._id.toString()
  ) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden' });
}

// Get comprehensive analytics (Admin or Host for own data)
router.get('/', auth, allowAdminOrSelfHost, async (req, res) => {
  try {
    const { hostId, profileId, timeRange = '7d' } = req.query;
    let listingFilter = {};
    let bookingFilter = {};
    let activityFilter = {};
    
    if (profileId) {
      activityFilter.page = `/profile/${profileId}`;
    } else if (hostId) {
      // Only include listings for this host
      listingFilter.host = hostId;
      // Only include bookings for this host's listings
      const hostListings = await Listing.find({ host: hostId }, '_id');
      const hostListingIds = hostListings.map(l => l._id);
      bookingFilter.listing = { $in: hostListingIds };
      // Only include user activity for this host's listings (if activity is linked to listing)
      activityFilter.listing = { $in: hostListingIds };
    }

    // Time range calculation
    const now = new Date();
    let timeFilter = {};
    switch (timeRange) {
      case '7d':
        timeFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        timeFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        timeFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      default:
        timeFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    }

    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic counts
    const userCount = hostId ? 0 : await User.countDocuments({ role: { $in: ['guest', 'host'] } });
    const listingCount = await Listing.countDocuments(listingFilter);
    const bookingCount = await BookingRequest.countDocuments(bookingFilter);

    // Payment and revenue analytics
    const Payment = require('../models/Payment');
    
    let totalRevenue = 0;
    let appProfitability = 0;
    
    if (hostId) {
      // For host view, get payments for their listings
      const hostListings = await Listing.find({ host: hostId }, '_id');
      const hostListingIds = hostListings.map(l => l._id);
      
      // Get bookings for these listings
      const hostBookings = await BookingRequest.find({ listing: { $in: hostListingIds } }, '_id');
      const hostBookingIds = hostBookings.map(b => b._id);
      
      // Get payments for these bookings
      const revenueResult = await Payment.aggregate([
        { $match: { 
          booking: { $in: hostBookingIds }, 
          paymentStatus: 'completed', 
          createdAt: timeFilter 
        }},
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    } else {
      // For admin view, get all completed payments
      const revenueResult = await Payment.aggregate([
        { $match: { paymentStatus: 'completed', createdAt: timeFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    }
    
    appProfitability = totalRevenue * 0.02; // 2% fee

    // Booking analytics
    const bookingStats = await BookingRequest.aggregate([
      { $match: { ...bookingFilter, createdAt: timeFilter } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const bookingStatusDistribution = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0
    };

    bookingStats.forEach(stat => {
      bookingStatusDistribution[stat._id] = stat.count;
    });

    // Top recent bookings
    const topRecentBookings = await BookingRequest.find({
      ...bookingFilter,
      createdAt: timeFilter
    })
    .populate('listing', 'title location')
    .populate('guest', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

    // Booking trends (last 7 days)
    const bookingTrends = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const count = await BookingRequest.countDocuments({
        ...bookingFilter,
        createdAt: { $gte: day, $lt: nextDay }
      });
      bookingTrends.push({
        date: day.toISOString().slice(0, 10),
        bookings: count
      });
    }

    // Property visit analytics
    const propertyVisits = await UserActivity.aggregate([
      {
        $match: {
          eventType: 'page_view',
          timestamp: timeFilter,
          ...(activityFilter.listing ? { listing: activityFilter.listing } : {})
        }
      },
      {
        $group: {
          _id: '$listing',
          visits: { $sum: 1 }
        }
      },
      {
        $sort: { visits: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Most visited properties with details
    const mostVisitedProperties = await Promise.all(
      propertyVisits.map(async (visit) => {
        const listing = await Listing.findById(visit._id).select('title location city country');
        return {
          ...visit,
          listing: listing || { title: 'Unknown Property', location: 'Unknown' }
        };
      })
    );

    // Property visit trends (last 7 days)
    const propertyVisitTrends = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const visits = await UserActivity.countDocuments({
        eventType: 'page_view',
        timestamp: { $gte: day, $lt: nextDay },
        ...(activityFilter.listing ? { listing: activityFilter.listing } : {})
      });
      propertyVisitTrends.push({
        date: day.toISOString().slice(0, 10),
        visits
      });
    }

    // User activity analytics
    const pageViews24h = await UserActivity.countDocuments({
      eventType: 'page_view',
      timestamp: { $gte: last24Hours },
      ...activityFilter
    });

    const pageViews7d = await UserActivity.countDocuments({
      eventType: 'page_view',
      timestamp: { $gte: last7Days },
      ...activityFilter
    });

    // Unique sessions
    const uniqueSessions24h = await UserActivity.distinct('sessionId', {
      timestamp: { $gte: last24Hours },
      ...activityFilter
    });

    const uniqueSessions7d = await UserActivity.distinct('sessionId', {
      timestamp: { $gte: last7Days },
      ...activityFilter
    });

    // Bounce rate
    const totalSessions = await UserActivity.countDocuments({
      eventType: 'session_start',
      timestamp: { $gte: last7Days },
      ...activityFilter
    });

    const bounces = await UserActivity.countDocuments({
      eventType: 'bounce',
      timestamp: { $gte: last7Days },
      ...activityFilter
    });

    const bounceRate = totalSessions > 0 ? (bounces / totalSessions * 100).toFixed(2) : 0;

    // Average session duration
    const sessionDurations = await UserActivity.aggregate([
      {
        $match: {
          eventType: 'session_end',
          timestamp: { $gte: last7Days },
          timeSpent: { $gt: 0 },
          ...(activityFilter.listing ? { listing: activityFilter.listing } : {})
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$timeSpent' },
          totalSessions: { $sum: 1 }
        }
      }
    ]);

    const avgSessionDuration = sessionDurations.length > 0 ? 
      Math.round(sessionDurations[0].avgDuration) : 0;

    // Most popular pages
    const popularPages = await UserActivity.aggregate([
      {
        $match: {
          eventType: 'page_view',
          timestamp: { $gte: last7Days },
          ...(activityFilter.listing ? { listing: activityFilter.listing } : {})
        }
      },
      {
        $group: {
          _id: '$page',
          views: { $sum: 1 }
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Most clicked elements
    const popularElements = await UserActivity.aggregate([
      {
        $match: {
          eventType: 'click',
          timestamp: { $gte: last7Days },
          element: { $exists: true, $ne: null },
          ...(activityFilter.listing ? { listing: activityFilter.listing } : {})
        }
      },
      {
        $group: {
          _id: {
            element: '$element',
            elementType: '$elementType',
            page: '$page'
          },
          clicks: { $sum: 1 }
        }
      },
      {
        $sort: { clicks: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // User engagement by hour
    const hourlyActivity = await UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: last7Days },
          ...(activityFilter.listing ? { listing: activityFilter.listing } : {})
        }
      },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          events: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Recent user activity
    const recentActivity = await UserActivity.find({
      timestamp: { $gte: last24Hours },
      ...activityFilter
    })
    .populate('userId', 'name email role')
    .sort({ timestamp: -1 })
    .limit(50);

    // Page views over time
    const pageViewsOverTime = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const views = await UserActivity.countDocuments({
        eventType: 'page_view',
        timestamp: { $gte: day, $lt: nextDay },
        ...(activityFilter.listing ? { listing: activityFilter.listing } : {})
      });
      pageViewsOverTime.push({ date: day.toISOString().slice(0, 10), views });
    }

    // Response data
    const analyticsData = {
      // Overview metrics
      userCount: userCount || 0,
      listingCount,
      bookingCount,
      totalRevenue: totalRevenue || 0,
      appProfitability: appProfitability || 0,
      uniqueSessions24h: uniqueSessions24h.length,
      uniqueSessions7d: uniqueSessions7d.length,
      
      // User activity
      pageViews24h,
      pageViews7d,
      bounceRate: parseFloat(bounceRate),
      avgSessionDuration,
      
      // Booking analytics
      bookingStatusDistribution,
      topRecentBookings: topRecentBookings.map(booking => ({
        id: booking._id,
        listing: booking.listing?.title || 'Unknown Property',
        guest: booking.guest?.name || 'Unknown Guest',
        status: booking.status,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt
      })),
      bookingTrends,
      
      // Property analytics
      mostVisitedProperties,
      propertyVisitTrends,
      
      // Engagement data
      popularPages,
      popularElements,
      hourlyActivity,
      recentActivity,
      pageViewsOverTime
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Get user activity details (Admin only)
router.get('/user-activity/:userId', auth, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const activities = await UserActivity.find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await UserActivity.countDocuments({ userId });

    // User session summary
    const sessionSummary = await UserActivity.aggregate([
      {
        $match: { userId: require('mongoose').Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: '$sessionId',
          startTime: { $min: '$timestamp' },
          endTime: { $max: '$timestamp' },
          totalEvents: { $sum: 1 },
          pages: { $addToSet: '$page' },
          totalTimeSpent: { $sum: '$timeSpent' }
        }
      },
      {
        $sort: { startTime: -1 }
      }
    ]);

    res.json({
      activities,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      sessionSummary
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// Get real-time analytics (Admin only)
router.get('/realtime', auth, requireRole('admin'), async (req, res) => {
  try {
    const now = new Date();
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);

    // Active users in last 5 minutes
    const activeUsers = await UserActivity.distinct('userId', {
      timestamp: { $gte: last5Minutes }
    });

    // Recent page views
    const recentPageViews = await UserActivity.countDocuments({
      eventType: 'page_view',
      timestamp: { $gte: last5Minutes }
    });

    // Recent clicks
    const recentClicks = await UserActivity.countDocuments({
      eventType: 'click',
      timestamp: { $gte: last5Minutes }
    });

    // Current page activity
    const currentPageActivity = await UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: last5Minutes },
          eventType: 'page_view'
        }
      },
      {
        $group: {
          _id: '$page',
          views: { $sum: 1 }
        }
      },
      {
        $sort: { views: -1 }
      }
    ]);

    res.json({
      activeUsers: activeUsers.length,
      recentPageViews,
      recentClicks,
      currentPageActivity
    });
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    res.status(500).json({ error: 'Failed to fetch real-time analytics' });
  }
});

// Tracking endpoints
router.post('/track/click', auth, trackClick);
router.post('/track/session-start', auth, trackSessionStart);
router.post('/track/session-end', auth, trackSessionEnd);
router.post('/track/bounce', auth, trackBounce);

// Add missing tracking endpoints for frontend compatibility
router.post('/track/page-leave', auth, (req, res) => {
  // Optionally log or store the event
  res.json({ success: true });
});

router.post('/track/page-view', auth, (req, res) => {
  // Optionally log or store the event
  res.json({ success: true });
});

router.post('/track/custom', auth, (req, res) => {
  // Optionally log or store the event
  res.json({ success: true });
});

// POST /api/analytics/heartbeat
router.post('/heartbeat', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router; 