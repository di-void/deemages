import { Request } from "express";
import multer from "multer";
import { Mime } from "./validators";
import { ENVIRONMENT, PORT, API_VERSION } from "../config";
import { ZodError } from "zod";
import { FileTypeOptions } from "../db/schema";

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

type ImageMeta = {
  fileType: FileTypeOptions;
  dimensions: string;
  fileSize: string;
};

type ImageMetaOptions = {
  size: number;
  width: number;
  height: number;
  type: FileTypeOptions;
};

export function formatImageMeta({
  size,
  width,
  height,
  type,
}: ImageMetaOptions): ImageMeta {
  const kbSize = size > 0 ? size / 1024 : 0;

  return {
    fileSize: `${kbSize.toFixed(2)}`,
    dimensions: `${width} x ${height}`,
    fileType: type,
  };
}
