import { type Request } from "express";
import multer from "multer";
import { Mime } from "./validators";
import { ENVIRONMENT, PORT, API_VERSION } from "../config";
import * as z from "zod";
import { type FileTypeOptions } from "../db/schema";

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

export type PartialImage = {
  imgId: number;
  name: string;
  size: number;
  width: number;
  height: number;
  type: FileTypeOptions;
};

type MappedPartialImage = {
  id: PartialImage["imgId"];
  meta: ImageMeta;
};

export function mapPartialImageList(
  imageList: PartialImage[]
): MappedPartialImage[] {
  return imageList.map((img) => mapPartialImage(img));
}

export function mapPartialImage(image: PartialImage): MappedPartialImage {
  return {
    id: image.imgId,
    meta: formatImageMeta({
      height: image.height,
      size: image.size,
      type: image.type,
      width: image.width,
    }),
  };
}

export function jsonifyZodSchema(schema: any) {
  // get schema shape if schema is object
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const jsonLike: any = {};

    for (let key in shape) {
      jsonLike[key] = jsonifyZodSchema(shape[key]);
    }

    return jsonLike;
  }

  // is schema zod optional
  if (schema instanceof z.ZodOptional) {
    return jsonifyZodSchema(schema.unwrap());
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

export type PaginationInfo = {
  current_page: number;
  total_pages: number;
  page_size: number;
  has_next_page: boolean;
};

export function generatePaginationInfo({
  page,
  limit,
  count,
}: {
  page: number;
  limit: number;
  count: number;
}): PaginationInfo {
  return {
    current_page: page,
    total_pages: Math.ceil(count / limit),
    page_size: limit,
    has_next_page: count - page * limit > limit,
  };
}
