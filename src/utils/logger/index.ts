import Queue from "@/structs/queue";

import { ELogLevel, ILogEntry } from "@/interfaces/logs-interface";

/**
 * Specialized queue for handling log entries
 */
export class LogsQueue extends Queue<ILogEntry> {
  /**
   * Maximum size of the logs queue
   */
  private _maxSize: number;

  /**
   * Create a new logs queue
   * @param maxSize Maximum number of logs to store before auto-flushing (default: 100)
   */
  constructor(maxSize: number = 10_000) {
    super();
    this._maxSize = maxSize;
  }

  /**
   * Add a log entry to the queue
   * @param level Log level
   * @param message Log message
   * @param metadata Additional data
   * @returns Current queue size
   */
  log(level: ILogEntry["level"], message: string, metadata?: Record<string, any>): number {
    const entry: ILogEntry = {
      level,
      message,
      timestamp: new Date(),
      metadata,
    };

    const size = this.enqueue(entry);

    // Auto-flush if we've reached max size
    if (size >= this._maxSize) {
      this.flush();
    }

    return size;
  }

  /**
   * Convenience method for debug logs
   */
  debug(message: string, metadata?: Record<string, any>): number {
    return this.log(ELogLevel.Debug, message, metadata);
  }

  /**
   * Convenience method for info logs
   */
  info(message: string, metadata?: Record<string, any>): number {
    return this.log(ELogLevel.Info, message, metadata);
  }

  /**
   * Convenience method for warning logs
   */
  warn(message: string, metadata?: Record<string, any>): number {
    return this.log(ELogLevel.Warn, message, metadata);
  }

  /**
   * Convenience method for error logs
   */
  error(message: string, metadata?: Record<string, any>): number {
    return this.log(ELogLevel.Error, message, metadata);
  }

  /**
   * Process all logs in the queue
   * Override this in subclass to implement actual processing
   */
  flush(): ILogEntry[] {
    const logs = this.toArray();
    this.clear();
    return logs;
  }

  /**
   * Get logs by level
   * @param level The log level to filter by
   * @returns Array of matching log entries
   */
  getByLevel(level: ILogEntry["level"]): ILogEntry[] {
    return this.toArray().filter(entry => entry.level === level);
  }

  /**
   * Set max queue size before auto-flushing
   */
  set maxSize(value: number) {
    if (value < 1) {
      throw new Error("Queue max size must be at least 1");
    }
    this._maxSize = value;
  }

  /**
   * Get current max queue size setting
   */
  get maxSize(): number {
    return this._maxSize;
  }
}

export default LogsQueue;
