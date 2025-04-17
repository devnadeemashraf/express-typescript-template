import { createClient, type RedisClientType } from "redis";
import { env } from "@/configs";
import { ILogEntry } from "@/interfaces/logs";

/**
 * Redis storage provider for logs
 * Used as a high-performance buffer for logs before persistence
 */
export class RedisLogStorage {
  private client: RedisClientType;
  private connected: boolean = false;

  private readonly logListKey: string = "app:logs:queue";
  private readonly logRetentionKey: string = "app:logs:backup";

  private readonly maxRetention: number = 10000; // Max number of logs to keep in Redis backup

  /**
   * Create a new Redis log storage provider
   */
  constructor() {
    // Create Redis client with connection from environment variables
    this.client = createClient({
      url: `redis://:${env.db.redis.password}@${env.db.redis.host}:${env.db.redis.port}/${env.db.redis.name}`,
      socket: {
        reconnectStrategy: retries => {
          // Max reconnection delay of 30 seconds
          return Math.min(retries * 1000, 30000);
        },
      },
    });

    // Set up event handlers
    // TODO [devnadeemashraf]: Replace with Logger instead of console.error
    this.client.on("error", err => {
      console.error("Redis connection error:", err);
    });

    // Set connected flag on successful connection
    this.client.on("connect", () => {
      this.connected = true;
    });

    // Unset connected flag on disconnection
    this.client.on("end", () => {
      this.connected = false;
    });
  }

  /**
   * Connect to Redis if not already connected
   */
  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
    }
  }

  /**
   * Check if Redis is reachable
   * @returns Promise that resolves to true if Redis is reachable
   */
  async ping(): Promise<boolean> {
    try {
      await this.connect();
      await this.client.ping();
      return true;
    } catch (error) {
      console.error("Redis ping failed:", error);
      return false;
    }
  }

  // TODO [devnadeemashraf]: Replace with Logger instead of console.error
  /**
   * Push multiple logs to Redis
   * @param logs Array of log entries to store
   * @returns Number of logs pushed
   */
  async pushLogs(logs: ILogEntry[]): Promise<number> {
    try {
      await this.connect();

      // Serialize and push all logs to Redis list
      const multi = this.client.multi();

      for (const log of logs) {
        multi.lPush(this.logListKey, JSON.stringify(log));

        // Also maintain a backup of critical logs
        if (log.level === "error" || log.level === "warn") {
          multi.lPush(this.logRetentionKey, JSON.stringify(log));
          // Trim the backup list to keep it from growing too large
          multi.lTrim(this.logRetentionKey, 0, this.maxRetention - 1);
        }
      }

      await multi.exec();
      return logs.length;
    } catch (error) {
      console.error("Failed to push logs to Redis:", error);
      return 0;
    }
  }

  // TODO [devnadeemashraf]: Replace with Logger instead of console.error
  /**
   * Get logs from Redis queue (FIFO)
   * @param count Number of logs to retrieve
   * @returns Array of log entries
   */
  async getLogs(count: number = 100): Promise<ILogEntry[]> {
    try {
      await this.connect();

      // Get logs and remove them from Redis in one atomic operation using multi
      const multi = this.client.multi();

      // Get logs from the right side (oldest first - FIFO queue)
      multi.lRange(this.logListKey, -count, -1);

      // Remove the logs we've retrieved
      multi.lTrim(this.logListKey, 0, -count - 1);

      // Execute both commands
      const results = await multi.exec();

      // Parse log entries
      const logs = (results[0] as string[]).map(item => JSON.parse(item) as ILogEntry);

      return logs.reverse(); // Return in chronological order
    } catch (error) {
      console.error("Failed to get logs from Redis:", error);
      return [];
    }
  }

  // TODO [devnadeemashraf]: Replace with Logger instead of console.error
  /**
   * Get log count
   * @returns Number of logs in queue
   */
  async getLogCount(): Promise<number> {
    try {
      await this.connect();
      return await this.client.lLen(this.logListKey);
    } catch (error) {
      console.error("Failed to get log count from Redis:", error);
      return 0;
    }
  }

  // TODO [devnadeemashraf]: Replace with Logger instead of console.error
  /**
   * Clear all logs
   */
  async clearLogs(): Promise<void> {
    try {
      await this.connect();
      await this.client.del(this.logListKey);
    } catch (error) {
      console.error("Failed to clear logs from Redis:", error);
    }
  }

  // TODO [devnadeemashraf]: Replace with Logger instead of console.error
  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.quit();
      this.connected = false;
    }
  }
}

// Export singleton instance
export const redisLogStorage = new RedisLogStorage();
