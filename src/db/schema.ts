import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable(
  "users",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    username: text("username").notNull(),
    password: text("password").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`),
  },
  // for auth purposes
  (table) => ({ usernameIdx: uniqueIndex("username_idx").on(table.username) })
);

type Dimension = {
  width: number;
  height: number;
};

export const image = sqliteTable(
  "images",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    storagePath: text("storage_path").notNull(),
    fileType: text("file_type", { enum: ["png", "jpeg"] })
      .$type<"png" | "jpeg">()
      .notNull(),
    fileSize: integer("file_size", { mode: "number" }).notNull(),
    dimensions: text("dimensions").$type<Dimension>(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`),
    userId: integer("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
  },
  // optimize image-fetching queries for users
  (table) => ({ userIdIdx: index("user_id_idx").on(table.userId) })
);

export const session = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at").notNull(),
  userId: integer("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
});
