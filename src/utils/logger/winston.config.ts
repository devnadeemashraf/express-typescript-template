import winston, { format } from "winston";
import { env } from "@/configs";
import { isProduction } from "@/utils/helpers";

/**
 * Winston formatter for human-readable console logs in development
 */
const developmentFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  format.colorize(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : "";
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  })
);

/**
 * Winston formatter for JSON structured logs in production
 */
const productionFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

/**
 * Create winston logger with appropriate transports
 * @returns Configured winston logger instance
 */
export function createWinstonLogger() {
  // Determine appropriate log level from environment
  const logLevel = isProduction() ? "info" : env.nodeEnv === "test" ? "warn" : "debug";

  // Create winston logger with appropriate format based on environment
  const logger = winston.createLogger({
    level: logLevel,
    format: isProduction() ? productionFormat : developmentFormat,
    defaultMeta: {
      service: env.appName,
      environment: env.nodeEnv,
    },
  });

  // In production, log to console only for warnings and errors
  if (isProduction()) {
    logger.add(
      new winston.transports.Console({
        level: "warn", // Only log warnings and errors to console in production
      })
    );
  } else {
    // In development and test, log everything to console
    logger.add(
      new winston.transports.Console({
        level: logLevel,
      })
    );
  }

  return logger;
}
