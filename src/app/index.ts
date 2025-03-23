import { Server } from "http";
import express, { json, Router } from "express";
import type { Express } from "express";

// Local Imports
import { initPostRouteMiddlewares, initPreRouteMiddlewares } from "./middlewares";
import { initRoutes } from "./route-handler";

// Express App Instance
const app: Express = express();

// Pre-Route Middlewares
initPreRouteMiddlewares(app);

// Routes
initRoutes(app);

// Post-Route Middlewares
initPostRouteMiddlewares(app);

// Express Package Export
export { json, Router };
// Express Types Export
export { Express };
// Export HTTP Server Pakcages
export { Server };

// Default Export
export default app;
