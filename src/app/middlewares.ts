import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { Express } from ".";
import { json, urlencoded } from ".";

import { env } from "@/configs";
import { parseTimeString } from "@/utils/helpers";

import interceptorMiddleware from "@/middlewares/interceptor.middleware";
import requestLoggerMiddleware from "@/middlewares/request-logger.middleware";
import errorHandlerMiddleware from "@/middlewares/error-handler.middleware";
import notFoundMiddleware from "@/middlewares/not-found.middleware";

/**
 * Sets Up Middlewares that run after the Route Handlers
 * @param {Express} app - Express App Instance
 */
function initPostRouteMiddlewares(app: Express) {
  // Add 404 Not Found Handler
  app.use(notFoundMiddleware);

  // Add Global Error Handler
  app.use(errorHandlerMiddleware);
}

/**
 * Sets Up Middlewares that run before the Route Handlers
 * @param {Express} app - Express App Instance
 */
function initPreRouteMiddlewares(app: Express) {
  // Security middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: env.security.corsOrigins.split(","),
      credentials: true,
    })
  );

  // Request Interceptor Middleware - must be the first middleware
  app.use(interceptorMiddleware);

  // Request Logging Middleware
  app.use(requestLoggerMiddleware);

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: parseTimeString(env.security.rateLimitWindow),
      limit: env.security.rateLimitMax,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    })
  );

  // Request Parsing
  app.use(json({ limit: "1mb" }));
  app.use(urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser(env.security.cookieSecret));

  // Performance
  // TODO [devnadeemashraf] : Update Configuration for Production
  app.use(compression());
}

export { initPostRouteMiddlewares, initPreRouteMiddlewares };
