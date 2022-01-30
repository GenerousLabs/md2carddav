import { z } from "zod";

export const ContactSchemaBase = z.object({
  uid: z.string().min(3),
  company: z.string().min(1).optional(),
  name: z
    .object({
      full: z.string().min(1).optional(),
      prefix: z.string().min(1).or(z.string().min(1).array()).optional(),
      first: z.string().min(1).or(z.string().min(1).array()).optional(),
      middle: z.string().min(1).or(z.string().min(1).array()).optional(),
      last: z.string().min(1).or(z.string().min(1).array()).optional(),
      suffix: z.string().min(1).or(z.string().min(1).array()).optional(),
    })
    .optional(),
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

/**
 * A VCF file must have an `FN:` (full name) attribute. But it doesn't
 * need to be an actual name. It could be an email address, a company
 * name, whatever. We require at least one of full name, first name, last name,
 * company name, or email address. If a full name is not present, we can fill it
 * in with one of those values instead.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ContactSchema = ContactSchemaBase.refine((obj) => {
  // Ensure that the object has at least one name
  if (typeof obj.name !== "undefined") {
    if (typeof obj.name.full === "string" && obj.name.full.trim().length > 0) {
      return true;
    }

    if (
      typeof obj.name.first === "string" &&
      obj.name.first.trim().length > 0
    ) {
      return true;
    }

    if (typeof obj.name.last === "string" && obj.name.last.trim().length > 0) {
      return true;
    }
  }

  if (typeof obj.company === "string" && obj.company.trim().length > 0) {
    return true;
  }

  if (typeof obj.emails !== "undefined" && obj.emails.length > 0) {
    for (const email of obj.emails) {
      if (typeof email === "string") {
        if (email.trim().length > 0) {
          return true;
        }
      } else if (email.email.trim().length > 0) {
        return true;
      }
    }
  }

  return false;
});
