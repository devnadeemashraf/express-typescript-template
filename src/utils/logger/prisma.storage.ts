import { PrismaClient } from "@prisma/client";
import { ILogEntry } from "@/interfaces/logs";
import { env } from "@/configs";

/**
 * PostgreSQL storage provider for logs using Prisma
 */
export class PrismaLogStorage {
  private prisma: PrismaClient;
  private isConnected: boolean = false;

  // TODO [devnadeemashraf]: Replace with Logger instead of console.error
  /**
   * Create a new Prisma log storage provider
   */
  constructor() {
    // Initialize Prisma client for logs database
    try {
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: env.db.logs.url,
          },
        },
      });
      this.isConnected = true;
    } catch (error) {
      console.error("Failed to initialize Prisma client for logs:", error);
      this.isConnected = false;
    }
  }

  // TODO [devnadeemashraf]: Replace with Logger instead of console.error
  // TODO [devnadeemashraf]: Update levelMap to use LogLevel enum from Prisma
  /**
   * Map ILogEntry to Prisma Log model format
   * @param log Log entry to map
   * @returns Log entry in Prisma format
   */
  private mapLogToPrismaFormat(log: ILogEntry) {
    // Map log level to Prisma LogLevel enum
    const levelMap: Record<string, any> = {
      debug: "DEBUG",
      info: "INFO",
      warn: "WARNING",
      error: "ERROR",
    };

    // Extract request details if available
    const requestDetails = log.metadata?.request || {};
    const userDetails = log.metadata?.user || {};
    const errorDetails = log.metadata?.error || {};

    return {
      level: levelMap[log.level] || "INFO",
      message: log.message,
      timestamp: log.timestamp,

      // Classification fields
      environment: env.nodeEnv || "development",
      service: log.metadata?.service || "api",
      subsystem: log.metadata?.subsystem,
      category: log.metadata?.category,
      event_type: log.metadata?.eventType,

      // Request context
      trace_id: log.metadata?.traceId,
      request_id: log.metadata?.requestId,
      request_path: requestDetails.path,
      request_method: requestDetails.method,

      // User context
      user_id: userDetails.id,
      user_email: userDetails.email,
      user_role: userDetails.role,
      session_id: requestDetails.sessionId,

      // Technical context
      host: log.metadata?.host,
      ip: requestDetails.ip,
      user_agent: requestDetails.userAgent,

      // Performance metrics
      duration_ms: log.metadata?.duration,

      // Error details
      error_code: errorDetails.code,
      error_type: errorDetails.type,
      stack_trace: errorDetails.stack,

      // Additional data
      context: log.metadata?.context ? JSON.stringify(log.metadata.context) : null,
      metadata: log.metadata ? JSON.stringify(log.metadata) : null,
      request_body: requestDetails.body ? JSON.stringify(requestDetails.body) : null,
      response_body: log.metadata?.response ? JSON.stringify(log.metadata.response) : null,

      // Business metrics
      business_id: log.metadata?.businessId,
      business_action: log.metadata?.businessAction,
      business_result: log.metadata?.businessResult,
      business_value: log.metadata?.businessValue,
    };
  }

  // TODO [devnadeemashraf]: Replace with Logger instead of console.error
  /**
   * Store logs in PostgreSQL database
   * @param logs Array of log entries to store
   * @returns Number of logs stored successfully
   */
  async storeLogs(logs: ILogEntry[]): Promise<number> {
    if (!this.isConnected || logs.length === 0) {
      return 0;
    }

    try {
      // Map logs to Prisma format
      const prismaLogs = logs.map(log => this.mapLogToPrismaFormat(log));

      // Use createMany for bulk insert
      const result = await this.prisma.log.createMany({
        data: prismaLogs,
        skipDuplicates: true, // Skip logs with duplicate IDs
      });

      return result.count;
    } catch (error) {
      console.error("Failed to store logs in PostgreSQL:", error);
      return 0;
    }
  }

  /**
   * Close Prisma connection
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.prisma.$disconnect();
      this.isConnected = false;
    }
  }
}

// Export singleton instance
export const prismaLogStorage = new PrismaLogStorage();
