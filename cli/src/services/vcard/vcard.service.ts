/* eslint-disable unicorn/no-array-for-each */
import { VCard } from "@covve/easy-vcard";
import * as isEqual from "fast-deep-equal";
import * as clean from "obj-clean";
import slugify from "slugify";
import Vcfer from "vcfer";
import { ContactSchema } from "../../shared.schemas";
import {
  CommandContext,
  Contact,
  ContactField,
  Returns,
} from "../../shared.types";
import { extendDebugIfPossible } from "../../shared.utils";
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
  const uidLine = lines.find((line) => line.startsWith("UID"));

  if (typeof uidLine === "undefined") {
    return {
      success: false,
      error: "Failed to find UID #VR5mde",
      code: "vcard.nouid",
    };
  }

  // The UID line should be like:
  // `uid:XXX`
  if (uidLine.startsWith("UID:")) {
    const uid = uidLine.slice(4).trim();

    return {
      success: true,
      result: uid,
    };
  }

  // The UID line should be like:
  // `UID;VALUE=uri:XXX`
  if (uidLine.startsWith("UID;VALUE=uri:")) {
    const uid = uidLine.slice(14).trim();

    return {
      success: true,
      result: uid,
    };
  }

  return {
    success: false,
    error: "Could not parse UID #dE2zIq",
    code: "vcard.invaliduid",
  };
};

// eslint-disable-next-line complexity
export const generateVcardFromContact = async (
  mdDirectory: string,
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

      case "title": {
        const { title, name } = contact;
        vcf.setFullName(title);

        // If a full name is like `Jane Doe` and there is no names field, auto
        // guess the first and last names
        if (typeof name === "undefined") {
          const names = title.split(" ");
          if (names.length === 2) {
            const [first, last] = names;
            vcf.addFirstName(first);
            vcf.addLastName(last);
          }
        }

        break;
      }

      case "name": {
        const {
          name: { first, middle, last, prefix, suffix },
        } = contact as Required<Contact>;

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

      case "nickname": {
        const { nickname } = contact as Required<Contact>;
        vcf.addNickname(nickname);
        break;
      }

      case "photo": {
        const { photo } = contact as Required<Contact>;
        // eslint-disable-next-line no-await-in-loop
        const photoDataURI = await getPhotoAsDataURL(mdDirectory, photo);
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

  try {
    // This will throw if there is no name
    const vcardOutput = vcf.toVcard();
    return vcardOutput;
  } catch (error) {
    // The exception throw when there's no name is not typed, so we can only
    // check if it matches a message, flaky...
    if (error instanceof Error && error.message.includes("name is mandatory")) {
      if (
        typeof contact.company === "string" &&
        contact.company.trim().length > 0
      ) {
        vcf.setFullName(contact.company);
        const vcardOutput = vcf.toVcard();
        return vcardOutput;
      }

      if (typeof contact.emails !== "undefined" && contact.emails.length > 0) {
        const [email] = contact.emails;
        const emailAddress = typeof email === "string" ? email : email.email;
        if (emailAddress.trim().length > 0) {
          vcf.setFullName(emailAddress);
          const vcardOutput = vcf.toVcard();
          return vcardOutput;
        }
      }
    }

    throw error;
  }
};

const getType = (type?: string | string[]) => {
  if (typeof type === "string") {
    return type;
  }

  if (Array.isArray(type)) {
    return type[0];
  }
};

const replaceStrings = (input: string): string => {
  const replaced = input.replace(/\\n/g, `\n`).replace(/\\,/g, `,`);
  return replaced;
};

const ensureTitleExists = (data: Partial<Contact>): Partial<Contact> => {
  const { title, name, company, emails } = data;

  if (typeof title === "string" && title.trim().length > 0) {
    return data;
  }

  if (typeof name !== "undefined") {
    const { first, last } = name;
    const firstString = Array.isArray(first) ? first.join(" ") : first;
    const lastString = Array.isArray(last) ? last.join(" ") : last;
    const title = [firstString, lastString].join(" ").trim();
    if (title.length > 0) {
      return { ...data, title };
    }
  }

  if (typeof company === "string" && company.trim().length > 0) {
    return { ...data, title: company };
  }

  if (typeof emails !== "undefined") {
    const [email] = emails;
    const title = typeof email === "string" ? email : email.email;
    return { ...data, title };
  }

  return data;
};

const dataFromVcard = (
  context: CommandContext,
  vcard: Vcfer,
  uid: string
): Omit<Contact, "photo" | "desc"> => {
  const debug = extendDebugIfPossible(context.debug, "dataFromVcard");

  const keys = Object.keys(ContactSchema.shape) as ContactField[];

  // eslint-disable-next-line unicorn/prefer-object-from-entries, unicorn/no-array-reduce, complexity
  const data: Partial<Contact> = keys.reduce((data, key) => {
    switch (key) {
      case "uid": {
        return { ...data, uid };
      }

      case "title": {
        const title = replaceStrings(vcard.getOne("fn")?.getValue() || "");
        if (title.length > 0) {
          return { ...data, title };
        }

        return data;
      }

      case "name": {
        const names = vcard.getOne("n");

        const [last, first, middle, prefix, suffix] =
          names?.getValue().split(";") || [];

        const name = { first, last, middle, prefix, suffix };

        return { ...data, name };
      }

      case "nickname": {
        const prop = vcard.getOne("nickname");
        if (typeof prop === "undefined") {
          return data;
        }

        const nickname = prop.getValue();
        return { ...data, nickname };
      }

      // Photos are handled elsewhere
      case "photo": {
        return data;
      }

      case "company": {
        const companies = vcard.getOne("org")?.getValue();
        if (typeof companies === "undefined") {
          return data;
        }

        const [companyRough] = companies.split(";");
        const company = replaceStrings(companyRough);

        return { ...data, company };
      }

      case "phones": {
        const vals = vcard.get("tel");

        if (vals.length === 0) {
          return data;
        }

        const phones = vals.map((val) => {
          const phone = val.getValue().replace(/\s/g, " ");
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

  const cleaned = clean(data) as Partial<Contact>;

  // NOTE: At this point, it's possible that the contact data is valid as a
  // VCard but does not match our schema. Our schema requires a non empty
  // `title` (mapped to full name in the VCard).

  const withTitle = ensureTitleExists(cleaned);

  const result = ContactSchema.safeParse(withTitle);

  if (result.success === true) {
    return result.data;
  }

  debug("Failed to create contact #zLK86E", data, cleaned, result);
  throw new Error("Failed to build vcard #VASeQn");
};

export const _getFilenames = (data: Contact): string[] => {
  const { title, uid } = data;
  const titleProcessed = title.replace(/[.@]/g, "-");
  const titleSlug = slugify(titleProcessed, { lower: true, strict: true });

  return [titleSlug, uid];
};

const getNote = (vcard: Vcfer) => {
  const notes = vcard.getOne("note")?.getValue();

  if (typeof notes === "undefined") {
    return;
  }

  const replaced = replaceStrings(notes);

  return replaced;
};

export const generateContactFromVcard = (
  context: CommandContext,
  vcf: string,
  // This is the default behaviour during import
  returnNotesSeparately = true
): Returns<{
  data: Omit<Contact, "photo">;
  notes?: string;
  photo?: Photo;
  filenames: string[];
}> => {
  try {
    const vcard = new Vcfer(vcf);

    const uid = vcard.getOne("uid")?.getValue();

    if (typeof uid === "undefined") {
      return {
        success: false,
        error: "Found VCF without UID. #ChLMwK",
        code: "vcard.uidnotstring",
      };
    }

    const data = dataFromVcard(context, vcard, uid);

    const filenames = _getFilenames(data);

    const photo = getPhotoFromVcfer(vcard);

    const notes = getNote(vcard);

    if (returnNotesSeparately) {
      return { success: true, result: { data, notes, photo, filenames } };
    }

    const desc = typeof notes === "undefined" ? {} : { desc: notes };

    return {
      success: true,
      result: { data: { ...data, ...desc }, photo, filenames },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : JSON.stringify(error),
      code: "vcard.failed",
    };
  }
};

export const _areUidsEquivalent = (
  context: CommandContext,
  { firstVcfer, secondVcfer }: { firstVcfer: Vcfer; secondVcfer: Vcfer }
): boolean => {
  const { debug } = context;

  const firstUid = firstVcfer.getOne("uid");
  const secondUid = secondVcfer.getOne("uid");

  if (typeof firstUid === "undefined" || typeof secondUid === "undefined") {
    debug("#BMFiNA Comparing VCArds but at least 1 is missing a UID");
    return false;
  }

  if (firstUid.getValue() === secondUid.getValue()) {
    return true;
  }

  debug("#Huh1KE UIDs did not match", {
    firstVcfer,
    secondVcfer,
    firstUid,
    secondUid,
  });
  return false;
};

const JPEG_LEADER = "data:image/jpeg\\," as const;
export const _stripJpegLeader = (input: string): string =>
  input.startsWith(JPEG_LEADER) ? input.slice(JPEG_LEADER.length) : input;

export const _arePhotosEquivalent = (
  context: CommandContext,
  { firstVcfer, secondVcfer }: { firstVcfer: Vcfer; secondVcfer: Vcfer }
): boolean => {
  const { debug } = context;

  const firstPhoto = firstVcfer.getOne("photo");
  const secondPhoto = secondVcfer.getOne("photo");

  if (typeof firstPhoto === "undefined" && typeof secondPhoto === "undefined") {
    return true;
  }

  if (typeof firstPhoto === "undefined" || typeof secondPhoto === "undefined") {
    return false;
  }

  const firstPhotoValue = firstPhoto.getValue();
  const secondPhotoValue = secondPhoto.getValue();

  if (
    _stripJpegLeader(firstPhotoValue) === _stripJpegLeader(secondPhotoValue)
  ) {
    return true;
  }

  debug("#wWrW6B photos are not the same", {
    firstPhotoValue,
    secondPhotoValue,
  });

  return false;
};

const SKIP_PROPS: readonly string[] = ["version", "uid", "photo"] as const;

/**
 * Things that can differ between our VCard and the remote
 *
 * - the photo gets line wrapped at n characters
 * - Ours are VCard 4 the remote can be VCard 3
 *
 * @argument context {CommandContext}
 * @returns {Boolean} If the two vcards are equivalent
 */
export const areVCardsEquivalent = (
  context: CommandContext,
  { first, second }: { first: string; second: string }
): boolean => {
  const { debug } = context;

  // Will this result in an update?
  const firstVcfer = new Vcfer(first);
  const secondVcfer = new Vcfer(second);

  if (!_areUidsEquivalent(context, { firstVcfer, secondVcfer })) {
    return false;
  }

  if (!_arePhotosEquivalent(context, { firstVcfer, secondVcfer })) {
    return false;
  }

  const propNames = [
    ...firstVcfer.props.keys(),
    ...secondVcfer.props.keys(),
  ].filter((value, index, self) => self.indexOf(value) === index);

  for (const propName of propNames) {
    if (SKIP_PROPS.includes(propName)) {
      continue;
    }

    const firstProps = firstVcfer.get(propName);
    const secondProps = secondVcfer.get(propName);

    if (firstProps.length === 0 && secondProps.length === 0) {
      continue;
    }

    if (firstProps.length !== secondProps.length) {
      debug("#Qp96DP found different prop counts when comparing vcards");
      return false;
    }

    for (const [index, firstProp] of firstProps.entries()) {
      const secondProp = secondProps[index];

      if (firstProp.getValue() !== secondProp.getValue()) {
        debug("#CjtlTq found differing props when comparing vcards", {
          first,
          second,
          firstPropValue: firstProp.getValue(),
          secondPropValue: secondProp.getValue(),
        });
        return false;
      }

      if (!isEqual(firstProp.params.type, secondProp.params.type)) {
        debug("#uNjJCW found differing params comparing vcards", {
          first,
          second,
          firstProp,
          secondProp,
        });
        return false;
      }
    }
  }

  debug(`#4XT2hN vcards are equivalent`);

  return true;
};
