import { getENV } from "@/utils/helpers";

const envConfig = {
  // App Level Configurations
  nodeEnv: getENV<string>("NODE_ENV", "development"),
  timezone: getENV<string>("TZ", "UTC"),
  appName: getENV<string>("APP_NAME", "Express TypeScript Template"),
  port: getENV<number>("PORT", 8080),

  // Security Configurations
  security: {
    cookieSecret: getENV<string>("JWT_SECRET", "super_hard_secret"),

    jwtSecret: getENV<string>("JWT_SECRET", "super_hard_secret"),
    jwtExpiration: getENV<string>("JWT_EXPIRATION", "1h"),

    corsOrigins: getENV<string>("CORS_ORIGINS", "http://localhost:3000,http://localhost:8080"),

    rateLimitMax: getENV<number>("RATE_LIMIT_MAX", 50),
    rateLimitWindow: getENV<string>("RATE_LIMIT_WINDOW", "1m"),

    sessionTimeout: getENV<number>("SESSION_TIMEOUT", 3600),
  },

  // Database Configurations
  db: {
    // App Database Configurations
    app: {
      host: getENV<string>("PG_APP_HOST", "localhost"),
      port: getENV<number>("PG_APP_PORT", 5432),
      user: getENV<string>("PG_APP_USER", "app_user"),
      password: getENV<string>("PG_APP_PASSWORD", "app_password"),
      name: getENV<string>("PG_APP_DATABASE", "app_db"),
      ssl: getENV<boolean>("PG_APP_SSL", false),
      url: getENV<string>("PG_APP_URL", "postgresql://app_user:app_password@localhost:5432/app_db"),
      poolMin: getENV<number>("PG_APP_POOL_MIN", 2),
      poolMax: getENV<number>("PG_APP_POOL_MAX", 10),
      poolIdle: getENV<number>("PG_APP_POOL_IDLE", 30000),
    },
    // Logs Database Configurations
    logs: {
      host: getENV<string>("PG_LOGS_HOST", "localhost"),
      port: getENV<number>("PG_LOGS_PORT", 5433),
      user: getENV<string>("PG_LOGS_USER", "logs_user"),
      password: getENV<string>("PG_LOGS_PASSWORD", "logs_password"),
      name: getENV<string>("PG_LOGS_DATABASE", "logs_db"),
      ssl: getENV<boolean>("PG_LOGS_SSL", false),
      url: getENV<string>(
        "PG_LOGS_URL",
        "postgresql://logs_user:logs_password@localhost:5433/logs_db"
      ),
    },
    // Redis Configurations
    redis: {
      name: getENV<number>("REDIS_DB", 0),
      host: getENV<string>("REDIS_HOST", "localhost"),
      port: getENV<number>("REDIS_PORT", 6379),
      password: getENV<string>("REDIS_PASSWORD", "redis_password"),
      ttl: getENV<number>("REDIS_TTL", 3600),
    },
  },

  // Logging Configurations
  logging: {
    level: getENV<string>("LOG_LEVEL", "debug"),
    flushInterval: getENV<number>("LOG_FLUSH_INTERVAL_MS", 5000),
    memoryQueueSize: getENV<number>("LOG_MEMORY_QUEUE_SIZE", 1000),
  },
};

export default envConfig;
