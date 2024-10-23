import { Request } from "express";
import multer from "multer";
import { Mime } from "./validators";
import { ENVIRONMENT, PORT, API_VERSION } from "../config";
import * as z from "zod";
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

export function formatZodError<T>(error: z.ZodError<T>) {
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

type Img = {
  imgId: number;
  name: string;
  size: number;
  width: number;
  height: number;
  type: FileTypeOptions;
};

type MappedImg = {
  id: Img["imgId"];
  url: string;
  meta: ImageMeta;
};

export function mapImageList(imageList: Img[], req: Request): MappedImg[] {
  return imageList.map((img) => ({
    id: img.imgId,
    url: generatePublicURL(img.name, req),
    meta: formatImageMeta({
      height: img.height,
      size: img.size,
      type: img.type,
      width: img.width,
    }),
  }));
}

export function jsonifySchema(schema: any) {
  // get schema shape if schema is object
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const jsonLike: any = {};

    for (let key in shape) {
      jsonLike[key] = jsonifySchema(shape[key]);
    }

    return jsonLike;
  }

  // is schema zod optional
  if (schema instanceof z.ZodOptional) {
    return jsonifySchema(schema.unwrap());
  }

  // is schema zod number
  if (schema instanceof z.ZodNumber) {
    return "number";
  }

  // is schema zod enum
  if (schema instanceof z.ZodEnum) {
    const opts = schema.options as string[];
    return opts.join(" | ");
  }

  // is schema zod string
  if (schema instanceof z.ZodString) {
    return "string";
  }

  // and others...
}
