import { Request, Response, NextFunction } from "@/app";
import { logger } from "@/utils/logger";
import { ELogLevel } from "@/interfaces/logs";

// Flag to track initialization status
let loggerInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

/**
 * Middleware to log incoming HTTP requests and ensure logger is initialized
 */
export default async function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Initialize logger if not already done
    if (!loggerInitialized) {
      if (!initializationPromise) {
        // Start initialization if not already in progress
        initializationPromise = logger.initialize();
      }

      // Wait for initialization to complete
      loggerInitialized = await initializationPromise;

      if (!loggerInitialized) {
        // Log warning but continue - application can still function with console logging
        console.warn("Logger initialization failed, falling back to console logging only");
      }

      // Clear promise to allow retry on next request if needed
      initializationPromise = null;
    }

    // Capture request start time for duration calculation
    const startTime = Date.now();

    // Process request path and method
    const reqPath = req.originalUrl || req.url;
    const reqMethod = req.method;

    // Basic request logging - use console only for standard info
    logger.info(`${reqMethod} ${reqPath}`);

    // Track response for logging after completion
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Choose log level based on status code
      const level = statusCode >= 400 ? ELogLevel.Warn : ELogLevel.Info;

      // Log request details to database using logRequest
      logger.logRequest(level, `${reqMethod} ${reqPath} ${statusCode} ${duration}ms`, {
        request_path: reqPath,
        request_method: reqMethod,
        status_code: statusCode,
        duration_ms: duration,
        request_id: req.headers["x-request-id"] || req.id,
      });

      // For errors, also log to error log
      if (statusCode >= 500) {
        logger.error(`Server error ${statusCode} for ${reqMethod} ${reqPath}`, {
          request_path: reqPath,
          request_method: reqMethod,
          status_code: statusCode,
          duration_ms: duration,
          request_id: req.headers["x-request-id"] || req.id,
        });
      } else if (statusCode >= 400) {
        logger.warn(`Client error ${statusCode} for ${reqMethod} ${reqPath}`, {
          request_path: reqPath,
          request_method: reqMethod,
          status_code: statusCode,
          duration_ms: duration,
          request_id: req.headers["x-request-id"] || req.id,
        });
      }
    });

    // Continue to next middleware
    next();
  } catch (error) {
    // Ensure error doesn't break request handling
    console.error("Error in request logger middleware:", error);
    next();
  }
}
