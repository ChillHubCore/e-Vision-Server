import { z } from "zod";

export const passwordValidator = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter");

export const emailValidator = z.string().email("Invalid email address");

export const phoneValidator = z
  .string()
  .min(10, "Invalid phone number")
  .refine((value) => /^\d+$/.test(value), "Invalid phone number");
