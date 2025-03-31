import { Request, Response, NextFunction } from "@/app";

import AppError from "@/structs/app-error";

/**
 * Handle 404 errors when no route matches
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
const notFoundMiddleware = (req: Request, _: Response, next: NextFunction) => {
  next(AppError.notFound(`Resource not found: ${req.method} ${req.originalUrl}`));
};

export default notFoundMiddleware;
