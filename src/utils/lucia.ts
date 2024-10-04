import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "../db/index.js";
import { session, user } from "../db/schema.js";
import { Lucia } from "lucia";

const adapter = new DrizzleSQLiteAdapter(db, session, user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  // getUserAttributes: (attributes) => {
  //     return {}
  // }
});

declare module "lucia" {
  interface Register {
    lucia: typeof lucia;
    UserId: number;
  }
}
