import { z } from "zod";

export const ConfigSchema = z
  .object({
    carddav: z.object({
      url: z.string().url(),
      username: z.string().optional(),
      password: z.string().optional(),
      syncAddressBookDisplayName: z.string().optional(),
    }),
    md: z.object({
      directory: z.string(),
      fileFilter: z.array(z.string()).optional(),
      photosDirectory: z.string().optional(),
    }),
  })
  .strict();
