import logger from "@/utils/logger";
import { Express } from ".";

function initRoutes(app: Express) {
  app.use("/", (_, res) => {
    logger.info("Hello World!");
    res.send("Hello World!");
  });
}

export { initRoutes };
