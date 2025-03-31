import { Request, Response, NextFunction } from "@/app";
import { logger } from "@/utils/logger";

/**
 * Middleware to log incoming HTTP requests
 */
export default function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  // Use the built-in request logger middleware from our logger instance
  return logger.requestLoggerMiddleware()(req, res, next);
}
