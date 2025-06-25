import getApiBase from './getApiBase';
const API_BASE = getApiBase();

console.log('[Analytics] API_BASE configured as:', API_BASE);

class AnalyticsService {
  constructor() {
    this.sessionId = null;
    this.sessionStartTime = null;
    this.currentPage = null;
    this.pageStartTime = null;
    this.isTracking = false;
    this.heartbeatInterval = null;
    this.visibilityChangeHandler = null;
    this.beforeUnloadHandler = null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const isAuth = !!token;
    console.log('[Analytics] Authentication check:', { isAuth, hasToken: !!token });
    return isAuth;
  }

  // Initialize tracking
  init() {
    if (this.isTracking) {
      console.log('[Analytics] Already tracking, skipping init');
      return;
    }
    
    console.log('[Analytics] Initializing tracking service...');
    this.isTracking = true;
    this.sessionStartTime = Date.now();
    this.currentPage = window.location.pathname;
    this.pageStartTime = Date.now();

    // Only start session tracking if user is authenticated
    if (this.isAuthenticated()) {
      console.log('[Analytics] User authenticated, starting session tracking');
      this.trackSessionStart();
    } else {
      console.log('[Analytics] User not authenticated, skipping session tracking');
    }
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start heartbeat only if authenticated
    if (this.isAuthenticated()) {
      console.log('[Analytics] Starting heartbeat for authenticated user');
      this.startHeartbeat();
    } else {
      console.log('[Analytics] Skipping heartbeat - user not authenticated');
    }
    
    console.log('Analytics tracking initialized');
  }

  // Set up event listeners for tracking
  setupEventListeners() {
    // Track clicks only if authenticated
    if (this.isAuthenticated()) {
      document.addEventListener('click', (e) => {
        this.trackClick(e);
      }, true);
    }

    // Track page visibility changes
    this.visibilityChangeHandler = () => {
      if (document.hidden) {
        this.trackPageLeave();
      } else {
        this.trackPageReturn();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);

    // Track before unload (user leaving page)
    this.beforeUnloadHandler = () => {
      this.trackPageLeave();
      if (this.isAuthenticated()) {
        this.trackSessionEnd();
      }
    };
    window.addEventListener('beforeunload', this.beforeUnloadHandler);

    // Track page changes (for SPA)
    this.setupPageChangeTracking();
  }

  // Track page changes in SPA
  setupPageChangeTracking() {
    // Override pushState and replaceState to track navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      this.trackPageChange();
      return originalPushState.apply(history, args);
    };

    history.replaceState = (...args) => {
      this.trackPageChange();
      return originalReplaceState.apply(history, args);
    };

    // Listen for popstate events
    window.addEventListener('popstate', () => {
      this.trackPageChange();
    });
  }

  // Track page change
  trackPageChange() {
    const newPage = window.location.pathname;
    if (newPage !== this.currentPage) {
      this.trackPageLeave();
      this.currentPage = newPage;
      this.pageStartTime = Date.now();
      if (this.isAuthenticated()) {
        this.trackPageView();
      }
    }
  }

  // Track click events
  trackClick(event) {
    if (!this.isAuthenticated()) {
      console.log('[Analytics] Skipping click tracking - user not authenticated');
      return;
    }
    
    const element = event.target;
    const elementData = this.getElementData(element);
    
    if (elementData) {
      console.log('[Analytics] Tracking click event:', elementData);
      this.sendTrackingData('/analytics/track/click', {
        element: elementData.element,
        elementType: elementData.elementType,
        elementId: elementData.elementId,
        elementText: elementData.elementText,
        page: this.currentPage
      });
    } else {
      console.log('[Analytics] No element data found for click tracking');
    }
  }

  // Extract element data for tracking
  getElementData(element) {
    // Skip if element is not meaningful for tracking
    if (!element || element.tagName === 'HTML' || element.tagName === 'BODY') {
      return null;
    }

    const tagName = element.tagName.toLowerCase();
    // Ensure className is always a string, handling both string and DOMTokenList cases
    const className = (element.className || '').toString();
    const id = element.id || '';
    const text = element.textContent?.trim() || '';
    
    // Determine element type
    let elementType = 'other';
    if (tagName === 'button' || className.includes('btn')) {
      elementType = 'button';
    } else if (tagName === 'a' || className.includes('link')) {
      elementType = 'link';
    } else if (className.includes('card')) {
      elementType = 'card';
    } else if (className.includes('modal')) {
      elementType = 'modal';
    } else if (className.includes('form')) {
      elementType = 'form';
    }

    // Create element identifier
    let elementId = '';
    if (id) {
      elementId = id;
    } else if (className) {
      elementId = className.split(' ')[0];
    }

    return {
      element: `${tagName}${id ? '#' + id : ''}${className ? '.' + className.split(' ').join('.') : ''}`,
      elementType,
      elementId,
      elementText: text.substring(0, 100) // Limit text length
    };
  }

  // Track session start
  async trackSessionStart() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('[Analytics] No token available for session start tracking');
        return;
      }

      console.log('[Analytics] Attempting session start tracking...');
      const response = await fetch(`${API_BASE}/analytics/track/session-start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          page: this.currentPage
        })
      });

      console.log('[Analytics] Session start response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        this.sessionId = data.sessionId;
        console.log('[Analytics] Session start successful, sessionId:', this.sessionId);
      } else {
        console.warn('Session start tracking failed:', response.status, response.statusText);
        console.log('[Analytics] Session start failed - response details:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
      }
    } catch (error) {
      console.debug('Session start error (non-critical):', error.message);
      console.log('[Analytics] Session start error details:', {
        message: error.message,
        stack: error.stack,
        url: `${API_BASE}/analytics/track/session-start`
      });
    }
  }

  // Track page view
  async trackPageView() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/analytics/track/page-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify({
          page: this.currentPage
        })
      });

      if (!response.ok) {
        console.warn('Page view tracking failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.debug('Page view error (non-critical):', error.message);
    }
  }

  // Track page leave
  trackPageLeave() {
    if (this.pageStartTime) {
      const timeSpent = Math.floor((Date.now() - this.pageStartTime) / 1000);
      this.pageStartTime = null;
      
      // Only track if user spent meaningful time on page and is authenticated
      if (timeSpent > 1 && this.isAuthenticated()) {
        this.sendTrackingData('/analytics/track/page-leave', {
          page: this.currentPage,
          timeSpent
        });
      }
    }
  }

  // Track page return
  trackPageReturn() {
    this.pageStartTime = Date.now();
  }

  // Track session end
  async trackSessionEnd() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const timeSpent = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      
      const response = await fetch(`${API_BASE}/analytics/track/session-end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          timeSpent,
          page: this.currentPage
        })
      });

      if (!response.ok) {
        console.warn('Session end tracking failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.debug('Session end error (non-critical):', error.message);
    }
  }

  // Track bounce (user leaves without interaction)
  async trackBounce() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const timeSpent = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      
      const response = await fetch(`${API_BASE}/analytics/track/bounce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          timeSpent,
          page: this.currentPage
        })
      });

      if (!response.ok) {
        console.warn('Bounce tracking failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.debug('Bounce error (non-critical):', error.message);
    }
  }

  // Send tracking data
  async sendTrackingData(endpoint, data) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('[Analytics] No token available for tracking data');
        return;
      }

      console.log('[Analytics] Sending tracking data:', { endpoint, data });
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify(data)
      });

      console.log('[Analytics] Tracking response:', { 
        endpoint, 
        status: response.status, 
        ok: response.ok,
        url: response.url 
      });

      // Don't throw error for tracking failures - just log them as warnings
      if (!response.ok) {
        console.warn('Tracking request failed:', endpoint, response.status, response.statusText);
        console.log('[Analytics] Tracking failed details:', {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
      } else {
        console.log('[Analytics] Tracking successful:', endpoint);
      }
    } catch (error) {
      // Don't log tracking errors as they're not critical
      console.debug('Tracking error (non-critical):', endpoint, error.message);
      console.log('[Analytics] Tracking error details:', {
        endpoint,
        message: error.message,
        stack: error.stack,
        url: `${API_BASE}${endpoint}`
      });
    }
  }

  // Start heartbeat to track active sessions
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (!document.hidden && this.isAuthenticated()) {
        this.sendHeartbeat();
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  // Send heartbeat
  async sendHeartbeat() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/analytics/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          page: this.currentPage,
          timestamp: new Date().toISOString()
        })
      });

      // Don't throw error for heartbeat failures - just log them
      if (!response.ok) {
        console.warn('Heartbeat request failed:', response.status, response.statusText);
      }
    } catch (error) {
      // Don't log heartbeat errors as they're not critical
      console.debug('Heartbeat error (non-critical):', error.message);
    }
  }

  // Stop tracking
  stop() {
    if (!this.isTracking) return;

    this.isTracking = false;
    
    // Clear intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Remove event listeners
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }

    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      this.beforeUnloadHandler = null;
    }

    // Track session end if authenticated
    if (this.isAuthenticated()) {
      this.trackSessionEnd();
    }
    
    console.log('Analytics tracking stopped');
  }

  // Manual tracking methods for specific events
  trackCustomEvent(eventName, data = {}) {
    if (!this.isAuthenticated()) {
      console.debug('Analytics: Skipping custom event tracking - user not authenticated');
      return;
    }
    
    this.sendTrackingData('/analytics/track/custom', {
      eventName,
      page: this.currentPage,
      ...data
    });
  }

  trackFormSubmission(formName, success = true) {
    this.trackCustomEvent('form_submission', {
      formName,
      success
    });
  }

  trackSearch(query, resultsCount) {
    this.trackCustomEvent('search', {
      query,
      resultsCount
    });
  }

  trackBooking(listingId, success = true) {
    this.trackCustomEvent('booking', {
      listingId,
      success
    });
  }

  // Generic track method for any event
  track(eventName, data = {}) {
    console.log('[Analytics] Track method called:', { eventName, data });
    
    // Add additional safety check for authentication
    if (!this.isAuthenticated()) {
      console.debug(`Analytics: Skipping ${eventName} tracking - user not authenticated`);
      console.log('[Analytics] Track skipped - authentication check failed');
      return;
    }
    
    console.log('[Analytics] Proceeding with track call:', eventName);
    this.trackCustomEvent(eventName, data);
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService; 