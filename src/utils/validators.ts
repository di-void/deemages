import zod from "zod";

export const User = zod.object({
  username: zod.string().min(1),
  password: zod.string().min(1),
});

export type User = zod.infer<typeof User>;
