// Frontend Authentication Logger
class FrontendAuthLogger {
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
    this.logHistory = [];
    this.maxLogHistory = 100;
  }

  generateSessionId() {
    return `frontend_auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
        component: 'Frontend Authentication',
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toLocaleTimeString()
      }
    };

    // Add to history
    this.logHistory.push(logEntry);
    if (this.logHistory.length > this.maxLogHistory) {
      this.logHistory.shift();
    }

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
      `%c${levelIcons[level]} [${timeStr}] FRONTEND AUTH ${level} - ${message}`,
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

  logLogout(userId, context = {}) {
    return this.info('Logout', {
      userId,
      logoutTime: new Date().toISOString()
    }, context);
  }

  logNetworkRequest(url, method, context = {}) {
    return this.debug('Network request', {
      url,
      method,
      timestamp: new Date().toISOString()
    }, context);
  }

  logNetworkResponse(url, status, responseTime, context = {}) {
    return this.debug('Network response', {
      url,
      status,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    }, context);
  }

  logNetworkError(url, error, context = {}) {
    return this.error('Network error', error, {
      ...context,
      url,
      timestamp: new Date().toISOString()
    });
  }

  logFormValidation(field, value, isValid, context = {}) {
    return this.debug('Form validation', {
      field,
      value: this.maskSensitiveData(field, value),
      isValid,
      timestamp: new Date().toISOString()
    }, context);
  }

  logLocalStorageOperation(operation, key, value = null, context = {}) {
    return this.debug('LocalStorage operation', {
      operation,
      key,
      value: key.includes('token') ? '***' : value,
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

  maskSensitiveData(field, value) {
    if (field.toLowerCase().includes('password')) {
      return value ? '*'.repeat(value.length) : '';
    }
    if (field.toLowerCase().includes('email')) {
      return this.maskEmail(value);
    }
    if (field.toLowerCase().includes('token')) {
      return '***';
    }
    return value;
  }

  getRequestContext() {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };
  }

  // Export logs for debugging
  exportLogs() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: Date.now(),
      logLevel: this.currentLevel,
      logs: this.logHistory,
      summary: {
        total: this.logHistory.length,
        byLevel: this.logHistory.reduce((acc, log) => {
          acc[log.level] = (acc[log.level] || 0) + 1;
          return acc;
        }, {})
      }
    };
  }

  // Clear logs
  clearLogs() {
    this.logHistory = [];
    this.info('Log history cleared');
  }

  // Get logs by level
  getLogsByLevel(level) {
    return this.logHistory.filter(log => log.level === level);
  }

  // Get recent logs
  getRecentLogs(count = 10) {
    return this.logHistory.slice(-count);
  }
}

// Create and export logger instance
const frontendAuthLogger = new FrontendAuthLogger();

// Set log level based on environment
if (process.env.NODE_ENV === 'development') {
  frontendAuthLogger.setLogLevel('DEBUG');
}

export default frontendAuthLogger; 