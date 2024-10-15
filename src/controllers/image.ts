import { Request, Response } from "express";
import {
  CropType,
  FormatType,
  Params,
  ResizeType,
  Transformations,
  UserType,
} from "../utils/validators";
import {
  formatImageMeta,
  formatRegularErrorMessage,
  formatZodError,
  generatePublicURL,
} from "../utils/helpers";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { db } from "../db";
import { FileTypeOptions, image, type NewImage } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { FILE_UPLOAD_LOCATION, PUBLIC_IMAGES_PATH } from "../config";

const HUNDRED_KB = 100 * 1024;
const UPLOAD_LOCATION = `${PUBLIC_IMAGES_PATH}/${FILE_UPLOAD_LOCATION}`;

export async function uploadImage(req: Request, res: Response) {
  const user = req.user as UserType;

  try {
    // get image data from request
    const uploadedImage = req.file!;

    // i eat memory.. yum
    let imgBuffer = fs.readFileSync(uploadedImage.path);

    // check file size
    if (uploadedImage.size >= HUNDRED_KB) {
      // scale down images bigger than 100kb
      imgBuffer = await sharp(imgBuffer).resize({ width: 800 }).toBuffer();

      fs.writeFileSync(uploadedImage.path, imgBuffer);
    }

    const metadata = await sharp(imgBuffer).metadata();

    const newImageRecord: NewImage = {
      userId: user.id,
      fileSize: metadata.size ?? 0,
      fileType: metadata.format as FileTypeOptions,
      storagePath: uploadedImage.path,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      fileName: uploadedImage.filename,
    };

    // write path to db
    await db.insert(image).values(newImageRecord);

    // filename, request
    const publicUrl = generatePublicURL(newImageRecord.fileName, req);

    const meta = formatImageMeta({
      width: newImageRecord.width,
      height: newImageRecord.height,
      size: newImageRecord.fileSize,
      type: newImageRecord.fileType,
    });

    res.status(200).json({
      message: "success",
      data: { msg: "File uploaded successfully", url: publicUrl, meta },
    });
  } catch (error) {
    console.error(error);
    // TODO: might want to clear uploaded images on failure
    // because the images will have gotten through
    // and successfully uploaded by the time handler runs

    return res.status(500).json({
      message: "error",
      error: formatRegularErrorMessage("something went wrong"),
    });
  }
}

export async function transformImage(req: Request, res: Response) {
  // resize
  // crop
  // change format (e.g png -> jpeg)
  const authedUser = req.user as UserType;

  const imageIdResult = Params.safeParse(req.params);

  if (!imageIdResult.success) {
    return res.status(400).json({
      message: "error",
      error: formatRegularErrorMessage("Invalid ID"),
    });
  }

  const transResult = Transformations.safeParse(req.body);

  if (!transResult.success) {
    return res.status(400).json({
      message: "error",
      error: formatZodError(transResult.error),
    });
  }

  const transformations = transResult.data.transformations;

  // are there transformations?
  let isTransformationPresent = false;

  // fetch image data into buffer
  const { imageId } = imageIdResult.data;
  try {
    const imgData = await db
      .select({ filePath: image.storagePath, fileName: image.fileName })
      .from(image)
      .where(and(eq(image.id, imageId), eq(image.userId, authedUser.id)));

    if (imgData.length === 0) {
      return res.status(404).json({
        message: "error",
        error: formatRegularErrorMessage("Image Not Found"),
      });
    }

    const { filePath, fileName } = imgData[0]!;

    let imageBuffer = fs.readFileSync(filePath);

    for (let key in transformations) {
      const tKey = key as keyof typeof transformations;

      if (transformations[tKey]) {
        isTransformationPresent = true;
        const options = transformations[tKey];

        switch (tKey) {
          case "resize": {
            // resize image
            imageBuffer = await resizeImage(imageBuffer, options as ResizeType);

            break;
          }

          case "format": {
            // change image format
            imageBuffer = await changeImageFormat(
              imageBuffer,
              options as FormatType
            );

            break;
          }

          case "crop": {
            // crop image
            imageBuffer = await cropImage(imageBuffer, options as CropType);

            break;
          }

          default: {
            continue;
          }
        }
      }
    }

    if (!isTransformationPresent) {
      return res
        .status(422)
        .json({ message: "error", error: "No transformations" });
    }

    // write image data to file with same name with `tr` prefix
    const newFileName = `tr-${randomUUID().slice(-6)}-${fileName}`;
    const writePath = path.normalize(`${UPLOAD_LOCATION}/${newFileName}`);

    fs.writeFileSync(writePath, imageBuffer);

    const metadata = await sharp(imageBuffer).metadata();

    const newImageRecord: NewImage = {
      userId: authedUser.id,
      fileName: newFileName,
      fileSize: metadata.size ?? 0,
      fileType: metadata.format as FileTypeOptions,
      height: metadata.height ?? 0,
      width: metadata.width ?? 0,
      storagePath: writePath,
    };

    await db.insert(image).values(newImageRecord);

    const publicUrl = generatePublicURL(newFileName, req);

    const meta = formatImageMeta({
      width: newImageRecord.width,
      height: newImageRecord.height,
      size: newImageRecord.fileSize,
      type: newImageRecord.fileType,
    });

    // return transformed image link with metadata in response
    return res.status(200).json({
      message: "success",
      data: { msg: "File transformed successfully", url: publicUrl, meta },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "error",
      error: formatRegularErrorMessage("something went wrong"),
    });
  }
}

// transformation functions
async function resizeImage(data: Buffer, params: ResizeType): Promise<Buffer> {
  const resized = await sharp(data)
    .resize({ width: params.width, height: params.height })
    .toBuffer();
  return resized;
}

async function cropImage(data: Buffer, params: CropType): Promise<Buffer> {
  // crop image
  return Buffer.from([]);
}

async function changeImageFormat(
  data: Buffer,
  params: FormatType
): Promise<Buffer> {
  // change image format
  return Buffer.from([]);
}
