const API_BASE = import.meta.env.PROD 
  ? 'https://nu3pbnb-api.onrender.com/api'
  : '/api';

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

  // Initialize tracking
  init() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    this.sessionStartTime = Date.now();
    this.currentPage = window.location.pathname;
    this.pageStartTime = Date.now();

    // Start session tracking
    this.trackSessionStart();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start heartbeat
    this.startHeartbeat();
    
    console.log('Analytics tracking initialized');
  }

  // Set up event listeners for tracking
  setupEventListeners() {
    // Track clicks
    document.addEventListener('click', (e) => {
      this.trackClick(e);
    }, true);

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
      this.trackSessionEnd();
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
      this.trackPageView();
    }
  }

  // Track click events
  trackClick(event) {
    const element = event.target;
    const elementData = this.getElementData(element);
    
    if (elementData) {
      this.sendTrackingData('/analytics/track/click', {
        element: elementData.element,
        elementType: elementData.elementType,
        elementId: elementData.elementId,
        elementText: elementData.elementText,
        page: this.currentPage
      });
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
      if (!token) return;

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

      if (response.ok) {
        const data = await response.json();
        this.sessionId = data.sessionId;
      }
    } catch (error) {
      console.error('Error tracking session start:', error);
    }
  }

  // Track page view
  async trackPageView() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_BASE}/analytics/track/page-view`, {
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
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Track page leave
  trackPageLeave() {
    if (this.pageStartTime) {
      const timeSpent = Math.floor((Date.now() - this.pageStartTime) / 1000);
      this.pageStartTime = null;
      
      // Only track if user spent meaningful time on page
      if (timeSpent > 1) {
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
      
      await fetch(`${API_BASE}/analytics/track/session-end`, {
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
    } catch (error) {
      console.error('Error tracking session end:', error);
    }
  }

  // Track bounce (user leaves without interaction)
  async trackBounce() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const timeSpent = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      
      await fetch(`${API_BASE}/analytics/track/bounce`, {
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
    } catch (error) {
      console.error('Error tracking bounce:', error);
    }
  }

  // Send tracking data
  async sendTrackingData(endpoint, data) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error sending tracking data:', error);
    }
  }

  // Start heartbeat to track active sessions
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (!document.hidden) {
        this.sendHeartbeat();
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  // Send heartbeat
  async sendHeartbeat() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_BASE}/analytics/heartbeat`, {
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
    } catch (error) {
      console.error('Error sending heartbeat:', error);
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

    // Track session end
    this.trackSessionEnd();
    
    console.log('Analytics tracking stopped');
  }

  // Manual tracking methods for specific events
  trackCustomEvent(eventName, data = {}) {
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
    this.trackCustomEvent(eventName, data);
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService; 