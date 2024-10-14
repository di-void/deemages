import { Request } from "express";
import multer from "multer";
import { Mime } from "./validators";
import { ENVIRONMENT, PORT, API_VERSION } from "../config";
import { ZodError } from "zod";

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
  return `${proto}://${req.hostname}${port}/api/${API_VERSION}/${fileName}`;
}

export function formatZodError<T>(error: ZodError<T>) {
  return error.issues.map(({ message, path }) => ({ message, path }));
}
