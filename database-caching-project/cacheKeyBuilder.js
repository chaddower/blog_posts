class CacheKeyBuilder {
  static userProfile(userId) {
    return `user:profile:${userId}`;
  }
  
  static userPosts(userId, page = 1) {
    return `user:${userId}:posts:page:${page}`;
  }
  
  static trending(category, timeframe = 'day') {
    return `trending:${category}:${timeframe}`;
  }
  
  static searchResults(query, filters = {}) {
    const filterString = Object.entries(filters)
      .map(([key, value]) => `${key}:${value}`)
      .sort()
      .join(':');
    
    return `search:${query}:${filterString || 'default'}`;
  }
  
  static productDetails(productId) {
    return `product:details:${productId}`;
  }
  
  static categoryProducts(categoryId, page = 1, sortBy = 'default') {
    return `category:${categoryId}:products:page:${page}:sort:${sortBy}`;
  }
  
  static userRecommendations(userId) {
    return `user:${userId}:recommendations`;
  }
  
  static globalStats() {
    return 'global:stats';
  }
}

module.exports = CacheKeyBuilder;