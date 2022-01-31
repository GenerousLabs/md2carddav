import { z } from "zod";

export const ContactSchema = z.object({
  uid: z.string().min(1),
  // We track full name in the `title` field, and it can't be empty
  title: z
    .string()
    .min(1)
    .refine((title) => title.trim().length > 0),
  company: z.string().min(1).optional(),
  name: z
    .object({
      prefix: z.string().min(1).or(z.string().min(1).array()).optional(),
      first: z.string().min(1).or(z.string().min(1).array()).optional(),
      middle: z.string().min(1).or(z.string().min(1).array()).optional(),
      last: z.string().min(1).or(z.string().min(1).array()).optional(),
      suffix: z.string().min(1).or(z.string().min(1).array()).optional(),
    })
    .optional(),
  nickname: z.string().min(1).optional(),
  photo: z.string().min(3).optional(),
  phones: z
    .array(
      z
        .string()
        .min(1)
        .or(
          z.object({
            type: z.string().min(1),
            phone: z.string().min(1),
          })
        )
    )
    .optional(),
  emails: z
    .array(
      z
        .string()
        .min(1)
        .or(
          z.object({
            type: z.string().min(1),
            email: z.string().min(6),
          })
        )
    )
    .optional(),
  addresses: z
    .array(
      z
        .object({
          type: z.string().min(1).optional(),
          line1: z.string().min(1).optional(),
          line2: z.string().min(1).optional(),
          city: z.string().min(1).optional(),
          state: z.string().min(1).optional(),
          postcode: z.string().min(1).optional(),
          country: z.string().min(1).optional(),
        })
        .refine((obj) => {
          // Ensure that there is not an empty address
          if (
            typeof obj.line1 === "undefined" &&
            typeof obj.line2 === "undefined" &&
            typeof obj.city === "undefined" &&
            typeof obj.postcode === "undefined" &&
            typeof obj.state === "undefined" &&
            typeof obj.country === "undefined"
          ) {
            return false;
          }

          return true;
        })
    )
    .optional(),
  urls: z
    .array(
      z
        .string()
        .min(1)
        .or(
          z.object({
            type: z.string().min(1),
            url: z.string().min(1),
          })
        )
    )
    .optional(),
  desc: z.string().optional(),
});
