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
  formatRegularErrorMessage,
  formatZodError,
  generatePublicURL,
} from "../utils/helpers";
import sharp from "sharp";
import fs from "node:fs";
import { Buffer } from "node:buffer";
import { db } from "../db";
import { FileTypeOptions, image, type NewImage } from "../db/schema";

const HUNDRED_KB = 100 * 1024;

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

    const size =
      newImageRecord.fileSize > 0 ? newImageRecord.fileSize / 1024 : 0;

    const meta = {
      fileSize: `${size.toFixed(2)}kb`,
      dimensions: `${newImageRecord.width} x ${newImageRecord.height}`,
      fileType: newImageRecord.fileType,
    };

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

  const imageIdResult = Params.safeParse(req.params);

  if (!imageIdResult.success) {
    return res.status(400).json({
      message: "error",
      error: formatRegularErrorMessage("Invalid ID"),
    });
  }

  const { imageId } = imageIdResult.data;

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
  let imageBuffer = Buffer.alloc(0);

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
  // to uploads directory
  // return transformed image link with metadata in response
}

// transformation functions

async function resizeImage(data: Buffer, params: ResizeType): Promise<Buffer> {
  // resize image
  return Buffer.from([]);
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
