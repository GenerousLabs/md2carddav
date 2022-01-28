/* eslint-disable unicorn/no-array-for-each */
import { VCard } from "@covve/easy-vcard";
import { ContactFields, Returns } from "../../shared.types";
import { Contact } from "../md/services/contacts/contacts.service";

export const getUidFromVcard = (input: string): Returns<string> => {
  if (typeof input !== "string") {
    return {
      success: false,
      error: "Invalid vcard #C4tXK8",
      code: "vcard.invalid",
    };
  }

  const lines = input.split("\n");
  const uidLine = lines.find((line) => line.startsWith("UID:"));

  if (typeof uidLine === "undefined") {
    return {
      success: false,
      error: "Failed to find UID #VR5mde",
      code: "vcard.nouid",
    };
  }

  const uid = uidLine.slice(4).trim();

  return {
    success: true,
    result: uid,
  };
};

// eslint-disable-next-line complexity
export const generateVcardFromContact = (contact: Contact): string => {
  const vcf = new VCard();

  const keys = Object.keys(contact) as ContactFields[];

  // eslint-disable-next-line guard-for-in
  for (const key of keys) {
    switch (key) {
      case "uid": {
        vcf.setUID(contact[key]);
        break;
      }

      case "name": {
        const {
          name: { full, first, middle, last, prefix, suffix },
        } = contact as Required<Contact>;

        if (typeof full === "string") {
          vcf.setFullName(full);
        }

        if (typeof first === "string") {
          vcf.addFirstName(first);
        } else if (Array.isArray(first)) {
          first.forEach((val) => vcf.addFirstName(val));
        }

        if (typeof middle === "string") {
          vcf.addMiddleName(middle);
        } else if (Array.isArray(middle)) {
          middle.forEach((val) => vcf.addMiddleName(val));
        }

        if (typeof last === "string") {
          vcf.addLastName(last);
        } else if (Array.isArray(last)) {
          last.forEach((val) => vcf.addLastName(val));
        }

        if (typeof prefix === "string") {
          vcf.addPrefixName(prefix);
        } else if (Array.isArray(prefix)) {
          prefix.forEach((val) => vcf.addPrefixName(val));
        }

        if (typeof suffix === "string") {
          vcf.addMiddleName(suffix);
        } else if (Array.isArray(suffix)) {
          suffix.forEach((val) => vcf.addSuffixName(val));
        }

        break;
      }

      case "company": {
        const { company } = contact as Required<Contact>;
        // NOTE: There seems to be a bug in easy-vcard that requires a second
        // argument, reported:  https://github.com/Covve/easy-vcard/issues/29
        // vcf.addOrganization(contact.company as string, []);
        vcf.addOrganization(company, []);
        break;
      }

      case "phones": {
        const { phones } = contact as Required<Contact>;
        for (const phone of phones) {
          if (typeof phone === "string") {
            vcf.addPhone(phone);
            continue;
          }

          vcf.addPhone(phone.phone, { type: phone.type });
        }

        break;
      }

      case "emails": {
        const { emails } = contact as Required<Contact>;
        for (const email of emails) {
          if (typeof email === "string") {
            vcf.addEmail(email);
            continue;
          }

          vcf.addEmail(email.email, { type: email.type });
        }

        break;
      }

      case "urls": {
        const { urls } = contact as Required<Contact>;
        for (const url of urls) {
          if (typeof url === "string") {
            vcf.addUrl(url);
            continue;
          }

          vcf.addUrl(url.url, { type: url.type });
        }

        break;
      }

      case "addresses": {
        const { addresses } = contact as Required<Contact>;
        for (const address of addresses) {
          const { type, line1, line2, city, state, postcode, country } =
            address;
          const street =
            typeof line1 === "string" && typeof line2 === "string"
              ? `${line1},${line2}`
              : typeof line1 === "string"
              ? line1
              : typeof line2 === "string"
              ? line2
              : "";
          vcf.addAddress(
            street,
            city || "",
            state || "",
            postcode || "",
            country || "",
            typeof type === "string"
              ? {
                  type,
                }
              : undefined
          );
        }

        break;
      }

      default: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _neverCheck: never = key;
        throw new Error("Missing a key in generateVcardFromContact() #TmdQqv");
      }
    }
  }

  const vcardOutput = vcf.toVcard();

  return vcardOutput;
};
