import { Request, Response, NextFunction } from "express";
import AppError from "@/structs/app-error";
import { logger } from "@/utils/logger";
import { isProduction } from "@/utils/helpers";
import { HTTP_STATUS_CODES } from "@/utils/http-status-codes";
import { IErrorResponse } from "@/interfaces/response";

/**
 * Central error handler middleware for consistent error responses
 * @param error The error object
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
function errorHandlerMiddleware(
  error: Error | AppError,
  req: Request,
  res: Response,
  _: NextFunction
): void {
  // Set default values (for non-AppError instances)
  const statusCode =
    error instanceof AppError ? error.statusCode : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

  const isOperational = error instanceof AppError ? error.isOperational : false;

  // Log errors appropriately
  if (!isOperational) {
    // Log non-operational errors (bugs, unexpected failures) with high severity
    logger.error("Unhandled application error", {
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        ...(error instanceof AppError && {
          statusCode: error.statusCode,
          errorCode: error.errorCode,
          details: error.details,
        }),
      },
      request: {
        method: req.method,
        path: req.path,
        query: req.query,
        params: req.params,
        ip: req.ip,
        headers: filterSensitiveHeaders(req.headers),
      },
    });
  } else {
    // Log operational errors (expected errors like validation failures) with lower severity
    logger.warn("Operational error", {
      error: {
        message: error.message,
        ...(error instanceof AppError && {
          statusCode: error.statusCode,
          errorCode: error.errorCode,
        }),
      },
      request: {
        method: req.method,
        path: req.path,
      },
    });
  }

  // Prepare error response using the IErrorResponse interface
  const errorResponse: IErrorResponse = {
    status: "error",
    statusCode: statusCode,
    message: error.message || "An unexpected error occurred",
    timestamp: new Date().toISOString(),
    requestId: req.id,
  };

  // For AppError instances, use their additional properties
  if (error instanceof AppError) {
    if (error.errorCode) {
      errorResponse.errorCode = error.errorCode;
    }

    if (error.details) {
      errorResponse.details = error.details;
    }

    // Add stack trace in development mode only
    if (!isProduction() && error.stack) {
      errorResponse.stack = error.stack;
    }
  } else {
    // For regular errors, add stack trace in development
    if (!isProduction() && error.stack) {
      errorResponse.stack = error.stack;
    }
  }

  // Special handling for validation errors (from express-validator, joi, etc.)
  if (error.name === "ValidationError" || (error as any).errors?.length > 0) {
    errorResponse.details = errorResponse.details || (error as any).errors || [];
    if (!errorResponse.errorCode) {
      errorResponse.errorCode = "VALIDATION_ERROR";
    }
  }

  // Handle Prisma errors
  if (error.name === "PrismaClientKnownRequestError") {
    const prismaError = error as any;

    // Map common Prisma error codes to appropriate responses
    if (prismaError.code === "P2002") {
      // Unique constraint failed
      errorResponse.message = "A record with this value already exists";
      errorResponse.errorCode = "UNIQUE_CONSTRAINT_VIOLATION";
      errorResponse.statusCode = HTTP_STATUS_CODES.CONFLICT;
      res.status(errorResponse.statusCode).json(errorResponse);
      return;
    }

    if (prismaError.code === "P2025") {
      // Record not found
      errorResponse.message = "The requested resource was not found";
      errorResponse.errorCode = "RESOURCE_NOT_FOUND";
      errorResponse.statusCode = HTTP_STATUS_CODES.NOT_FOUND;
      res.status(errorResponse.statusCode).json(errorResponse);
      return;
    }
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    errorResponse.statusCode = HTTP_STATUS_CODES.UNAUTHORIZED;
    errorResponse.message = "Invalid or expired authentication";
    errorResponse.errorCode =
      error.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
    res.status(errorResponse.statusCode).json(errorResponse);
    return;
  }

  // Send appropriate response
  res.status(statusCode).json(errorResponse);
}

/**
 * Filter out sensitive headers before logging
 * @param headers Request headers
 * @returns Filtered headers object
 */
function filterSensitiveHeaders(headers: Record<string, any>): Record<string, any> {
  const filtered = { ...headers };

  // List of sensitive headers to redact
  const sensitiveHeaders = ["authorization", "cookie", "x-api-key", "password", "token", "secret"];

  // Redact sensitive headers
  sensitiveHeaders.forEach(header => {
    const lowercaseHeader = header.toLowerCase();
    if (filtered[lowercaseHeader]) {
      filtered[lowercaseHeader] = "[REDACTED]";
    }
  });

  return filtered;
}

export default errorHandlerMiddleware;
