import { Express } from ".";

import { json } from ".";

/**
 * Sets Up Middlewares that run after the Route Handlers
 * @param {Express} app - Express App Instance
 */
function initPostRouteMiddlewares(app: Express) {
  app.use(json());
}

/**
 * Sets Up Middlewares that run before the Route Handlers
 * @param {Express} app - Express App Instance
 */
function initPreRouteMiddlewares(app: Express) {
  app.use(json());
}

export { initPostRouteMiddlewares, initPreRouteMiddlewares };
