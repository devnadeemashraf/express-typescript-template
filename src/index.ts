// Express App
import { createApp, startServer } from "@/app";
import type { Express } from "@/app";

// Logger
import logger from "@/utils/logger";

// Express App Instance for Global Export
let app: Express | null = null;

// HTTP Serve Function
async function main() {
  try {
    // Initialize App
    if (!app) {
      app = (await createApp()) as Express;
    }

    // Start Server
    await startServer(app);
  } catch (error) {
    logger.error("Failed to start application", {
      error: {
        message: (error as Error).message,
        stack: (error as Error).stack,
      },
    });
    process.exit(1);
  }
}

// Run Server
main();

// Export Created App Instance
export { app };
