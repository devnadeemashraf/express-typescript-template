/**
 * Standard log levels
 */
export enum ELogLevel {
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
}

/**
 * Log types for directing logs to appropriate storage
 */
export enum ELogType {
  REQUEST = "request", // HTTP request logs
  ERROR = "error", // Error logs
  CONSOLE = "console", // Console-only logs (not stored in DB)
}

/**
 * Base log entry interface
 */
export interface ILogEntry {
  // Essential fields
  level: ELogLevel | string;
  message: string;
  timestamp: Date;

  // Optional fields matching our simplified schema
  service?: string;
  environment?: string;

  // Request context (simplified)
  request_id?: string;
  request_path?: string;
  request_method?: string;

  // User context
  user_id?: string;

  // Error details
  error_message?: string;
  stack_trace?: string;

  // Flexible context field
  context?: Record<string, any>;

  // Performance
  duration_ms?: number;

  // Additional metadata
  metadata?: Record<string, any>;

  // Log type (for storage routing)
  logType?: ELogType;
}

/**
 * Extended log entry with system information
 */
export interface IExtendedLogEntry extends ILogEntry {
  hostname: string;
  pid: number;
  appName: string;
  logType: ELogType;
}

/**
 * Storage provider interface for log entries
 */
export interface ILogStorage {
  storeLogs(logs: ILogEntry[]): Promise<number>;
  disconnect(): Promise<void>;
}
