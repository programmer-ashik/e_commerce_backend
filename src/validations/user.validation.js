import z from "zod";

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be a last 6 chars"),
    role: z.enum(["user", "vendor"]).optional(),
  }),
});
