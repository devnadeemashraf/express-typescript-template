import logger from "@/utils/logger";
import { Express } from ".";

function initRoutes(app: Express) {
  app.get("/", async (_, res) => {
    logger.info("Hello World!");

    await logger.flushAll();

    res.send("Hello World!");
  });

  // Add to route-handler.ts
  app.get("/health", async (_, res) => {
    const healthResp = await logger.healthCheck();

    res.json(healthResp);
  });
}

export { initRoutes };
