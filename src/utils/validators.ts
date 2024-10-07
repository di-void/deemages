import zod from "zod";

export const User = zod.object({
  username: zod.string().min(1),
  password: zod.string().min(1),
});

export type UserType = zod.infer<typeof User>;

const UserId = zod.number().gt(0);

export const UploadImage = zod.object({
  userId: UserId,
  // more to come
});

export type UploadImageType = zod.infer<typeof UploadImage>;
