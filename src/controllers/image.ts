import { Request, Response } from "express";
import { UserType } from "../utils/validators";
import { formatRegularErrorMessage, generatePublicURL } from "../utils/helpers";
import sharp from "sharp";
import fs from "node:fs";
import { db } from "../db";
import { Dimension, FileTypeOptions, image, type NewImage } from "../db/schema";

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

    // console.log("New Image Record:", newImageRecord);

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
