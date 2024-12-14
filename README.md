# Project Overview

This project is an **Express.js Boilerplate Application** built with **TypeScript**, designed to be scalable, maintainable, and easy to extend. It follows clean code principles and backend design patterns such as the **Repository Pattern**, **Service Layer**, **JWT Authentication**, **Role-Based Access Control (RBAC)**, and **API Versioning**. It's structured to be used as a **starter template** for personal projects, SaaS applications, and server-side applications.

---

### Table of Contents

1. [Project Setup](#1-project-setup)
2. [Project Structure](#2-project-structure)
3. [Core Components](#3-core-components)
   - [Database](#database)
   - [Authentication & Authorization](#authentication-authorization)
   - [Logging](#logging)
   - [Error Handling](#error-handling)
   - [Rate Limiting & CORS](#rate-limiting-cors)
   - [Request Validation](#request-validation)
   - [Testing](#testing)
4. [How to Run the Project](#4-how-to-run-the-project)
5. [How to Extend and Customize](#5-how-to-extend-and-customize)
6. [Deployment & CI/CD](#6-deployment-cicd)
7. [Security Best Practices](#7-security-best-practices)
8. [Conclusion](#8-conclusion)

---

### 1. Project Setup

To get started, you need to set up the project on your local machine. Here's how to do it:

#### Initialize the Project

1. **Clone the Project Locally**:

   ```bash
   git clone https://github.com/devnadeemashraf/express-typescript-template.git
   cd express-typescript-template
   ```

2. **Install Dependencies**:
   Install core dependencies and development tools (e.g., TypeScript, Express, Sequelize, etc.) as follows:

   ```bash
   yarn install
   ```

3. **Create `.env` File**:
   Add environment variables for configuring database credentials, JWT secrets, etc.

   ```env
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=password
   DB_NAME=express_ts_boilerplate

   JWT_SECRET=mysecretkey

   COOKIE_SECRET=mysecretkey
   ```

---

### 2. Project Structure

The project follows a clean, modular architecture with each component grouped logically. Below is a breakdown of the project directory structure:

```
src/
├── config/               # Application configuration (DB, logger, environment)
│   ├── database.ts       # Sequelize database connection configuration
│   ├── logger.ts         # Winston logging setup
│   └── environment.ts    # Loads environment variables using dotenv
├── controllers/          # API controllers (Request handlers)
│   └── userController.ts # Handles user-related API logic
├── middleware/           # Custom Express middlewares (auth, error handling)
│   ├── authMiddleware.ts # Handles JWT authentication
│   └── errorMiddleware.ts# Global error handler middleware
├── models/               # Sequelize models (Database schemas)
│   └── userModel.ts      # User model definition
├── routes/               # API route definitions
│   └── userRoutes.ts     # User-related routes
├── services/             # Business logic (Service layer)
│   └── userService.ts    # Handles user-related business logic
├── repositories/         # Database access (Repository Pattern)
│   └── userRepository.ts # Handles direct DB queries
├── utils/                # Helper functions (JWT utilities, etc.)
│   └── jwtUtil.ts        # JWT sign and verification utilities
│   └── validationUtil.ts # Helper for validating request data
├── app.ts                # Express app setup
└── server.ts             # Main server entry point
```

#### Key Components

1. **`config/`**:

   - **`database.ts`**: Configures and establishes a connection with the database using Sequelize.
   - **`logger.ts`**: Sets up the logging mechanism using `winston`.
   - **`environment.ts`**: Loads environment variables from the `.env` file using the `dotenv` library.

2. **`controllers/`**:

   - Contains API request handlers. These interact with services and repositories to process requests and return responses. For example, **`userController.ts`** handles user registration and login.

3. **`middleware/`**:

   - Custom Express middlewares are placed here. These include:
     - **`authMiddleware.ts`**: Protects routes by verifying JWT tokens.
     - **`errorMiddleware.ts`**: Catches and handles all errors centrally.

4. **`models/`**:

   - Contains Sequelize model definitions (e.g., **`userModel.ts`** for the `User` table). These models represent the schema of your database tables.

5. **`routes/`**:

   - Defines route handlers and HTTP method bindings (e.g., **`userRoutes.ts`**).

6. **`services/`**:

   - Contains the core business logic of the application. **`userService.ts`** contains methods for handling user registration, login, etc.

7. **`repositories/`**:

   - Implements the **Repository Pattern** to abstract the database queries. **`userRepository.ts`** performs CRUD operations on the `User` table.

8. **`utils/`**:

   - Contains utility functions like **`jwtUtil.ts`** (for signing/verifying JWTs) and **`validationUtil.ts`** (for validating request bodies using `Joi`).

9. **`app.ts`**:

   - Sets up and configures the Express app with middleware, routes, and error handling.

10. **`server.ts`**:
    - Starts the Express server and establishes the database connection.

---

### 3. Core Components

#### Database

- **Sequelize ORM**: Used to interact with the PostgreSQL database. It provides an abstraction layer for managing SQL queries and allows for easy migrations.
- **Repository Pattern**: The **`userRepository.ts`** interacts with the database directly, isolating database queries from the business logic (service layer). This ensures that database logic is decoupled and easily replaceable if needed.

#### Authentication & Authorization

- **JWT (JSON Web Tokens)**: We use JWT to authenticate users via HTTP-only cookies. On successful login, the server issues a JWT token, which is stored in a secure cookie.
- **RBAC (Role-Based Access Control)**: Middleware like **`roleMiddleware.ts`** checks the user's role (admin, user, etc.) to restrict access to certain routes.

#### Logging

- **Winston**: We use `winston` for structured logging. Logs are written to a file and can be configured to be saved in different environments (e.g., a cloud database or file storage).
- **Log Export**: We have a function to export logs in CSV or XLSX formats.

#### Error Handling

- **Global Error Handler**: The **`errorMiddleware.ts`** captures all errors and sends appropriate responses. It ensures consistent error messaging and helps with debugging during development.
- **Graceful Error Handling**: All unexpected errors are caught and handled in one place, with standardized HTTP status codes and error messages.

#### Rate Limiting & CORS

- **Rate Limiting**: We implement basic rate limiting with the `express-rate-limit` middleware to protect the API from brute-force or DDoS attacks.
- **CORS Handling**: The application uses the `cors` middleware to allow or block cross-origin requests from different domains.

#### Request Validation

- **Joi**: We use the `Joi` library to validate incoming request bodies, query parameters, and headers. Validation ensures that only properly formatted data is accepted by the API.

#### Testing

- **Jest**: The testing suite for unit and integration tests.
- **Supertest**: Used for HTTP testing to simulate API calls and validate responses.

---

### 4. How to Run the Project

1. **Set Up the Database**:

   - Ensure that PostgreSQL is running and accessible.
   - Create a database named `express_ts_boilerplate` (or modify the `.env` file to match your database credentials).
   - Run Sequelize migrations to set up the database tables.

   ```bash
   npx sequelize-cli db:migrate
   ```

2. **Run the Application**:

   - Compile and run the app using `ts-node`:

   ```bash
   npm run dev
   ```

   Alternatively, you can run it in production mode after building the project with:

   ```bash
   npm run build
   npm start
   ```

3. **API Endpoints**:
   - The API is now available at `http://localhost:5000/api/v1/`.

---

### 5. How to Extend and Customize

- **Add New Models**: Create new models inside `src/models/` and corresponding repositories in `src/repositories/`.
- **New Routes**: Define new routes inside `src/routes/` and

connect them to controllers and services.

- **Custom Middleware**: Add new middlewares (e.g., validation, logging) inside `src/middleware/`.
- **Testing**: Add unit and integration tests inside the `tests` folder.

---

### 6. Deployment & CI/CD

To deploy this app, you can containerize it using Docker. Below is a sample Docker configuration:

#### Dockerfile

```Dockerfile
# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
```

- **CI/CD**: Use tools like GitHub Actions or GitLab CI to automate your deployment pipeline.

---

### 7. Security Best Practices

- **JWT**: Ensure that your JWT secret is strong and stored securely (e.g., in environment variables or a secrets manager).
- **Helmet**: Use **`helmet`** to set security-related HTTP headers.
- **SQL Injection Protection**: Sequelize helps mitigate SQL injection, but always sanitize and validate user inputs.
- **Rate Limiting**: Protect your API from brute-force attacks using rate-limiting middleware.

---

### 8. Conclusion

This boilerplate provides a clean and scalable foundation for building REST APIs using **Express.js**, **TypeScript**, and **Sequelize**. By following backend design patterns like the **Repository Pattern**, **Service Layer**, and using **JWT Authentication** and **RBAC**, this structure allows you to build secure, modular, and maintainable applications.
