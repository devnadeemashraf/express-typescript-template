/**
 * Implements Graceful Shutdown
 */
function shutdown() {}

// Handle Graceful Shutdown
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
