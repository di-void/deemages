import { Request, Response } from "express";
import { UserType } from "../utils/validators";
import { formatRegularErrorMessage } from "../utils/helpers";

export function uploadImage(req: Request, res: Response) {
  const user = req.user as UserType;
  console.log("User:", user);

  // get image data from request
  // validate image size within defined limits
  // validate image file type
  // if validation passes, compress the image
  // store to disk
  // get storage path
  // write path to db

  res
    .status(200)
    .json({ message: "Success", data: { file: { path: req.file?.path } } });
}
