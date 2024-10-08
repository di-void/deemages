import { Router } from "express";
import { authRouter } from "./auth";
import { imageRouter } from "./image";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/images", imageRouter);

mainRouter.get("/test", (req, res) => {
  res.send("Hello world");
});

export { mainRouter };
