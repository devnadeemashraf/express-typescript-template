import { Express } from ".";

function initRoutes(app: Express) {
  app.use("/", (_, res) => {
    res.send("Hello World!");
  });
}

export { initRoutes };
