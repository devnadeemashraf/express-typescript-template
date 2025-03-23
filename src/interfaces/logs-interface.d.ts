/**
 * Log level enumerator
 */
export enum ELogLevel {
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
}

/**
 * Log entry interface for typed log entries
 */
export interface ILogEntry {
  level: ELogLevel;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
