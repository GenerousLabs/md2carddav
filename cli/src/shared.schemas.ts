import { z } from "zod";

export const ContactSchemaBase = z.object({
  uid: z.string(),
  company: z.string().optional(),
  name: z
    .object({
      full: z.string().optional(),
      prefix: z.string().or(z.string().array()).optional(),
      first: z.string().or(z.string().array()).optional(),
      middle: z.string().or(z.string().array()).optional(),
      last: z.string().or(z.string().array()).optional(),
      suffix: z.string().or(z.string().array()).optional(),
    })
    .optional(),
  photo: z.string().optional(),
  phones: z
    .array(
      z
        .object({
          type: z.string(),
          phone: z.string(),
        })
        .or(z.string())
    )
    .optional(),
  emails: z
    .array(
      z
        .object({
          type: z.string(),
          email: z.string(),
        })
        .or(z.string())
    )
    .optional(),
  addresses: z
    .array(
      z
        .object({
          type: z.string().optional(),
          line1: z.string().optional(),
          line2: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postcode: z.string().optional(),
          country: z.string().optional(),
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
      z.string().or(
        z.object({
          type: z.string(),
          url: z.string(),
        })
      )
    )
    .optional(),
  desc: z.string().optional(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ContactSchema = ContactSchemaBase.refine((obj) => {
  // VCards don't require a name, they can be valid with only an email
  return true;

  /*
  // Ensure that the object has at least one name
  if (typeof obj.name !== "undefined") {
    if (typeof obj.name.full === "string" && obj.name.full.length > 0) {
      return true;
    }

    if (typeof obj.name.first === "string" && obj.name.first.length > 0) {
      return true;
    }

    if (typeof obj.name.last === "string" && obj.name.last.length > 0) {
      return true;
    }
  }

  if (typeof obj.company === "string" && obj.company.length > 0) {
    return true;
  }

  return false;
  */
});
