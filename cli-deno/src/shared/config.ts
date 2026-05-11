import { z } from "zod";

export const ConfigSchema = z
  .object({
    carddav: z.object({
      url: z.string().url(),
      credentials: z
        .object({
          username: z.string().optional(),
          password: z.string().optional(),
        })
        .or(
          z.object({
            tokenUrl: z.string().url(),
            username: z.string().min(1),
            refreshToken: z.string().min(1),
            clientId: z.string().min(1),
            clientSecret: z.string().min(1),
          })
        ),
      authMethod: z.literal("Basic").or(z.literal("Oauth")).default("Basic"),
      syncAddressBookDisplayName: z.string().optional(),
    }),
    md: z.object({
      directory: z.string(),
      fileFilter: z.array(z.string()).optional(),
      photosDirectory: z.string().optional(),
    }),
  })
  .strict();
