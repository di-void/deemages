import { type Request, type Response, type NextFunction } from "express";
import { formatRegularErrorMessage } from "../utils/helpers";
import { User } from "../utils/validators";

export function validateUser(req: Request, res: Response, next: NextFunction) {
  const result = User.safeParse(req.user);

  if (!result.success) {
    return res.status(400).json({
      status: "error",
      error: formatRegularErrorMessage("Malformed data"),
    });
  }

  next();
}
