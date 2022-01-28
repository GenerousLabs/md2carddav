import { z } from "zod";

export const ConfigSchema = z
  .object({
    url: z.string().url(),
    username: z.string().optional(),
    password: z.string().optional(),
    md: z.object({
      directory: z.string(),
      fileFilter: z.array(z.string()).optional(),
    }),
  })
  .strict();
