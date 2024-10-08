import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { validateUser } from "../middleware/user";
import { uploadImage } from "../controllers/image";
import multer from "multer";

// image upload destionation
const upload = multer({ dest: "uploads/" });

const imageRouter = Router();

// guard
imageRouter.use([authMiddleware, validateUser]);

imageRouter.post("/", upload.single("image"), uploadImage);

export { imageRouter };
