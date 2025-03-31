import os from "os";

import { createWinstonLogger } from "./winston.config";
import { redisLogStorage } from "./redis.storage";
import { prismaLogStorage } from "./prisma.storage";

import Queue from "@/structs/queue";
import { ELogLevel, ILogEntry } from "@/interfaces/logs";
import { env } from "@/configs";

/**
 * Extended log entry with additional system information
 */
interface IExtendedLogEntry extends ILogEntry {
  hostname: string;
  pid: number;
  appName: string;
}

/**
 * Advanced logger with memory queue, Redis persistence, and database storage
 */
export class Logger {
  private winstonLogger;
  private memoryQueue: Queue<ILogEntry>;
  private flushInterval: NodeJS.Timeout | null = null;
  private isFlushing: boolean = false;
  private readonly hostname: string;
  private readonly maxMemoryQueueSize: number;
  private readonly flushIntervalMs: number;
  private readonly isProduction: boolean;

  /**
   * Create a new logger instance
   * @param options Logger configuration options
   */
  constructor({ maxMemoryQueueSize = 1000, flushIntervalMs = 5000 } = {}) {
    // Initialize components
    this.winstonLogger = createWinstonLogger();
    this.memoryQueue = new Queue<ILogEntry>();

    this.hostname = os.hostname();

    this.maxMemoryQueueSize = maxMemoryQueueSize;
    this.flushIntervalMs = flushIntervalMs;

    this.isProduction = env.nodeEnv === "production";

    // Start background processing
    this.startBackgroundProcessing();

    // Handle graceful shutdown
    this.setupGracefulShutdown();
  }

  /**
   * Set up periodic flush and shutdown handlers
   */
  private startBackgroundProcessing(): void {
    // Set up interval to flush logs periodically
    this.flushInterval = setInterval(() => {
      this.flushToRedis();
    }, this.flushIntervalMs);

    // Ensure interval doesn't prevent Node from exiting
    if (this.flushInterval.unref) {
      this.flushInterval.unref();
    }
  }

  // TODO [devnadeemashraf]: Figure out how will this graceful shutdown work with the server-level shutdown logic
  /**
   * Handle graceful shutdown of logger
   */
  private setupGracefulShutdown(): void {
    const shutdownHandler = async () => {
      // Flush any remaining logs
      await this.flushAll();

      // Clean up interval
      if (this.flushInterval) {
        clearInterval(this.flushInterval);
        this.flushInterval = null;
      }

      // Disconnect from Redis and PostgreSQL
      await redisLogStorage.disconnect();
      await prismaLogStorage.disconnect();
    };

    // Add shutdown handlers
    process.on("SIGTERM", shutdownHandler);
    process.on("SIGINT", shutdownHandler);
    process.on("beforeExit", shutdownHandler);
  }

  /**
   * Add common fields to log entry
   * @param entry Basic log entry
   * @returns Extended log entry with system information
   */
  private enhanceLogEntry(entry: ILogEntry): IExtendedLogEntry {
    return {
      ...entry,
      hostname: this.hostname,
      pid: process.pid,
      appName: env.appName || "express-typescript-api",
    };
  }

  /**
   * Add a log entry to memory queue
   * @param level Log level
   * @param message Log message
   * @param metadata Additional metadata
   */
  log(level: ELogLevel, message: string, metadata?: Record<string, any>): void {
    // Create log entry
    const entry: ILogEntry = {
      level,
      message,
      timestamp: new Date(),
      metadata,
    };

    // Add to memory queue
    this.memoryQueue.enqueue(entry);

    // Log to Winston immediately for console output
    this.winstonLogger.log(level, message, metadata);

    // Flush if memory queue is getting full
    if (this.memoryQueue.size >= this.maxMemoryQueueSize) {
      this.flushToRedis();
    }

    // For critical errors, flush immediately to ensure they're persisted
    if (level === ELogLevel.Error) {
      this.flushToRedis();
    }
  }

  // TODO [devnadeemashraf]: Replace with Logger instead of console.error
  /**
   * Flush memory queue to Redis
   */
  private async flushToRedis(): Promise<void> {
    if (this.isFlushing || this.memoryQueue.isEmpty()) {
      return;
    }

    this.isFlushing = true;

    try {
      // Get all logs from memory queue
      const logs = this.memoryQueue.toArray();

      // Clear memory queue
      this.memoryQueue.clear();

      // Enhance logs with system information
      const enhancedLogs = logs.map(log => this.enhanceLogEntry(log));

      // Push to Redis
      await redisLogStorage.pushLogs(enhancedLogs);

      // If we're in production, trigger immediate storage to PostgreSQL
      // In development, this happens on a schedule to reduce database writes
      if (this.isProduction && enhancedLogs.some(log => log.level === ELogLevel.Error)) {
        await this.flushRedisToDatabase(50);
      }
    } catch (error) {
      console.error("Error flushing logs to Redis:", error);

      // If Redis flush fails, put logs back in memory queue
      // but avoid infinite growth
      const logs = this.memoryQueue.toArray().slice(0, this.maxMemoryQueueSize);
      for (const log of logs) {
        this.memoryQueue.enqueue(log);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  // TODO [devnadeemashraf]: Replace with Logger instead of console.error
  /**
   * Flush logs from Redis to PostgreSQL database
   * @param batchSize Number of logs to process in one batch
   */
  private async flushRedisToDatabase(batchSize: number = 100): Promise<void> {
    try {
      // Get logs from Redis
      const logs = await redisLogStorage.getLogs(batchSize);

      if (logs.length === 0) {
        return;
      }

      // Store logs in PostgreSQL
      await prismaLogStorage.storeLogs(logs);
    } catch (error) {
      console.error("Error flushing logs from Redis to PostgreSQL:", error);
    }
  }

  /**
   * Flush all logs from memory and Redis to PostgreSQL
   */
  async flushAll(): Promise<void> {
    // First flush memory queue to Redis
    await this.flushToRedis();

    // Then flush Redis to PostgreSQL
    const count = await redisLogStorage.getLogCount();
    const batchSize = 100;

    // Process in batches to avoid memory issues
    for (let i = 0; i < count; i += batchSize) {
      await this.flushRedisToDatabase(batchSize);
    }
  }

  /**
   * Debug level log
   * @param message Message to log
   * @param metadata Additional metadata
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log(ELogLevel.Debug, message, metadata);
  }

  /**
   * Info level log
   * @param message Message to log
   * @param metadata Additional metadata
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log(ELogLevel.Info, message, metadata);
  }

  /**
   * Warning level log
   * @param message Message to log
   * @param metadata Additional metadata
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log(ELogLevel.Warn, message, metadata);
  }

  /**
   * Error level log
   * @param message Message to log
   * @param metadata Additional metadata
   */
  error(message: string, metadata?: Record<string, any>): void {
    this.log(ELogLevel.Error, message, metadata);
  }

  /**
   * Create a child logger with predefined metadata
   * @param defaultMetadata Default metadata to include with all logs
   * @returns Child logger instance
   */
  child(defaultMetadata: Record<string, any> = {}): Logger {
    const childLogger = new Logger({
      maxMemoryQueueSize: this.maxMemoryQueueSize,
      flushIntervalMs: this.flushIntervalMs,
    });

    // Override log method to include default metadata
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level, message, metadata = {}) => {
      originalLog(level, message, { ...defaultMetadata, ...metadata });
    };

    return childLogger;
  }

  /**
   * Create a request-scoped logger
   * @param req Express request object
   * @returns Request-scoped logger
   */
  requestLogger(req: any): Logger {
    return this.child({
      requestId: req.id,
      request: {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      },
      user: req.user
        ? {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
          }
        : undefined,
    });
  }

  /**
   * Create an API request logger middleware
   * @returns Express middleware function
   */
  requestLoggerMiddleware() {
    return (req: any, res: any, next: any) => {
      // Create start time for request duration calculation
      const startTime = Date.now();

      // Create request-scoped logger
      const requestLogger = this.requestLogger(req);

      // Log request
      requestLogger.info(`${req.method} ${req.path}`, {
        query: req.query,
        params: req.params,
        // Don't log body for GET/HEAD requests or files uploads
        body:
          req.method === "GET" ||
          req.method === "HEAD" ||
          (req.headers["content-type"] || "").includes("multipart/form-data")
            ? undefined
            : this.sanitizeBody(req.body),
      });

      // Capture response data
      const oldSend = res.send;
      res.send = function (data: any) {
        res.responseData = data;
        return oldSend.apply(res, arguments as any);
      };

      // Log on completion
      res.on("finish", () => {
        const duration = Date.now() - startTime;
        const level =
          res.statusCode >= 500
            ? ELogLevel.Error
            : res.statusCode >= 400
              ? ELogLevel.Warn
              : ELogLevel.Info;

        requestLogger.log(level, `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
          response: {
            statusCode: res.statusCode,
            duration,
            size: res.get("content-length"),
            // Only log response body for errors in development
            body:
              level !== ELogLevel.Info && !this.isProduction
                ? this.truncateResponseBody(res.responseData)
                : undefined,
          },
        });
      });

      // Attach logger to request for use in route handlers
      req.logger = requestLogger;

      next();
    };
  }

  // TODO [devnadeemashraf]: Figure out better way of handling sensitive fields
  /**
   * Sanitize request body to remove sensitive information
   * @param body Request body
   * @returns Sanitized body
   */
  private sanitizeBody(body: any): any {
    if (!body) return undefined;

    const sensitiveFields = [
      "password",
      "secret",
      "token",
      "apiKey",
      "api_key",
      "key",
      "Authorization",
      "auth",
      "credentials",
      "credit_card",
      "creditCard",
    ];

    const sanitized = { ...body };

    // Sanitize sensitive fields
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  /**
   * Truncate response body to avoid huge log entries
   * @param body Response body
   * @returns Truncated body
   */
  private truncateResponseBody(body: any): any {
    if (!body) return undefined;

    try {
      // If it's a JSON string, parse it
      const parsed = typeof body === "string" ? JSON.parse(body) : body;

      // Limit size of nested objects
      const truncateObject = (obj: any, depth: number = 0): any => {
        if (depth > 2) return "[Object]";
        if (Array.isArray(obj)) {
          return obj.length > 5
            ? [
                ...obj.slice(0, 5).map(item => truncateObject(item, depth + 1)),
                `... (${obj.length - 5} more)`,
              ]
            : obj.map(item => truncateObject(item, depth + 1));
        }
        if (obj && typeof obj === "object") {
          const result: Record<string, any> = {};
          for (const key of Object.keys(obj).slice(0, 10)) {
            result[key] = truncateObject(obj[key], depth + 1);
          }
          if (Object.keys(obj).length > 10) {
            result["..."] = `(${Object.keys(obj).length - 10} more properties)`;
          }
          return result;
        }
        return obj;
      };

      return truncateObject(parsed);
    } catch (e) {
      // If parsing fails, return truncated string
      return typeof body === "string" && body.length > 500
        ? body.substring(0, 500) + "... (truncated)"
        : body;
    }
  }
}

// Export singleton logger instance
export const logger = new Logger();

// Export default for convenience
export default logger;
