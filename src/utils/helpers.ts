import "dotenv/config";
import { Request, Response, NextFunction } from "@/app";
import { env } from "@/configs";

/**
 * Get the value of an environment variable or a fallback value if the key is not found. Supports Generics.
 * @template T - The type of the fallback value.
 * @param {string} key - The key to search for in the environment variables.
 * @param {T} fallback - The fallback value to use if the key is not found.
 * @returns {T} The value of the key if found, otherwise the fallback value.
 */
export const getENV = <T>(key: string, fallback: T): T => {
  return process.env[key] === undefined ? fallback : (process.env[key] as T);
};

/**
 * Check if the application is running in production mode
 * @returns True if NODE_ENV is set to 'production'
 */
export const isProduction = (): boolean => env.nodeEnv === "production";

/**
 * Check if the application is running in development mode
 * @returns True if NODE_ENV is set to 'development' or undefined
 */
export const isDevelopment = (): boolean =>
  process.env.NODE_ENV === "development" || env.nodeEnv === undefined;

/**
 * Check if the application is running in test mode
 * @returns True if NODE_ENV is set to 'test'
 */
export const isTest = (): boolean => env.nodeEnv === "test";

/**
 * Parse time string like "1m", "2h" into milliseconds
 * @param timeStr Time string (e.g., "10s", "5m", "1h")
 * @returns Time in milliseconds
 */
export const parseTimeString = (timeStr: string): number => {
  const match = timeStr.match(/^(\d+)([smh])$/);
  if (!match) {
    return 60 * 1000; // Default 1 minute
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      return 60 * 1000;
  }
};

/**
 * Catches unhandled errors in async routes
 * @param fn The async route handler
 * @returns Wrapped route handler with error handling
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
