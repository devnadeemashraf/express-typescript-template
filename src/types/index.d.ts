// Extend Express Request interface to include id property
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}
