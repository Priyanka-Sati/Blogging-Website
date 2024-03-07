import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "project-medium-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userID: string;
  };
}>();

// middleware
blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";

  try {
    const user = await verify(authHeader, c.env.JWT_SECRET);

    c.set("userID", user.id);
    await next();

  } catch (error) {
    c.status(403);
    return c.json({
      msg: "You are not signed in",
    });
  }
});

blogRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const result = createBlogInput.safeParse(body);
  if (!result.success) {
    c.status(411);
    return c.json({
      message: "Incorrect inputs",
      cause: result.error.issues[0].message,
    });
  }

  const authorId = c.get("userID");
  try {
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: Number(authorId),
      },
    });

    return c.json({
      msg: "Blog created successfully",
      blog,
    });
  } catch (error) {
    c.status(411);
    return c.json({ msg: "Something went wrong" });
  }
});

blogRouter.put("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const result = updateBlogInput.safeParse(body);
  if (!result.success) {
    c.status(411);
    return c.json({
      message: "Incorrect inputs",
      cause: result.error.issues[0].message,
    });
  }

  try {
    const blog = await prisma.blog.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    return c.json({
      msg: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    c.status(411);
    return c.json({ msg: "Something went wrong" });
  }
});

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.findMany({
      select: {
        content: true,
        title: true,
        id: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return c.json({
      msg: "Blogs fetced successfully",
      blog,
    });
  } catch (error) {
    c.status(411);
    return c.json({ msg: "Something went wrong" });
  }
});

blogRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const id = c.req.param("id");

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id: Number(id),
      },
      select: {
        content: true,
        title: true,
        id: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return c.json({
      msg: "Blog fetched successfully",
      blog,
    });
  } catch (error) {
    c.status(411);
    return c.json({ msg: "Error while fetching blog post" });
  }
});
