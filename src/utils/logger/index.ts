import os from "os";

import { createWinstonLogger } from "./winston.config";
import { redisLogStorage } from "./redis.storage";
import { prismaLogStorage } from "./prisma.storage";

import Queue from "@/structs/queue";
import { ELogLevel, ELogType, ILogEntry } from "@/interfaces/logs";
import { env } from "@/configs";

/**
 * Extended log entry with additional system information and log type
 */
interface IExtendedLogEntry extends ILogEntry {
  hostname: string;
  pid: number;
  appName: string;
  logType: ELogType;
}

/**
 * Logger with memory queue, Redis persistence, and selective database storage
 */
export class Logger {
  private winstonLogger;
  public memoryQueue: Queue<IExtendedLogEntry>;
  private flushInterval: NodeJS.Timeout | null = null;
  private isFlushing: boolean = false;
  private readonly hostname: string;
  private readonly maxMemoryQueueSize: number;
  private readonly flushIntervalMs: number;
  private readonly isProduction: boolean;

  // Health status tracking
  private redisStatus: boolean = false;
  private prismaStatus: boolean = false;

  /**
   * Create a new logger instance
   */
  constructor({ maxMemoryQueueSize = 1000, flushIntervalMs = 5000 } = {}) {
    // Initialize components
    this.winstonLogger = createWinstonLogger();
    this.memoryQueue = new Queue<IExtendedLogEntry>();

    this.hostname = os.hostname();
    this.maxMemoryQueueSize = maxMemoryQueueSize;
    this.flushIntervalMs = flushIntervalMs;
    this.isProduction = env.nodeEnv === "production";

    // Start background processing
    this.startBackgroundProcessing();
  }

  /**
   * Initialize the logger and dependencies
   */
  async initialize(): Promise<boolean> {
    try {
      // Test Redis and Prisma connections
      this.redisStatus = await redisLogStorage
        .connect()
        .then(() => true)
        .catch(() => false);
      this.prismaStatus = await prismaLogStorage.testConnection();

      // Setup graceful shutdown after connections are established
      this.setupGracefulShutdown();

      return this.redisStatus && this.prismaStatus;
    } catch (error) {
      this.winstonLogger.error("Failed to initialize logger", { error });
      return false;
    }
  }

  /**
   * Check if the logger system is healthy
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    try {
      // Update status values
      this.redisStatus = await redisLogStorage.ping();
      this.prismaStatus = await prismaLogStorage.testConnection();

      return {
        winston: true, // Winston is always available
        redis: this.redisStatus,
        prisma: this.prismaStatus,
        memoryQueue: true,
      };
    } catch (error) {
      this.winstonLogger.error("Health check failed", { error });
      return {
        winston: true,
        redis: false,
        prisma: false,
        memoryQueue: true,
      };
    }
  }

  /**
   * Set up periodic flush
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
   */
  private enhanceLogEntry(entry: ILogEntry, logType: ELogType): IExtendedLogEntry {
    return {
      ...entry,
      hostname: this.hostname,
      pid: process.pid,
      appName: env.appName || "express-typescript-api",
      logType,
    };
  }

  /**
   * Add a log entry to memory queue with specified type
   */
  private logWithType(
    level: ELogLevel,
    message: string,
    metadata?: Record<string, any>,
    logType: ELogType = ELogType.CONSOLE
  ): void {
    // Create log entry
    const entry: ILogEntry = {
      level,
      message,
      timestamp: new Date(),
      metadata,
    };

    // Enhance with system information and log type
    const enhancedEntry = this.enhanceLogEntry(entry, logType);

    // Add to memory queue only if the log should be persisted
    if (logType !== ELogType.CONSOLE || level === ELogLevel.Error || level === ELogLevel.Warn) {
      this.memoryQueue.enqueue(enhancedEntry);

      // Flush if memory queue is getting full
      if (this.memoryQueue.size >= this.maxMemoryQueueSize) {
        this.flushToRedis();
      }

      // For errors and warnings, flush immediately to ensure they're persisted
      if (level === ELogLevel.Error || level === ELogLevel.Warn) {
        this.flushToRedis();
      }
    }

    // Log to Winston immediately for console output
    this.winstonLogger.log(level, message, metadata);
  }

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

      // Push to Redis
      await redisLogStorage.pushLogs(logs);

      // If we're in production or have errors, flush to database immediately
      const hasErrorsOrWarnings = logs.some(
        log => log.level === ELogLevel.Error || log.level === ELogLevel.Warn
      );

      if (this.isProduction || hasErrorsOrWarnings) {
        await this.flushRedisToDatabase(50);
      }
    } catch (error) {
      this.winstonLogger.error("Error flushing logs to Redis:", { error });

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

  /**
   * Flush logs from Redis to PostgreSQL database
   */
  private async flushRedisToDatabase(batchSize: number = 100): Promise<void> {
    try {
      // Get logs from Redis
      const logs = await redisLogStorage.getLogs(batchSize);

      if (logs.length === 0) {
        return;
      }

      // Separate logs by type
      const requestLogs = logs.filter(log => log.logType === ELogType.REQUEST);
      const errorLogs = logs.filter(
        log =>
          log.logType === ELogType.ERROR ||
          log.level === ELogLevel.Error ||
          log.level === ELogLevel.Warn
      );

      // Store logs in appropriate PostgreSQL tables
      if (requestLogs.length > 0) {
        await prismaLogStorage.storeRequestLogs(requestLogs);
      }

      if (errorLogs.length > 0) {
        await prismaLogStorage.storeErrorLogs(errorLogs);
      }
    } catch (error) {
      this.winstonLogger.error("Error flushing logs from Redis to PostgreSQL:", { error });
    }
  }

  /**
   * Flush all logs from memory and Redis to PostgreSQL
   */
  async flushAll(): Promise<void> {
    try {
      // First flush memory queue to Redis
      await this.flushToRedis();

      // Then flush Redis to PostgreSQL
      const count = await redisLogStorage.getLogCount();
      const batchSize = 100;

      // Process in batches to avoid memory issues
      for (let i = 0; i < count; i += batchSize) {
        await this.flushRedisToDatabase(batchSize);
      }
    } catch (error) {
      this.winstonLogger.error("Error in flushAll operation:", { error });
    }
  }

  /**
   * Log standard application logs (not stored in DB)
   */
  log(level: ELogLevel, message: string, metadata?: Record<string, any>): void {
    this.logWithType(level, message, metadata, ELogType.CONSOLE);
  }

  /**
   * Log an HTTP request (stored in DB)
   */
  logRequest(level: ELogLevel, message: string, metadata?: Record<string, any>): void {
    this.logWithType(level, message, metadata, ELogType.REQUEST);
  }

  /**
   * Log an application error (stored in DB)
   */
  logError(level: ELogLevel, message: string, metadata?: Record<string, any>): void {
    this.logWithType(level, message, metadata, ELogType.ERROR);
  }

  // Standard logging methods (console only, not stored in DB)

  /**
   * Debug level log (console only)
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log(ELogLevel.Debug, message, metadata);
  }

  /**
   * Info level log (console only)
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log(ELogLevel.Info, message, metadata);
  }

  /**
   * Warning level log (console only, but errors are stored in DB)
   */
  warn(message: string, metadata?: Record<string, any>): void {
    // Warnings are stored in error log table
    this.logError(ELogLevel.Warn, message, metadata);
  }

  /**
   * Error level log (console and DB)
   */
  error(message: string, metadata?: Record<string, any>): void {
    this.logError(ELogLevel.Error, message, metadata);
  }

  /**
   * Create a child logger with predefined metadata
   */
  child(defaultMetadata: Record<string, any> = {}): Logger {
    const childLogger = new Logger({
      maxMemoryQueueSize: this.maxMemoryQueueSize,
      flushIntervalMs: this.flushIntervalMs,
    });

    // Override log methods to include default metadata
    const methods = ["log", "logRequest", "logError", "debug", "info", "warn", "error"];
    methods.forEach(method => {
      const originalMethod = (childLogger as any)[method].bind(childLogger);
      (childLogger as any)[method] = (level: any, message: any, metadata: any = {}) => {
        if (method === "log" || method === "logRequest" || method === "logError") {
          originalMethod(level, message, { ...defaultMetadata, ...metadata });
        } else {
          originalMethod(message, { ...defaultMetadata, ...metadata });
        }
      };
    });

    return childLogger;
  }

  /**
   * Get current status of the logger system
   */
  getStatus(): Record<string, any> {
    return {
      memoryQueueSize: this.memoryQueue.size,
      memoryQueueMaxSize: this.maxMemoryQueueSize,
      redisConnected: this.redisStatus,
      prismaConnected: this.prismaStatus,
      environment: this.isProduction ? "production" : "development",
    };
  }
}

// Export singleton logger instance
export const logger = new Logger();

// Export default for convenience
export default logger;
