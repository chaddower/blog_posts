const CacheKeyBuilder = require('./cacheKeyBuilder');

class CacheInvalidation {
  constructor(cacheService) {
    this.cacheService = cacheService;
  }

  async invalidateUserProfile(userId) {
    const key = CacheKeyBuilder.userProfile(userId);
    await this.cacheService.client.del(key);
  }

  async invalidateUserPosts(userId) {
    const pattern = CacheKeyBuilder.userPosts(userId, '*');
    await this.deleteByPattern(pattern);
  }

  async invalidateSearchResults(query) {
    const pattern = `search:${query}:*`;
    await this.deleteByPattern(pattern);
  }

  async invalidateProductDetails(productId) {
    const key = CacheKeyBuilder.productDetails(productId);
    await this.cacheService.client.del(key);
  }

  async invalidateCategoryProducts(categoryId) {
    const pattern = `category:${categoryId}:products:*`;
    await this.deleteByPattern(pattern);
  }

  async invalidateGlobalStats() {
    const key = CacheKeyBuilder.globalStats();
    await this.cacheService.client.del(key);
  }

  async deleteByPattern(pattern) {
    const keys = await this.cacheService.client.keys(pattern);
    if (keys.length > 0) {
      await this.cacheService.client.del(keys);
    }
  }

  async refreshUserRecommendations(userId) {
    const key = CacheKeyBuilder.userRecommendations(userId);
    // This method would typically involve re-computing recommendations
    // and updating the cache, rather than just invalidating
    // For demonstration, we'll just invalidate
    await this.cacheService.client.del(key);
  }

  async updateWithWriteThrough(key, value, ttl = 3600) {
    // Update cache first
    await this.cacheService.set(key, value, ttl);
    // Then update database (this is a placeholder - real implementation would depend on your DB setup)
    await this.updateDatabase(key, value);
  }

  async updateDatabase(key, value) {
    // Placeholder for database update logic
    console.log(`Updating database for key: ${key} with value:`, value);
    // Implement actual database update here
  }
}

module.exports = CacheInvalidation;