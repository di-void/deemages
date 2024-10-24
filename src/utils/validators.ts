import zod from "zod";

export const CreateUser = zod.object({
  username: zod.string().min(1),
  password: zod.string().min(1),
});
export type CreateUserType = zod.infer<typeof CreateUser>;

export const User = zod.object({
  id: zod.number().gt(0),
  username: zod.string().min(1),
});
export type UserType = zod.infer<typeof User>;

export const Mime = zod.enum(["image/png", "image/jpeg"]);
export type MimeType = zod.infer<typeof Mime>;

const StringToNumTransform = zod
  .string()
  .min(1)
  .transform((val, ctx) => {
    const parsed = parseInt(val);
    if (isNaN(parsed)) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: "Not a number",
      });

      return zod.NEVER;
    }

    return parsed;
  });

export const Params = zod.object({
  imageId: StringToNumTransform,
});
export type ParamsType = zod.infer<typeof Params>;

const Resize = zod.object({
  width: zod.number().min(200),
  height: zod.number().min(200),
});
export type ResizeType = zod.infer<typeof Resize>;

const Crop = zod.object({
  x: zod.number().int(),
  y: zod.number().int(),
  width: zod.number().min(100),
  height: zod.number().min(100),
});
export type CropType = zod.infer<typeof Crop>;

const Format = zod.enum(["png", "jpeg"]);
export type FormatType = zod.infer<typeof Format>;

export const Transformations = zod.object({
  transformations: zod.object({
    resize: Resize.optional(),
    crop: Crop.optional(),
    format: Format.optional(),
  }),
});
export type TransformationsType = zod.infer<typeof Transformations>;

export const Pagination = zod.object({
  page: StringToNumTransform.default("1"),
  limit: StringToNumTransform.default("10"),
});
export type PaginationType = zod.infer<typeof Pagination>;
