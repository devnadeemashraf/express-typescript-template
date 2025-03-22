import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readLine from "readline";

const requiredNodeVersion = "22.14.0";
const requiredYarnVersion = "1.22.22";

/**
 * ANSI Color Codes for Prettier Console Outputs
 */
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

/**
 * Create a readline interface for user input
 */
const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Log a step with formatting
 * @param {string} message - Message to be displayed
 */
function logStep(message) {
  console.log(`\n${colors.bright}${colors.cyan}▶ ${message}${colors.reset}`);
}

/**
 * Log success message with formatting
 * @param {string} message - Message to be displayed
 */
function logSuccess(message) {
  console.log(`${colors.bright}${colors.green}✓ ${message}${colors.reset}`);
}

/**
 * Log warning message with formatting
 * @param {string} message - Message to be displayed
 */
function logWarning(message) {
  console.log(`${colors.bright}${colors.yellow}⚠ ${message}${colors.reset}`);
}

/**
 * Log error message with formatting
 * @param {string} message - Message to be displayed
 */
function logError(message) {
  console.log(`${colors.bright}${colors.red}✗ ${message}${colors.reset}`);
}

/**
 * Execute a command and return its output
 * @param {string} command - The command to execute
 * @returns {string} The command output
 */
function execute(command) {
  try {
    return execSync(command, { encoding: "utf8", stdio: "inherit" });
  } catch (error) {
    logError(`Failed to execute command - '${command}'. Error: ${error.message}`);
    throw error;
  }
}

/**
 * Check if a command is available
 * @param {string} command - The command to check
 * @returns {boolean} Whether the command is available
 */
function commandExists(command) {
  try {
    execSync(`${command} --version`, { stdio: "ignore" });
    return true;
  } catch (e) {
    logError(`Failed to check if command - '${command}' exists. Error: ${e.message}`);
    return false;
  }
}

/**
 * Compare version strings
 * @param {string} version1 - First version
 * @param {string} version2 - Second version
 * @returns {number} -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
 */
function compareVersions(version1, version2) {
  const parts1 = version1.split(".").map(Number);
  const parts2 = version2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = i < parts1.length ? parts1[i] : 0;
    const part2 = i < parts2.length ? parts2[i] : 0;

    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }

  return 0;
}

/**
 * Extract version number from version string
 * @param {string} versionString - Version string to parse
 * @returns {string} Clean version number
 */
function extractVersion(versionString) {
  const match = versionString.match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : "0.0.0";
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to file
 * @returns {boolean} Whether the file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Create a file if it doesn't exist
 * @param {string} filePath - Path to file
 * @param {string} content - Content to write
 */
function createFileIfNotExists(filePath, content) {
  if (!fileExists(filePath)) {
    fs.writeFileSync(filePath, content);
    logSuccess(`Created ${filePath}`);
  } else {
    logSuccess(`${filePath} already exists, skipping`);
  }
}

/**
 * Copy file if destination doesn't exist
 * @param {string} source - Source file
 * @param {string} destination - Destination file
 */
function copyFileIfNotExists(source, destination) {
  if (fileExists(source) && !fileExists(destination)) {
    fs.copyFileSync(source, destination);
    logSuccess(`Copied ${source} to ${destination}`);
  } else if (!fileExists(source)) {
    logError(`Source file ${source} does not exist`);
  } else {
    logSuccess(`${destination} already exists, skipping`);
  }
}

/**
 * Wait for user confirmation
 * @param {string} message - Message to display
 * @returns {Promise<boolean>} Whether the user confirmed
 */
function confirm(message) {
  return new Promise(resolve => {
    rl.question(`${message} (Y/N) `, answer => {
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

/**
 * Main setup function
 */
async function setup() {
  console.log(
    `\n${colors.bright}${colors.green}=== Express TypeScript Template Setup ===${colors.reset}\n`
  );

  try {
    // Check Node.js version
    logStep("Checking Node.js version...");
    const nodeVersion = process.version.substring(1); // Remove 'v' prefix

    if (compareVersions(nodeVersion, requiredNodeVersion) < 0) {
      logError(`Node.js ${requiredNodeVersion}+ is required, but found ${nodeVersion}`);
      logWarning(`Please upgrade Node.js: https://nodejs.org/`);
      if (!(await confirm("Continue anyway?"))) {
        process.exit(1);
      }
    } else {
      logSuccess(`Node.js ${nodeVersion} ✓`);
    }

    // Check Yarn version
    logStep("Checking Yarn version...");
    if (!commandExists("yarn")) {
      logError("Yarn is not installed");
      logWarning("Please install Yarn: https://yarnpkg.com/getting-started/install");
      if (!(await confirm("Continue using npm instead?"))) {
        process.exit(1);
      }
    } else {
      const yarnVersionOutput = execSync("yarn --version", { encoding: "utf8" }).trim();

      if (compareVersions(yarnVersionOutput, requiredYarnVersion) < 0) {
        logWarning(`Yarn ${requiredYarnVersion}+ is recommended, but found ${yarnVersionOutput}`);
        if (!(await confirm("Continue anyway?"))) {
          process.exit(1);
        }
      } else {
        logSuccess(`Yarn ${yarnVersionOutput} ✓`);
      }
    }

    // Check Docker availability
    logStep("Checking Docker availability...");
    if (!commandExists("docker") || !commandExists("docker-compose")) {
      logWarning("Docker and/or Docker Compose are not installed or not in PATH");
      logWarning("You will not be able to run the containerized services");
      if (!(await confirm("Continue with setup?"))) {
        process.exit(1);
      }
    } else {
      const dockerVersion = extractVersion(
        execSync("docker --version", { encoding: "utf8" }).trim()
      );
      const dockerComposeVersion = extractVersion(
        execSync("docker-compose --version", { encoding: "utf8" }).trim()
      );
      logSuccess(`Docker ${dockerVersion} ✓`);
      logSuccess(`Docker Compose ${dockerComposeVersion} ✓`);
    }

    // Create .env file from .env.example if it doesn't exist
    logStep("Setting up environment variables...");
    const envExamplePath = path.join(process.cwd(), ".env.example");
    const envPath = path.join(process.cwd(), ".env");

    if (fileExists(envPath)) {
      logSuccess(".env file already exists, skipping creation");
    } else if (fileExists(envExamplePath)) {
      // Copy the example file to create .env
      copyFileIfNotExists(envExamplePath, envPath);
      logSuccess("Created .env file from .env.example");

      // Inform user about potentially needed changes
      logWarning("Remember to update the .env file with your specific configuration values");
    } else {
      // Fallback: Create a basic .env if no example exists (unlikely scenario)
      logWarning(".env.example file not found, creating a basic .env file");
      createFileIfNotExists(
        envPath,
        `   # Generated by setup script on ${new Date().toISOString()}
            # === General Application Settings ===

            # The environment the application is running in (development, production, etc.)
            NODE_ENV=development

            # Secret key for encrypting JWT tokens (should be kept secure, not shared publicly)
            # Generate using "openssl rand -base64 32" or any secure method
            JWT_SECRET=your-super-hard-jwt-secret-key
            JWT_EXPIRATION_TIME=1h  # JWT token expiration time (e.g., 1 hour)

            # The port the Express server should listen to
            PORT=8080

            # === Database Configuration ===

            # PostgreSQL Database (Main application database)
            PG_HOST=localhost
            PG_PORT=5432
            PG_USER=your_pg_username
            PG_PASSWORD=your_pg_password
            PG_DB=your_pg_database
            PG_SSL=false  # Set to true if your PostgreSQL uses SSL, usually in cloud environments

            # Connection pool configuration for PostgreSQL (for performance optimization)
            PG_POOL_MIN=2          # Minimum number of connections in the pool
            PG_POOL_MAX=20         # Maximum number of connections in the pool
            PG_POOL_IDLE_TIMEOUT=30000  # Idle timeout in milliseconds

            # === Cache Configuration ===

            # Redis Cache (Used for session management, caching, etc.)
            REDIS_HOST=localhost
            REDIS_PORT=6379
            REDIS_PASSWORD=your_redis_password  # Leave blank if Redis does not require a password
            REDIS_DB=0  # Database index in Redis
            REDIS_TTL=3600  # Default Time-To-Live (TTL) for cache in seconds (e.g., 1 hour)

            # === Logging Database Configuration ===

            # MySQL Database (For storing logs)
            MYSQL_LOG_HOST=localhost
            MYSQL_LOG_PORT=3306
            MYSQL_LOG_USER=your_mysql_username
            MYSQL_LOG_PASSWORD=your_mysql_password
            MYSQL_LOG_DB=your_mysql_log_database
            MYSQL_LOG_TABLE=logs  # Table name where logs will be stored

            # === RBAC (Role-Based Access Control) Configuration ===

            # Default user roles
            ROLE_ADMIN=admin
            ROLE_MODERATOR=moderator
            ROLE_APPRENTICE=apprentice
            ROLE_USER=user
            ROLE_GUEST=guest

            # The permissions that should be granted to each role (These can be extended based on the app's features)
            PERMISSIONS_ADMIN="read:all,write:all,delete:all"  # Example of full permissions for admin
            PERMISSIONS_USER="read:own,write:own"  # Example of limited permissions for a regular user
            PERMISSIONS_GUEST="read:public"  # Example of permissions for a guest

            # === Authentication Settings ===

            # Enable authentication middleware (JWT, OAuth, etc.)
            AUTH_ENABLED=true

            # === Third-Party API Keys and Secrets ===

            # Stripe API key (if handling payments)
            STRIPE_SECRET_KEY=your_stripe_secret_key

            # === Email Settings ===

            # SMTP Server Configuration for email sending
            SMTP_HOST=smtp.mailtrap.io
            SMTP_PORT=587
            SMTP_USER=your_smtp_username
            SMTP_PASSWORD=your_smtp_password
            SMTP_FROM_EMAIL=no-reply@yourdomain.com
            SMTP_FROM_NAME=YourAppName

            # === Security Settings ===

            # CORS Configuration (Allowed Origins)
            CORS_ALLOWED_ORIGINS="http://your-frontend-domain.com, http://another-trusted-domain.com"

            # Session timeout (for JWT, session, or cookies)
            SESSION_TIMEOUT=3600  # 1 hour

            # Rate Limiting settings to prevent abuse (e.g., 100 requests per minute)
            RATE_LIMIT_MAX=50
            RATE_LIMIT_WINDOW=1m  # 1 minute window

            # === Monitoring and Performance ===

            # Datadog API key (For monitoring if you use Datadog or other service)
            DATADOG_API_KEY=your_datadog_api_key

            # Enable application performance monitoring (APM)
            APM_ENABLED=true

            # === Miscellaneous ===

            # Application Name for identifying in logs and monitoring tools
            APP_NAME="Express TypeScript Template"

            # Sendgrid API Key for email sending (if using Sendgrid)
            SENDGRID_API_KEY=your_sendgrid_api_key

            # Timezone for the application (useful for logging, scheduling tasks)
            TZ=UTC

            # === Debugging and Development ===

            # Enable debugging (Only set to true for development environment)
            DEBUG=true

            # Enable detailed logging for development purposes
            LOG_LEVEL=debug  # Options: debug, info, warn, error

`
      );
      logWarning("A default .env file was created. You should customize it with your own values.");
    }

    // Install dependencies
    logStep("Installing dependencies...");
    if (commandExists("yarn")) {
      execute("yarn install");
    } else {
      execute("npm install");
    }

    // Create directories if they don't exist
    logStep("Creating necessary directories...");
    const directories = ["src", "dist", "prisma"];
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logSuccess(`Created directory: ${dir}`);
      }
    });

    // Spin up Docker containers
    if (commandExists("docker") && commandExists("docker-compose")) {
      logStep("Starting Docker containers...");
      if (await confirm("Do you want to start Docker containers now?")) {
        execute("docker-compose up -d");
        logSuccess("Docker containers started");
      } else {
        logWarning("Skipping Docker container startup");
        logWarning("You can start them later with: yarn docker:up");
      }
    }

    // Generate Prisma client
    logStep("Generating Prisma client...");
    if (fileExists("prisma/schema.prisma")) {
      if (await confirm("Do you want to generate the Prisma client?")) {
        execute("yarn prisma:generate");
        logSuccess("Prisma client generated");
      } else {
        logWarning("Skipping Prisma client generation");
      }
    } else {
      logWarning("prisma/schema.prisma not found, skipping Prisma client generation");
    }

    // Database seeding (commented out as requested)
    /*
      logStep('Seeding database with initial data...');
      if (await confirm('Do you want to seed the database with initial data?')) {
        try {
          execute('yarn prisma:migrate');
          execute('yarn prisma db seed');
          logSuccess('Database seeded successfully');
        } catch (error) {
          logError('Failed to seed database');
          logError(error.message);
        }
      } else {
        logWarning('Skipping database seeding');
      }
      */

    // Setup complete
    logSuccess("\nSetup complete! Your development environment is ready.");
    console.log(`
  ${colors.bright}Next steps:${colors.reset}
  - Edit the .env file with your specific configuration
  - Start development server: ${colors.cyan}yarn dev${colors.reset}
  - Run tests: ${colors.cyan}yarn test${colors.reset}
      `);
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup function
setup();
