import { ELogType, ILogEntry } from "@/interfaces/logs";
import { logsDB } from "@/db";
import { env } from "@/configs";

/**
 * PostgreSQL storage provider for logs using Prisma
 */
export class PrismaLogStorage {
  private prisma: any;
  isConnected: boolean = false;

  constructor() {
    // Initialize Prisma client for logs database
    try {
      this.prisma = logsDB.getClient();
      this.isConnected = true;
    } catch (error) {
      console.error("Failed to initialize Prisma client for logs:", error);
      this.isConnected = false;
    }
  }

  /**
   * Map log entry to Prisma RequestLog model format
   */
  private mapToRequestLogFormat(log: ILogEntry) {
    // Map log level to Prisma LogLevel enum
    const levelMap: Record<string, any> = {
      debug: "DEBUG",
      info: "INFO",
      warn: "WARNING",
      error: "ERROR",
    };

    return {
      level: levelMap[log.level] || "INFO",
      message: log.message,
      timestamp: log.timestamp,

      // Basic context
      service: log.service || log.metadata?.service,
      environment: log.environment || env.nodeEnv || "development",

      // Request context
      request_id: log.request_id || log.metadata?.request_id,
      request_path: log.request_path || log.metadata?.request_path,
      request_method: log.request_method || log.metadata?.request_method,

      // User and performance
      user_id: log.user_id || log.metadata?.user_id,
      status_code: log.metadata?.status_code,
      duration_ms: log.duration_ms || log.metadata?.duration_ms,

      // Additional context
      context: log.context || log.metadata ? JSON.stringify(log.metadata) : null,
    };
  }

  /**
   * Map log entry to Prisma ErrorLog model format
   */
  private mapToErrorLogFormat(log: ILogEntry) {
    // Map log level to Prisma LogLevel enum
    const levelMap: Record<string, any> = {
      debug: "DEBUG",
      info: "INFO",
      warn: "WARNING",
      error: "ERROR",
    };

    // Extract error information
    const error = log.metadata?.error || {};

    return {
      level: levelMap[log.level] || "ERROR",
      message: log.message,
      timestamp: log.timestamp,

      // Error details
      error_name: error.name || log.metadata?.errorName,
      stack_trace: log.stack_trace || error.stack,

      // Context
      service: log.service || log.metadata?.service,
      environment: log.environment || env.nodeEnv || "development",
      component: log.metadata?.component,

      // Request context if available
      request_id: log.request_id || log.metadata?.request_id,

      // Additional context
      context: log.context || log.metadata ? JSON.stringify(log.metadata) : null,
    };
  }

  /**
   * Store request logs in PostgreSQL database
   */
  async storeRequestLogs(logs: ILogEntry[]): Promise<number> {
    if (!this.isConnected || logs.length === 0) {
      return 0;
    }

    try {
      const prismaLogs = logs.map(log => this.mapToRequestLogFormat(log));

      const result = await this.prisma.log.createMany({
        data: prismaLogs,
        skipDuplicates: true,
      });

      return result.count;
    } catch (error) {
      console.error("Failed to store request logs in PostgreSQL:", error);
      this.isConnected = false;
      return 0;
    }
  }

  /**
   * Store error logs in PostgreSQL database
   */
  async storeErrorLogs(logs: ILogEntry[]): Promise<number> {
    if (!this.isConnected || logs.length === 0) {
      return 0;
    }

    try {
      const prismaLogs = logs.map(log => this.mapToErrorLogFormat(log));

      const result = await this.prisma.errorLog.createMany({
        data: prismaLogs,
        skipDuplicates: true,
      });

      return result.count;
    } catch (error) {
      console.error("Failed to store error logs in PostgreSQL:", error);
      this.isConnected = false;
      return 0;
    }
  }

  /**
   * Store logs in appropriate tables based on type
   * @deprecated Use storeRequestLogs or storeErrorLogs instead
   */
  async storeLogs(logs: ILogEntry[]): Promise<number> {
    // Split logs by type
    const requestLogs = logs.filter(log => log.logType === ELogType.REQUEST);
    const errorLogs = logs.filter(
      log => log.logType === ELogType.ERROR || log.level === "error" || log.level === "warn"
    );

    let count = 0;

    // Store in appropriate tables
    if (requestLogs.length > 0) {
      count += await this.storeRequestLogs(requestLogs);
    }

    if (errorLogs.length > 0) {
      count += await this.storeErrorLogs(errorLogs);
    }

    return count;
  }

  /**
   * Close Prisma connection
   */
  async disconnect(): Promise<void> {
    if (this.prisma) {
      try {
        await this.prisma.$disconnect();
      } catch (error) {
        console.error("Error disconnecting from Prisma:", error);
      }
      this.isConnected = false;
    }
  }

  /**
   * Test the database connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.prisma) {
      return false;
    }

    try {
      // Simple query to test the connection
      await this.prisma.$queryRaw`SELECT 1`;
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Prisma connection test failed:", error);
      this.isConnected = false;
      return false;
    }
  }
}

// Export singleton instance
export const prismaLogStorage = new PrismaLogStorage();
