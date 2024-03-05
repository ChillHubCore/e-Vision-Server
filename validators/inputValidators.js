import { z } from "zod";

export const zeroEmptySpaceValidator = z
  .string()
  .refine((value) => !/\s/.test(value), {
    message: "String should not contain any empty spaces",
  });
