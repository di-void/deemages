import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { validateUser } from "../middleware/user";
import {
  listImages,
  listTransforms,
  retrieveImage,
  transformImage,
  uploadImage,
} from "../controllers/image";
import { fileFilter } from "../utils/helpers";
import multer from "multer";
import { FILE_UPLOAD_LOCATION, PUBLIC_IMAGES_PATH } from "../config";
import shortUUID from "short-uuid";
import { rateLimit } from "express-rate-limit";

const disk = multer.diskStorage({
  // image upload destionation
  destination: `${PUBLIC_IMAGES_PATH}/${FILE_UPLOAD_LOCATION}`,

  filename: function (_req, file, cb) {
    const ext = "." + file.mimetype.split("/")[1];

    // custom file name
    const uid = shortUUID().generate();
    const filename = file.fieldname + "-" + uid + ext;

    cb(null, filename);
  },
});

// TODO: error handling for Multer errors
const upload = multer({
  storage: disk,
  //   ~500kb max
  limits: { fileSize: 500_000, fields: 0, files: 1 },
  fileFilter,
});

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes window
  limit: 10, // 10 requests limit for each IP per 5 minutes
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});

const imageRouter = Router();

// guard
imageRouter.use([authMiddleware, validateUser]);

imageRouter.post("/", upload.single("image"), uploadImage);
imageRouter.post("/:imageId/transform", limiter, transformImage);
imageRouter.get("/", listImages);
imageRouter.get("/transforms", listTransforms);
imageRouter.get("/:imageId", retrieveImage);

export { imageRouter };
