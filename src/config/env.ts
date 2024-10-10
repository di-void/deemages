export const FILE_UPLOAD_LOCATION = process.env.STORAGE_PATH
  ? `${process.env.STORAGE_PATH}`
  : "uploads";

export const PUBLIC_IMAGES_PATH = "public/images";

export const PORT = process.env.PORT || 3000;

export const ENVIRONMENT = process.env.NODE_ENV
  ? process.env.NODE_ENV
  : "development";
