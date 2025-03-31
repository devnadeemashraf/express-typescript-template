import { v4 as uuidv4 } from "uuid";

import { Request, Response, NextFunction } from "@/app";

// Extend Express Request interface to include id property
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

/**
 * Middleware intercept incoming requests and perform operations
 * Example: to generate and attach unique ID to each request
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
function interceptorMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if client provided an ID (common for distributed tracing)
  const headerName = "x-request-id";

  // Use provided ID or generate a new one
  const idFromHeader = req.header(headerName);
  const id = idFromHeader || uuidv4();

  // Attach to request object
  req.id = id;

  // Add as response header to make it accessible to the client
  res.setHeader(headerName, id);

  next();
}

export default interceptorMiddleware;
