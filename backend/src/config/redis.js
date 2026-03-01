const { createClient } = require('redis');

// 1. Configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// 2. Initialize Client
// In v4, the API is native Promise-based
const redisClient = createClient({
  url: redisUrl,
  socket: {
    // 🛡️ RECONNECTION STRATEGY
    // Exponential backoff: 50ms, 100ms, 200ms... up to 2s
    reconnectStrategy: (retries) => {
      if (retries > 20) {
        console.error('[Redis] Maximum retries exceeded. Cache is offline.');
        // Return an error to stop retrying, or a number to wait that many ms
        return new Error('Redis Connection Failed');
      }
      return Math.min(retries * 50, 2000);
    }
  }
});

// 3. Event Listeners (Observability)
redisClient.on('connect', () => {
  console.log('🟢 [Redis] Client connected');
});

redisClient.on('ready', () => {
  console.log('🟢 [Redis] Client ready for commands');
});

redisClient.on('error', (err) => {
  console.error('🔴 [Redis Error]', err.message);
});

redisClient.on('end', () => {
  console.log('⚪ [Redis] Client disconnected');
});

/**
 * Connect Function
 * Call this in server.js after DB connection
 */
const connectRedis = async () => {
  try {
    await redisClient.connect();
    // Test Write/Read
    await redisClient.set('system_status', 'online', { EX: 60 });
  } catch (error) {
    console.error('🔴 [Redis] Initialization Failed:', error.message);
    // Unlike the DB, we rarely crash the app if Redis fails. 
    // We just fallback to DB queries (degraded performance).
  }
};

module.exports = { redisClient, connectRedis };