// Implements Graceful Shutdown
import "@/utils/shutdown";

// Express App
import app, { Server } from "@/app";

// Configs
import { env } from "@/configs";

// HTTP Serve Function
async function serve() {
  const server: Server = app.listen(env.port, () => {
    console.log(`Listening on PORT: ${env.port}`);
  });

  // HTTP Server
  console.log(server);
}

// Run Server
serve();
