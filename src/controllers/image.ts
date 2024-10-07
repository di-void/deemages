import { Request, Response } from "express";
import { UploadImage } from "../utils/validators";
import { formatRegularErrorMessage } from "../utils/helpers";

export function upload(req: Request, res: Response) {
  const result = UploadImage.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      status: "error",
      error: formatRegularErrorMessage("Malformed data"),
    });
  }

  const { user } = result.data;

  res.status(200).json({ message: `hello images, from ${user.username}` });
}
