import { Router } from "express";
import { logout, login, register } from "../controllers/auth.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

export { authRouter };
