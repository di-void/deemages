import { Request, Response } from "express";
import { UserType } from "../utils/validators";
import { formatRegularErrorMessage } from "../utils/helpers";
import sharp from "sharp";
import fs from "node:fs";
import { FILE_STORAGE_LOCATION } from "../config";

const HUNDRED_KB = 100 * 1024;

export async function uploadImage(req: Request, res: Response) {
  const user = req.user as UserType;

  try {
    // get image data from request
    let filePath = req.file?.path!;

    // check file size
    if (req.file!.size >= HUNDRED_KB) {
      const newFilePath =
        `${FILE_STORAGE_LOCATION}/compressed-` + req.file?.filename;

      const inputBuffer = fs.readFileSync(filePath);

      // compress or scale down images bigger than 100kb
      const outputBuffer = await sharp(inputBuffer)
        .resize({ width: 800 })
        .toBuffer();

      fs.writeFileSync(filePath, outputBuffer);
      // fs.unlinkSync(filePath);
    }

    // get storage path
    // write path to db

    res.status(200).json({
      message: "success",
      data: { message: "File uploaded successfully" },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "error",
      error: formatRegularErrorMessage("something went wrong"),
    });
  }
}
