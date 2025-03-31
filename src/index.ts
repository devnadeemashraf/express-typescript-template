// Express App
import { createApp, startServer } from "@/app";

// Logger
import logger from "@/utils/logger";

// HTTP Serve Function
async function main() {
  try {
    // Initialize App
    const app = await createApp();

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
