import { Router } from "@/app";
import type { Request, Response } from "@/app";

const healthRouter = Router();

healthRouter.get("/health", (_request: Request, _response: Response) => {
  _response.status(200).json({ message: "Server is healthy" });
});

export default healthRouter;
