const redis = require('redis');
const CacheService = require('./cacheService');
const CacheKeyBuilder = require('./cacheKeyBuilder');
const CacheMetrics = require('./cacheMetrics');
const CacheInvalidation = require('./cacheInvalidation');
const ShardedCache = require('./cacheSharding');

// Setup Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Initialize services
const cacheService = new CacheService(redisClient);
const cacheMetrics = new CacheMetrics();
const cacheInvalidation = new CacheInvalidation(cacheService);

// Example usage
async function main() {
  await redisClient.connect();

  // Caching a user profile
  const userId = '123';
  const userProfileKey = CacheKeyBuilder.userProfile(userId);
  const userProfile = { id: userId, name: 'John Doe', email: 'john@example.com' };

  await cacheService.set(userProfileKey, userProfile);
  console.log('Cached user profile');

  // Retrieving cached user profile
  const start = Date.now();
  const cachedProfile = await cacheService.get(userProfileKey);
  const end = Date.now();

  if (cachedProfile) {
    console.log('Retrieved cached profile:', cachedProfile);
    cacheMetrics.recordHit(end - start);
  } else {
    console.log('Cache miss for user profile');
    cacheMetrics.recordMiss();
  }

  // Invalidating user profile cache
  await cacheInvalidation.invalidateUserProfile(userId);
  console.log('Invalidated user profile cache');

  // Demonstrating cache metrics
  console.log('Cache Metrics:', cacheMetrics.getMetricsSummary());

  // Example of cache sharding (not actually connecting to multiple Redis instances)
  const shardedCache = new ShardedCache([redisClient, redisClient, redisClient]);
  await shardedCache.set('sharded:key', 'sharded value', 3600);
  const shardedValue = await shardedCache.get('sharded:key');
  console.log('Sharded cache value:', shardedValue);

  // Cleanup
  await redisClient.quit();
}

main().catch(console.error);