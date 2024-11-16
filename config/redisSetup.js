const { Redis } = require('@upstash/redis');

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const connectRedis = async () => {
  try {
    console.log('Redis client initialized!');
  } catch (error) {
    console.error('Error initializing Redis:', error);
  }
}

module.exports = { connectRedis, redisClient };
