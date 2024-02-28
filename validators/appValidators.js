import { z } from "zod";

export const duplicateArrayValidator = z
  .array(z.string())
  .refine((items) => new Set(items).size === items.length, {
    message: "Must be an array of unique strings",
  });

export const contactAddressesValidator = z.object({
  physical: z.string().min(3).max(255),
  email: z.string().email("Invalid email address"),
  countryCode: z.string().min(3).max(255),
  phone: z.string().min(3).max(255),
  postalCode: z.string().min(3).max(255),
});

export const appValidator = z.object({
  userStatus: z.array(z.string().min(3).max(255)),
});
