import { Router } from "express";
import { authRouter } from "./auth.js";
import { imageRouter } from "./image.js";
import serveStatic from "serve-static";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/images", imageRouter);

// serve uploaded images
mainRouter.use(serveStatic("public/images/uploads"));

export { mainRouter };
