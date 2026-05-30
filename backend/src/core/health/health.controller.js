/**
 * Health Check Controller
 * Provides health check endpoints for monitoring
 */

/**
 * Get health status of the application
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
export const getHealth = (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      redis: 'unknown',
      database: 'unknown'
    }
  };

  res.json(health);
};

/**
 * Get detailed health status with service checks
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
export const getDetailedHealth = async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    memory: process.memoryUsage(),
    services: {}
  };

  // Check Redis
  try {
    const RedisClient = (await import('./redis.client.js')).default;
    await RedisClient.client.ping();
    health.services.redis = 'healthy';
  } catch (err) {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }

  // Check Database
  try {
    const Database = (await import('./db.js')).default;
    await Database.client.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch (err) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  res.json(health);
};
