import { NextFunction, Response, Request } from "express";
import { lucia } from "../utils/lucia";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // get the session id from the request
  const sessionId = lucia.readBearerToken(req.headers.authorization ?? "");

  if (!sessionId) {
    return res.status(401).end();
  }

  try {
    // validate session id
    const { session, user } = await lucia.validateSession(sessionId);

    if (!user || !session) {
      return res.status(401).end();
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Auth Middleware Error:", error);
    throw error;
  }
}
