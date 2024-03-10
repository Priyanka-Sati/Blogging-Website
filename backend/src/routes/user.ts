import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "project-medium-common";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  // zod validation
  const result = signupInput.safeParse(body);
  if (!result.success) {
    c.status(411);
    return c.json({
      message: "Incorrect inputs",
      cause: result.error.issues[0].message,
    });
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.text(jwt);
  } catch (e) {
    c.status(411);
    return c.json({ error: "error while signing up", e });
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const result = signinInput.safeParse(body);
  if (!result.success) {
    c.status(411);
    return c.json({
      message: "Incorrect inputs",
      cause: result.error.issues[0].message,
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password,
      },
    });

    if (!user) {
      c.status(403);
      return c.json({ error: "User not found" });
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.text(jwt);
  } catch (error) {
    c.status(411);
    return c.json({
      msg: "Invalid Username and Password",
    });
  }
});
