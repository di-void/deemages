import { UserType } from "../src/utils/validators";

declare global {
  namespace Express {
    interface Request {
      user?: UserType;
    }
  }
}
