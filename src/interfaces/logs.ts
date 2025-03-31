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
 * Base log entry interface
 */
export interface ILogEntry {
  level: ELogLevel | string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Log entry context for request details
 */
export interface IRequestContext {
  method?: string;
  path?: string;
  url?: string;
  query?: Record<string, any>;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
}

/**
 * Log entry context for user details
 */
export interface IUserContext {
  id?: string | number;
  email?: string;
  role?: string;
  permissions?: string[];
  firstName?: string;
  lastName?: string;
}

/**
 * Log entry context for error details
 */
export interface IErrorContext {
  message?: string;
  name?: string;
  code?: string;
  type?: string;
  stack?: string;
  statusCode?: number;
  details?: any;
}

/**
 * Log entry context for performance metrics
 */
export interface IPerformanceContext {
  duration?: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

/**
 * Complete log entry metadata
 */
export interface ILogMetadata {
  service?: string;
  subsystem?: string;
  category?: string;
  eventType?: string;

  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  requestId?: string;

  host?: string;
  environment?: string;

  request?: IRequestContext;
  user?: IUserContext;
  error?: IErrorContext;
  duration?: number;

  context?: Record<string, any>;
  response?: any;

  businessId?: string;
  businessAction?: string;
  businessResult?: string;
  businessValue?: number;

  [key: string]: any;
}

/**
 * Storage provider interface for log entries
 */
export interface ILogStorage {
  storeLogs(logs: ILogEntry[]): Promise<number>;
  disconnect(): Promise<void>;
}
