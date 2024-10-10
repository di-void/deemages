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
