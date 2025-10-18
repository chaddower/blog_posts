const redis = require('redis');
const { promisify } = require('util');

class CacheService {
  constructor(redisClient, options = {}) {
    this.client = redisClient;
    this.fallbackToDatabase = options.fallbackToDatabase || true;
    this.logErrors = options.logErrors || console.error;
    
    // Promisify Redis methods for cleaner async/await
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.setex).bind(this.client);
    
    // Circuit breaker to avoid cascading failures
    this.circuitBroken = false;
    this.failureCount = 0;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetInterval = options.resetInterval || 30000; // 30 seconds
  }
  
  async get(key, dbFallbackFn) {
    if (this.circuitBroken) {
      return this._executeFallback(dbFallbackFn);
    }
    
    try {
      const cachedValue = await this.getAsync(key);
      if (cachedValue) {
        return JSON.parse(cachedValue);
      }
      return this._executeFallback(dbFallbackFn);
    } catch (error) {
      this._handleFailure(error);
      return this._executeFallback(dbFallbackFn);
    }
  }
  
  async set(key, value, ttl = 3600) {
    try {
      await this.setAsync(key, ttl, JSON.stringify(value));
    } catch (error) {
      this._handleFailure(error);
    }
  }
  
  async _executeFallback(dbFallbackFn) {
    if (!this.fallbackToDatabase || !dbFallbackFn) {
      return null;
    }
    
    try {
      return await dbFallbackFn();
    } catch (error) {
      this.logErrors('Database fallback failed:', error);
      return null;
    }
  }
  
  _handleFailure(error) {
    this.logErrors('Cache access failed:', error);
    this.failureCount++;
    
    if (this.failureCount >= this.failureThreshold) {
      this.circuitBroken = true;
      this.logErrors('Circuit breaker triggered - bypassing cache');
      
      // Auto-reset circuit breaker after interval
      setTimeout(() => {
        this.circuitBroken = false;
        this.failureCount = 0;
        this.logErrors('Circuit breaker reset');
      }, this.resetInterval);
    }
  }
}

module.exports = CacheService;