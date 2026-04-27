import { z } from "zod";

export const userRegisterSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username is required" })
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username cannot exceed 50 characters")
      .trim(),
    fullName: z
      .string({ required_error: "Fullname is Required" })
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username cannot exceed 50 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .lowercase()
      .trim(),

    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    role: z.enum(["user", "vendor"]).default("user"),
  }),
});
