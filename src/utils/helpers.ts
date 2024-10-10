import { Request } from "express";
import multer from "multer";
import { Mime } from "./validators";
import { API_VERSION } from "../config/constants";
import { ENVIRONMENT, PORT } from "../config";

export function formatRegularErrorMessage(errorMsg: string) {
  return [{ message: errorMsg }];
}

export function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const result = Mime.safeParse(file.mimetype);

  if (!result.success) {
    cb(null, false);
  }

  cb(null, true);
}

export function generatePublicURL(fileName: string, req: Request) {
  const proto = req.secure ? "https" : "http";
  const port = ENVIRONMENT === "development" ? `:${PORT}` : "";
  // TODO: probably change to host in prod
  return `${proto}://${req.hostname}${port}/api/${API_VERSION}/${fileName}`;
}
