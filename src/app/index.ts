import { Server } from "http";
import express, { json, urlencoded, Router } from "express";
import type { Express, Request, Response, NextFunction } from "express";

// Local Imports
import { initPostRouteMiddlewares, initPreRouteMiddlewares } from "./middlewares";
import { initRoutes } from "./route-handler";

import { env } from "@/configs";
import logger from "@/utils/logger";

/**
 * Initialize and configure Express application
 * @returns Configured Express application
 */
export async function createApp() {
  // Express App Instance
  const app: Express = express();

  // Pre-Route Middlewares
  initPreRouteMiddlewares(app);

  // Routes
  initRoutes(app);

  // Post-Route Middlewares
  initPostRouteMiddlewares(app);

  return app;
}

/**
 * Start the HTTP server
 * @param app Express application
 * @returns HTTP server instance
 */
export async function startServer(app: express.Express) {
  const port = env.port;

  const server = app.listen(port, () => {
    logger.info(`🚀 Server started on port ${port}`, {
      port,
      environment: env.nodeEnv,
      mode: env.nodeEnv,
    });
  });

  // Handle graceful shutdown
  const shutdown = async () => {
    logger.info("Starting graceful shutdown...");

    // Close HTTP server
    server.close(() => {
      logger.info("HTTP server closed");
    });

    // Flush all logs before exiting
    await logger.flushAll();

    // Finish Shutdown
    logger.info("Graceful shutdown complete");

    // Exit with success code
    process.exit(0);
  };

  // Listen for signals
  // SIGTERM: Termination Signal
  process.on("SIGTERM", shutdown);
  // SIGINT: Interrupt Signal
  process.on("SIGINT", shutdown);
  // SIGHUP: Hangup Signal
  process.on("SIGHUP", shutdown);
  // SIGQUIT: Quit Signal
  process.on("SIGQUIT", shutdown);
  // SIGABRT: Abort Signal
  process.on("SIGABRT", shutdown);
  // SIGBREAK: Break Signal
  process.on("SIGBREAK", shutdown);
  // SIGUSR1: User-defined Signal 1
  process.on("SIGUSR1", shutdown);
  // SIGUSR2: User-defined Signal 2
  process.on("SIGUSR2", shutdown);

  return server;
}

// Express Package Export
export { json, urlencoded, Router };
// Express Types Export
export { Express, Request, Response, NextFunction };
// Export HTTP Server Pakcages
export { Server };
