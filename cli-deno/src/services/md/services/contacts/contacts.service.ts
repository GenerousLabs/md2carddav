import { ContactSchema } from "../../../../shared/schemas.ts";
import { Contact, Returns } from "../../../../shared/types.ts";

export const getContactFromYamlFrontmatterData = (data: {
  [key: string]: unknown;
}): Returns<Contact> => {
  const parseResult = ContactSchema.safeParse(data);

  if (parseResult.success) {
    return { success: true, result: parseResult.data };
  }

  return {
    success: false,
    error: parseResult.error.toString(),
    code: "md.contacts.invalid",
  };
};
