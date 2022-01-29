/* eslint-disable unicorn/no-array-for-each */
import { VCard } from "@covve/easy-vcard";
import * as clean from "obj-clean";
import Vcfer from "vcfer";
import { ContactSchema, ContactSchemaBase } from "../../shared.schemas";
import { Contact, ContactField, Returns } from "../../shared.types";
import {
  getPhotoAsDataURL,
  getPhotoFromVcfer,
  Photo,
} from "./services/photos/photos.service";

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
export const generateVcardFromContact = async (
  contact: Contact
): Promise<string> => {
  const vcf = new VCard();

  const keys = Object.keys(contact) as ContactField[];

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

      case "photo": {
        const { photo } = contact as Required<Contact>;
        // eslint-disable-next-line no-await-in-loop
        const photoDataURI = await getPhotoAsDataURL(photo);
        vcf.addPhoto(photoDataURI);
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

      case "desc": {
        const { desc } = contact as Required<Contact>;
        vcf.addNotes(desc);
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

const getType = (type?: string | string[]) => {
  if (typeof type === "string") {
    return type;
  }

  if (Array.isArray(type)) {
    return type[0];
  }
};

const dataFromVcard = (
  vcard: Vcfer,
  uid: string
): Omit<Contact, "photo" | "desc"> => {
  const keys = Object.keys(ContactSchemaBase.shape) as ContactField[];

  // eslint-disable-next-line unicorn/prefer-object-from-entries, unicorn/no-array-reduce
  const data = keys.reduce((data, key) => {
    switch (key) {
      case "uid": {
        return { ...data, uid };
      }

      case "name": {
        const names = vcard.getOne("n");

        const [last, first, middle, prefix, suffix] =
          names?.getValue().split(";") || [];
        const full = vcard.getOne("fn")?.getValue();

        const name = { full, first, last, middle, prefix, suffix };

        return { ...data, name };
      }

      // Photos are handled elsewhere
      case "photo": {
        return data;
      }

      case "company": {
        const company = vcard.getOne("org")?.getValue();
        if (typeof company === "undefined") {
          return data;
        }

        return { ...data, company };
      }

      case "phones": {
        const vals = vcard.get("tel");

        if (vals.length === 0) {
          return data;
        }

        const phones = vals.map((val) => {
          const phone = val.getValue();
          const type = getType(val.params.type);
          if (typeof type === "undefined") {
            return phone;
          }

          return { phone, type };
        });

        return { ...data, phones };
      }

      case "emails": {
        const vals = vcard.get("email");

        if (vals.length === 0) {
          return data;
        }

        const emails = vals.map((val) => {
          const email = val.getValue();
          const type = getType(val.params.type);
          if (typeof type === "undefined") {
            return email;
          }

          return { email, type };
        });

        return { ...data, emails };
      }

      case "urls": {
        const vals = vcard.get("url");

        if (vals.length === 0) {
          return data;
        }

        const urls = vals.map((val) => {
          const url = val.getValue();
          const type = getType(val.params.type);
          if (typeof type === "undefined") {
            return url;
          }

          return { url, type };
        });

        return { ...data, urls };
      }

      case "addresses": {
        const adrs = vcard.get("adr");
        if (typeof adrs === "undefined" || adrs.length === 0) {
          return data;
        }

        const addresses = adrs.map((adr) => {
          // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
          const [, , lines, city, state, postcode, country] = adr
            .getValue()
            .split(";");
          const [line1, line2] = lines.split(",");
          const type = getType(adr.params.type);
          return { type, line1, line2, city, state, postcode, country };
        });
        return { ...data, addresses };
      }

      case "desc": {
        return data;
      }

      default: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _neverCheck: never = key;
        throw new Error("Missing a key in dataFromVcard() #DBryL4");
      }
    }
  }, {});

  const cleaned = clean(data);

  const result = ContactSchema.safeParse(cleaned);

  if (result.success === true) {
    return result.data;
  }

  console.log("Failed to create contact #zLK86E", data, cleaned, result);
  throw new Error("Failed to build vcard #VASeQn");
};

export const generateContactFromVcard = (
  vcf: string
): Returns<{
  data: Omit<Contact, "photo" | "notes">;
  notes?: string;
  photo?: Photo;
}> => {
  const vcard = new Vcfer(vcf);

  const uid = vcard.getOne("uid")?.getValue();

  if (typeof uid === "undefined") {
    return {
      success: false,
      error: "Found VCF without UID. #ChLMwK",
      code: "vcard.uidnotstring",
    };
  }

  const photo = getPhotoFromVcfer(vcard, uid);

  const notes = vcard.getOne("note")?.getValue();

  try {
    const data = dataFromVcard(vcard, uid);
    return { success: true, result: { data, notes, photo } };
  } catch (error) {
    return {
      success: false,
      error: (error as any).message,
      code: "vcard.failed",
    };
  }
};
