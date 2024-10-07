import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../controllers/image";

const imageRouter = Router();

// guard
imageRouter.use(authMiddleware);

imageRouter.post("/", upload);

export { imageRouter };
