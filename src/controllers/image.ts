import { Request, Response } from "express";
import { UserType } from "../utils/validators";
import { formatRegularErrorMessage } from "../utils/helpers";

export function uploadImage(req: Request, res: Response) {
  const user = req.user as UserType;

  // get image data from request
  console.log("File:", req.file);
  // check file size
  // compress or scale down images bigger than 100kb
  // store to disk
  // get storage path
  // write path to db

  res
    .status(200)
    .json({ message: "Success", data: { file: { path: req.file?.path } } });
}
