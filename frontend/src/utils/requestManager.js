// Global request manager to prevent duplicate API calls
class RequestManager {
  constructor() {
    this.pendingRequests = new Map();
    this.cache = new Map();
    this.CACHE_DURATION = 1200000; // 20 minutes
  }

  // Generate a unique key for the request
  generateKey(url, params = {}) {
    const paramString = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    return `${url}${paramString ? '?' + paramString : ''}`;
  }

  // Check if data is in cache and still valid
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  // Set data in cache
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache for a specific key or all cache
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Make a request with deduplication and caching
  async makeRequest(apiCall, url, params = {}, forceRefresh = false) {
    const key = this.generateKey(url, params);
    
    // Return cached data if available and not forcing refresh
    if (!forceRefresh) {
      const cachedData = this.getCachedData(key);
      if (cachedData) {
        return Promise.resolve(cachedData);
      }
    }

    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key) && !forceRefresh) {
      console.log(`Request already pending for ${key}, returning existing promise`);
      return this.pendingRequests.get(key);
    }

    // Create new request
    const requestPromise = apiCall()
      .then(response => {
        // Cache the successful response
        this.setCachedData(key, response);
        return response;
      })
      .catch(error => {
        // Don't cache errors
        throw error;
      })
      .finally(() => {
        // Remove from pending requests
        this.pendingRequests.delete(key);
      });

    // Store the pending request
    this.pendingRequests.set(key, requestPromise);

    return requestPromise;
  }

  // Clear all pending requests (useful for cleanup)
  clearPendingRequests() {
    this.pendingRequests.clear();
  }
}

// Create a singleton instance
const requestManager = new RequestManager();

export default requestManager;