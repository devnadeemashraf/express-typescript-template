/**
 * Central module for Prisma client management
 * Provides singleton access to both application and logs Prisma clients
 * with proper error handling and connection management
 */

// Type definitions to avoid 'any' usage
interface ILogsClient {
  PrismaClient: any;
  LogLevel: any;
  [key: string]: any;
}

interface IAppClient {
  PrismaClient: any;
  UserRole: any;
  UserAccountStatus: any;
  [key: string]: any;
}

// Client containers with initial null state
let _appClient: IAppClient | null = null;
let _logsClient: ILogsClient | null = null;

// Connection status tracking
let _appClientInitialized = false;
let _logsClientInitialized = false;

/**
 * Initialize and return the logs Prisma client
 * @returns The logs Prisma client or null if initialization failed
 */
export function getLogsClient(): ILogsClient | null {
  // Return cached client if already initialized
  if (_logsClient !== null) {
    return _logsClient;
  }

  try {
    // Attempt to import the generated client
    const client = require("../../prisma/generated/logs-client");
    _logsClient = client;
    _logsClientInitialized = true;
    return client;
  } catch (error) {
    console.error("Failed to import Prisma logs client:", error);
    _logsClientInitialized = false;
    return null;
  }
}

/**
 * Initialize and return the app Prisma client
 * @returns The app Prisma client or null if initialization failed
 */
export function getAppClient(): IAppClient | null {
  // Return cached client if already initialized
  if (_appClient !== null) {
    return _appClient;
  }

  try {
    // Attempt to import the generated client
    const client = require("../../prisma/generated/app-client");
    _appClient = client;
    _appClientInitialized = true;
    return client;
  } catch (error) {
    console.error("Failed to import Prisma app client:", error);
    _appClientInitialized = false;
    return null;
  }
}

/**
 * Singleton instance of the logs database client
 */
class LogsDatabase {
  private static instance: LogsDatabase;
  private client: any;
  public isConnected: boolean = false;

  private constructor() {
    const ILogsClient = getLogsClient();
    if (ILogsClient) {
      try {
        this.client = new ILogsClient.PrismaClient();
        this.isConnected = true;
      } catch (error) {
        console.error("Failed to initialize logs database client:", error);
        this.isConnected = false;
      }
    } else {
      this.isConnected = false;
    }
  }

  /**
   * Get the singleton instance of the logs database
   */
  public static getInstance(): LogsDatabase {
    if (!LogsDatabase.instance) {
      LogsDatabase.instance = new LogsDatabase();
    }
    return LogsDatabase.instance;
  }

  /**
   * Get the Prisma client for logs database
   */
  public getClient() {
    return this.client;
  }

  /**
   * Test the database connection
   */
  public async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.$queryRaw`SELECT 1`;
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Logs database connection test failed:", error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from the database
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.$disconnect();
      this.isConnected = false;
    }
  }
}

/**
 * Singleton instance of the application database client
 */
class AppDatabase {
  private static instance: AppDatabase;
  private client: any;
  public isConnected: boolean = false;

  private constructor() {
    const IAppClient = getAppClient();
    if (IAppClient) {
      try {
        this.client = new IAppClient.PrismaClient();
        this.isConnected = true;
      } catch (error) {
        console.error("Failed to initialize app database client:", error);
        this.isConnected = false;
      }
    } else {
      this.isConnected = false;
    }
  }

  /**
   * Get the singleton instance of the app database
   */
  public static getInstance(): AppDatabase {
    if (!AppDatabase.instance) {
      AppDatabase.instance = new AppDatabase();
    }
    return AppDatabase.instance;
  }

  /**
   * Get the Prisma client for app database
   */
  public getClient() {
    return this.client;
  }

  /**
   * Test the database connection
   */
  public async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.$queryRaw`SELECT 1`;
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("App database connection test failed:", error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from the database
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.$disconnect();
      this.isConnected = false;
    }
  }
}

// Export database singletons
export const logsDB = LogsDatabase.getInstance();
export const appDB = AppDatabase.getInstance();

// Helper function to check initialization status
export function getDbStatus() {
  return {
    appClientImported: _appClientInitialized,
    logsClientImported: _logsClientInitialized,
    appDbConnected: appDB.isConnected,
    logsDbConnected: logsDB.isConnected,
  };
}

// Graceful shutdown handler
export async function disconnectAll() {
  await Promise.all([
    appDB.disconnect().catch(console.error),
    logsDB.disconnect().catch(console.error),
  ]);
}

// Set up shutdown handlers
process.on("SIGINT", () => {
  disconnectAll().then(() => process.exit(0));
});
process.on("SIGTERM", () => {
  disconnectAll().then(() => process.exit(0));
});
