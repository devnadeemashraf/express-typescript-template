import {
  HTTP_STATUS_CODES,
  HTTP_STATUS_MESSAGES,
  THttpResponse,
  isClientError,
  isServerError,
} from "@/utils/http-status-codes";
import { env } from "@/configs";

/**
 * Error options interface for AppError constructor
 */
interface IErrorOptions {
  isOperational?: boolean;
  errorCode?: string;
  details?: Record<string, any>;
  source?: string;
  tags?: string[];
}

/**
 * Application error class for standardized error handling
 * Extends the built-in Error class with additional properties for API responses
 */
class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;
  public readonly details?: Record<string, any>;
  public readonly timestamp: Date;
  public readonly source?: string;
  public readonly tags?: string[];

  /**
   * Create a new application error
   * @param statusType HTTP status type from THttpResponse enum
   * @param message Error message (overrides default HTTP status message if provided)
   * @param options Additional error options
   */
  constructor(statusType: THttpResponse, message?: string, options: IErrorOptions = {}) {
    const code = HTTP_STATUS_CODES[statusType];
    const errorMessage = message || HTTP_STATUS_MESSAGES[code];
    super(errorMessage);

    // Assign properties
    this.statusCode = code;
    this.isOperational = options.isOperational ?? true; // Default to operational error
    this.errorCode = options.errorCode;
    this.details = options.details;
    this.timestamp = new Date();
    this.source = options.source;
    this.tags = options.tags;

    // Set error name to match class name (maintains proper inheritance)
    this.name = this.constructor.name;

    // Capture stack trace (exclude constructor call from stack trace)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts the error to a plain object format suitable for responses
   */
  toJSON() {
    return {
      status: "error",
      statusCode: this.statusCode,
      message: this.message,
      errorCode: this.errorCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      source: this.source,
      tags: this.tags,
      ...(env.nodeEnv === "development" && { stack: this.stack }),
    };
  }

  /**
   * Check if the error is a client error (4xx)
   */
  isClientError(): boolean {
    return isClientError(this.statusCode);
  }

  /**
   * Check if the error is a server error (5xx)
   */
  isServerError(): boolean {
    return isServerError(this.statusCode);
  }

  /**
   * Creates a 400 Bad Request error
   */
  static badRequest(message?: string, options: IErrorOptions = {}) {
    return new AppError("BAD_REQUEST", message, options);
  }

  /**
   * Creates a 401 Unauthorized error
   */
  static unauthorized(message?: string, options: IErrorOptions = {}) {
    return new AppError("UNAUTHORIZED", message, options);
  }

  /**
   * Creates a 403 Forbidden error
   */
  static forbidden(message?: string, options: IErrorOptions = {}) {
    return new AppError("FORBIDDEN", message, options);
  }

  /**
   * Creates a 404 Not Found error
   */
  static notFound(message?: string, options: IErrorOptions = {}) {
    return new AppError("NOT_FOUND", message, options);
  }

  /**
   * Creates a 409 Conflict error
   */
  static conflict(message?: string, options: IErrorOptions = {}) {
    return new AppError("CONFLICT", message, options);
  }

  /**
   * Creates a 422 Unprocessable Entity error (often used for validation errors)
   */
  static unprocessableEntity(message?: string, options: IErrorOptions = {}) {
    return new AppError("UNPROCESSABLE_ENTITY", message, options);
  }

  /**
   * Creates a 429 Too Many Requests error
   */
  static tooManyRequests(message?: string, options: IErrorOptions = {}) {
    return new AppError("TOO_MANY_REQUESTS", message, options);
  }

  /**
   * Creates a 500 Internal Server error
   */
  static internal(message?: string, options: IErrorOptions = {}) {
    return new AppError("INTERNAL_SERVER_ERROR", message, {
      isOperational: false,
      ...options,
    });
  }

  /**
   * Creates a 502 Bad Gateway error
   */
  static badGateway(message?: string, options: IErrorOptions = {}) {
    return new AppError("BAD_GATEWAY", message, options);
  }

  /**
   * Creates a 503 Service Unavailable error
   */
  static serviceUnavailable(message?: string, options: IErrorOptions = {}) {
    return new AppError("SERVICE_UNAVAILABLE", message, options);
  }

  /**
   * Creates a 504 Gateway Timeout error
   */
  static gatewayTimeout(message?: string, options: IErrorOptions = {}) {
    return new AppError("GATEWAY_TIMEOUT", message, options);
  }

  /**
   * Create an error from any error instance
   * Useful for wrapping errors from external libraries
   */
  static from(
    error: Error,
    statusType: THttpResponse = "INTERNAL_SERVER_ERROR",
    options: IErrorOptions = {}
  ) {
    return new AppError(statusType, error.message, {
      details: { originalError: error.name, stack: error.stack },
      isOperational: false,
      ...options,
    });
  }

  /**
   * Create an application error with appropriate status based on error code patterns
   * This is useful for database or external API errors that have specific codes
   */
  static fromErrorCode(errorCode: string, message: string, options: IErrorOptions = {}) {
    // Common database error codes (PostgreSQL)
    if (/^23/.test(errorCode)) {
      // 23xxx are integrity constraint violations
      return AppError.badRequest(message, { errorCode, ...options });
    }

    if (/^28/.test(errorCode)) {
      // 28xxx are authorization errors
      return AppError.forbidden(message, { errorCode, ...options });
    }

    if (/^42/.test(errorCode)) {
      // 42xxx are syntax or access rule errors
      return AppError.badRequest(message, { errorCode, ...options });
    }

    // Default to server error for unknown codes
    return AppError.internal(message, { errorCode, ...options });
  }
}

export default AppError;
