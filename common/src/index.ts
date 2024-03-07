import z from "zod";

export const signupInput = z.object({
  name: z.string().optional(),
  password: z.string().min(6),
  email: z.string().email(),
});

export const signinInput = z.object({
  password: z.string().min(6),
  email: z.string().email(),
});

export const createBlogInput = z.object({
  title: z.string(),
  content: z.string(),
});

export const updateBlogInput = z.object({
  title: z.string(),
  content: z.string(),
  id: z.number(),
});

export type SignupInput = z.infer<typeof signupInput>;
export type SigninInput = z.infer<typeof signinInput>;
export type CreateBlogInput = z.infer<typeof createBlogInput>;
export type UpdateBlogInput = z.infer<typeof updateBlogInput>;
