import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { validateUser } from "../middleware/user";
import { uploadImage } from "../controllers/image";
import { fileFilter } from "../utils/helpers";
import multer from "multer";
import { FILE_STORAGE_LOCATION } from "../config";

const disk = multer.diskStorage({
  // image upload destionation
  destination: FILE_STORAGE_LOCATION,

  filename: function (_req, file, cb) {
    const ext = "." + file.mimetype.split("/")[1];
    // custom file name
    const filename = file.fieldname + "-" + Date.now() + ext;
    cb(null, filename);
  },
});

// TODO: error handling for Multer errors
const upload = multer({
  storage: disk,
  //   1mb max
  limits: { fileSize: 1_000_000, fields: 0, files: 1 },
  fileFilter,
});

const imageRouter = Router();

// guard
imageRouter.use([authMiddleware, validateUser]);

imageRouter.post("/", upload.single("image"), uploadImage);

export { imageRouter };
