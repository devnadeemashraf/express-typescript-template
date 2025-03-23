import { getENV } from "@/utils/env-helper";

const envConfig = {
  nodeEnv: getENV<string>("NODE_ENV", "development"),
  timezone: getENV<string>("TZ", "UTC"),

  appName: getENV<string>("APP_NAME", "Express TypeScript Template"),
  port: getENV<number>("PORT", 8080),

  security: {
    jwtSecret: getENV<string>("JWT_SECRET", "super_hard_secret"),
    jwtExpiration: getENV<string>("JWT_EXPIRATION", "1h"),

    corsOrigins: getENV<string>("CORS_ORIGINS", "http://localhost:3000,http://localhost:8080"),

    rateLimitMax: getENV<number>("RATE_LIMIT_MAX", 50),
    rateLimitWindow: getENV<string>("RATE_LIMIT_WINDOW", "1m"),

    sessionTimeout: getENV<number>("SESSION_TIMEOUT", 3600),
  },
};

export default envConfig;
