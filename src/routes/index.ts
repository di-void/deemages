import { Router } from "express";
import { authRouter } from "./auth";
import { imageRouter } from "./image";
import serveStatic from "serve-static";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/images", imageRouter);

// serve uploaded images
mainRouter.use(serveStatic("public/images/uploads"));
// serve transformed images
mainRouter.use(serveStatic("public/images/transforms"));

export { mainRouter };
