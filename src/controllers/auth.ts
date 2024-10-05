import { Request, Response } from "express";
import { SqliteError } from "better-sqlite3";
import { User } from "../utils/validators";
import { lucia } from "../utils/lucia";
import { db } from "../db/index";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";
import { verify, hash } from "@node-rs/argon2";
import { ZodError } from "zod";

const argonConfig = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export async function register(req: Request, res: Response) {
  const parseResult = User.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(422).json({ message: "error", error: "Malformed data" });
  }

  const userData = parseResult.data;

  const passwordHash = await hash(userData.password, argonConfig);

  try {
    const result = await db
      .insert(user)
      .values({ username: userData.username, password: passwordHash })
      .returning({ insertedId: user.id });

    const newUser = result[0];
    if (!newUser) {
      return res
        .status(500)
        .json({ message: "error", data: "something went wrong" });
    }

    const session = await lucia.createSession(newUser.insertedId, {});
    return res
      .status(200)
      .json({ message: "success", data: { sessionId: session.id } });
  } catch (error) {
    if (
      error instanceof SqliteError &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      return res
        .status(400)
        .json({ message: "error", data: { error: "Username already exists" } });
    }

    console.log("Error:", error);

    return res
      .status(500)
      .json({ message: "error", data: { error: "An unknown error occured" } });
  }
}

export async function login(req: Request, res: Response) {
  const parseResult = User.safeParse(req.body);

  if (!parseResult.success) {
    return res
      .status(400)
      .json({ message: "error", data: formatZodError(parseResult.error) });
  }

  const data = parseResult.data;

  // find user
  try {
    const result = await db
      .select({ id: user.id, password: user.password })
      .from(user)
      .where(eq(user.username, data.username));

    const dbUser = result[0];

    if (!dbUser) {
      return res
        .status(400)
        .json({ message: "error", error: "Invalid username or password" });
    }

    // validate password
    const isValidPassword = await verify(
      dbUser.password,
      data.password,
      argonConfig
    );

    if (!isValidPassword) {
      return res
        .status(400)
        .json({ message: "error", error: "Invalid username or password" });
    }

    const session = await lucia.createSession(dbUser.id, {});

    return res
      .status(200)
      .json({ message: "success", data: { sessionId: session.id } });
  } catch (error) {
    console.log("Error:", error);
    return res
      .status(500)
      .json({ message: "error", data: { error: "An unknown error occured" } });
  }
}

export async function logout(req: Request, res: Response) {
  const sessionId = lucia.readBearerToken(req.headers.authorization ?? "");
  if (!sessionId) {
    return res.status(401).end();
  }

  await lucia.invalidateSession(sessionId);

  return res.status(200).json({ message: "success", data: null });
}

function formatZodError(
  error: ZodError<{ username: string; password: string }>
) {
  return error.issues.map(({ message, path }) => ({ message, path }));
}
