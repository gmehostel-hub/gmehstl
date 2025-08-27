// Frontend Security Utilities

// Secure token storage with encryption
class SecureStorage {
  constructor() {
    this.keyPrefix = 'hms_secure_';
    this.encryptionKey = this.generateEncryptionKey();
  }

  // Generate a simple encryption key (in production, use a more robust method)
  generateEncryptionKey() {
    return btoa(window.location.hostname + 'hms_security_key_2024');
  }

  // Simple XOR encryption (for basic obfuscation)
  encrypt(text) {
    const key = this.encryptionKey;
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      encrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  }

  // Simple XOR decryption
  decrypt(encryptedText) {
    try {
      const key = this.encryptionKey;
      const encrypted = atob(encryptedText);
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Secure token storage
  setToken(token) {
    if (!token) return false;
    try {
      const encrypted = this.encrypt(token);
      localStorage.setItem(this.keyPrefix + 'auth_token', encrypted);
      // Set expiration timestamp
      const expiration = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      localStorage.setItem(this.keyPrefix + 'token_exp', expiration.toString());
      return true;
    } catch (error) {
      console.error('Token storage failed:', error);
      return false;
    }
  }

  // Secure token retrieval
  getToken() {
    try {
      const encrypted = localStorage.getItem(this.keyPrefix + 'auth_token');
      const expiration = localStorage.getItem(this.keyPrefix + 'token_exp');
      
      if (!encrypted || !expiration) return null;
      
      // Check if token is expired
      if (Date.now() > parseInt(expiration)) {
        this.clearToken();
        return null;
      }
      
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Token retrieval failed:', error);
      this.clearToken();
      return null;
    }
  }

  // Clear token securely
  clearToken() {
    localStorage.removeItem(this.keyPrefix + 'auth_token');
    localStorage.removeItem(this.keyPrefix + 'token_exp');
    localStorage.removeItem(this.keyPrefix + 'user_data');
  }

  // Store user data securely
  setUserData(userData) {
    if (!userData) return false;
    try {
      const encrypted = this.encrypt(JSON.stringify(userData));
      localStorage.setItem(this.keyPrefix + 'user_data', encrypted);
      return true;
    } catch (error) {
      console.error('User data storage failed:', error);
      return false;
    }
  }

  // Retrieve user data securely
  getUserData() {
    try {
      const encrypted = localStorage.getItem(this.keyPrefix + 'user_data');
      if (!encrypted) return null;
      
      const decrypted = this.decrypt(encrypted);
      return decrypted ? JSON.parse(decrypted) : null;
    } catch (error) {
      console.error('User data retrieval failed:', error);
      return null;
    }
  }
}

// Input sanitization utilities
export const sanitizeInput = {
  // Remove HTML tags and dangerous characters
  cleanHTML: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },

  // Sanitize for SQL-like injection attempts
  cleanSQL: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/['";\\]/g, '')
      .replace(/\b(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|ALTER|CREATE)\b/gi, '');
  },

  // Sanitize email input
  cleanEmail: (email) => {
    if (typeof email !== 'string') return email;
    return email.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '');
  },

  // Sanitize general text input
  cleanText: (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>"'&]/g, (match) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match];
    });
  }
};

// CSRF protection utilities
export const csrfProtection = {
  // Generate CSRF token
  generateToken: () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  // Get CSRF token from meta tag or generate new one
  getToken: () => {
    let token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!token) {
      token = csrfProtection.generateToken();
      // Store in session for consistency
      sessionStorage.setItem('csrf_token', token);
    }
    return token;
  },

  // Add CSRF token to request headers
  addToHeaders: (headers = {}) => {
    const token = csrfProtection.getToken();
    return {
      ...headers,
      'X-CSRF-Token': token
    };
  }
};

// Content Security Policy utilities
export const cspUtils = {
  // Check if current page violates CSP
  checkCSPViolations: () => {
    if (typeof document !== 'undefined') {
      document.addEventListener('securitypolicyviolation', (e) => {
        console.warn('CSP Violation:', {
          directive: e.violatedDirective,
          blockedURI: e.blockedURI,
          lineNumber: e.lineNumber,
          sourceFile: e.sourceFile
        });
        
        // Report to security monitoring (in production)
        if (process.env.NODE_ENV === 'production') {
          // Send to security monitoring service
          fetch('/api/security/csp-violation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              directive: e.violatedDirective,
              blockedURI: e.blockedURI,
              timestamp: new Date().toISOString()
            })
          }).catch(err => console.error('Failed to report CSP violation:', err));
        }
      });
    }
  }
};

// Session security utilities
export const sessionSecurity = {
  // Check for session hijacking indicators
  validateSession: () => {
    const userAgent = navigator.userAgent;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const currentFingerprint = btoa(userAgent + screenResolution + timezone);
    const storedFingerprint = sessionStorage.getItem('session_fingerprint');
    
    if (storedFingerprint && storedFingerprint !== currentFingerprint) {
      console.warn('Session fingerprint mismatch detected');
      // Clear session and redirect to login
      secureStorage.clearToken();
      window.location.href = '/login';
      return false;
    }
    
    if (!storedFingerprint) {
      sessionStorage.setItem('session_fingerprint', currentFingerprint);
    }
    
    return true;
  },

  // Auto-logout on inactivity
  setupInactivityTimer: (timeoutMinutes = 30) => {
    let inactivityTimer;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        alert('Session expired due to inactivity. You will be logged out.');
        secureStorage.clearToken();
        window.location.href = '/login';
      }, timeoutMinutes * 60 * 1000);
    };
    
    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer(); // Initialize timer
  }
};

// API request security wrapper
export const secureApiRequest = {
  // Secure fetch wrapper with automatic security headers
  fetch: async (url, options = {}) => {
    const token = secureStorage.getToken();
    
    const secureHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...csrfProtection.addToHeaders(),
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };
    
    const secureOptions = {
      ...options,
      headers: secureHeaders,
      credentials: 'include', // Include cookies
      mode: 'cors'
    };
    
    // Sanitize request body if it exists
    if (secureOptions.body && typeof secureOptions.body === 'string') {
      try {
        const bodyData = JSON.parse(secureOptions.body);
        const sanitizedData = sanitizeRequestData(bodyData);
        secureOptions.body = JSON.stringify(sanitizedData);
      } catch (error) {
        // Body is not JSON, leave as is
      }
    }
    
    try {
      const response = await fetch(url, secureOptions);
      
      // Check for security headers in response
      if (process.env.NODE_ENV === 'development') {
        checkSecurityHeaders(response);
      }
      
      return response;
    } catch (error) {
      console.error('Secure API request failed:', error);
      throw error;
    }
  }
};

// Helper function to sanitize request data
const sanitizeRequestData = (data) => {
  if (typeof data !== 'object' || data === null) return data;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput.cleanText(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeRequestData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Helper function to check security headers
const checkSecurityHeaders = (response) => {
  const securityHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Content-Security-Policy'
  ];
  
  const missingHeaders = securityHeaders.filter(header => !response.headers.get(header));
  
  if (missingHeaders.length > 0) {
    console.warn('Missing security headers:', missingHeaders);
  }
};

// Initialize secure storage instance
export const secureStorage = new SecureStorage();

// Initialize security features
export const initializeSecurity = () => {
  // Check CSP violations
  cspUtils.checkCSPViolations();
  
  // Validate session
  sessionSecurity.validateSession();
  
  // Setup inactivity timer
  sessionSecurity.setupInactivityTimer(30); // 30 minutes
  
  // Disable right-click context menu in production
  if (process.env.NODE_ENV === 'production') {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        return false;
      }
    });
  }
  
  console.log('🔒 Frontend security features initialized');
};
