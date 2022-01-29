import { ContactSchema } from "../../../../shared.schemas";
import { Contact, Returns } from "../../../../shared.types";

export const getContactFromYamlFrontmatterData = (data: {
  [key: string]: any;
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
