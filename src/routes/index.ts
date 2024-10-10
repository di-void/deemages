import { Router } from "express";
import { authRouter } from "./auth";
import { imageRouter } from "./image";
import serveStatic from "serve-static";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/images", imageRouter);

// serve uploaded images
mainRouter.use(serveStatic("public/uploads"));

mainRouter.get("/test", (req, res) => {
  res.send("Hello world");
});

export { mainRouter };
