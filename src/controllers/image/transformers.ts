import { Buffer } from "node:buffer";
import sharp from "sharp";
import {
  type CropType,
  type ResizeType,
  type FormatType,
} from "../../utils/validators.js";

export async function resizeImage(
  data: Buffer,
  params: ResizeType
): Promise<Buffer> {
  // resize image
  const resized = await sharp(data)
    .resize({ width: params.width, height: params.height })
    .toBuffer();
  return resized;
}

// todo: is cropping validation necessary?
export async function cropImage(
  data: Buffer,
  params: CropType
): Promise<Buffer> {
  // crop image
  const cropped = await sharp(data)
    .extract({
      left: params.x,
      top: params.y,
      width: params.width,
      height: params.height,
    })
    .toBuffer();
  return cropped;
}

export async function changeImageFormat(
  data: Buffer,
  params: FormatType
): Promise<Buffer> {
  // change image format
  const formatted = await sharp(data).toFormat(params).toBuffer();
  return formatted;
}
