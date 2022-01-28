import { z } from "zod";

export const ConfigSchema = z
  .object({
    url: z.string().url(),
    username: z.string().optional(),
    password: z.string().optional(),
  })
  .strict();
