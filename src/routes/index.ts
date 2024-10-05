import { Router } from "express";
import { authRouter } from "./auth";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);

mainRouter.get("/test", (req, res) => {
  res.send("Hello world");
});

export { mainRouter };
