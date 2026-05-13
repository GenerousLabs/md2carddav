import { VCard } from "../../../vendor/easy-vcard/mod.ts";
import isEqual from "npm:fast-deep-equal";
import slugify from "npm:slugify";
import VcferRaw from "npm:vcfer";
import type { VcferInst, VcferProp } from "./vcfer-types.ts";
import { ContactSchema } from "../../shared/schemas.ts";
import { CommandContext, Contact, ContactField, Returns } from "../../shared/types.ts";
import { extendDebugIfPossible } from "../../shared/utils.ts";
import { clean } from "../../shared/obj-clean.ts";
import {
  getPhotoAsDataURL,
  getPhotoFromVcfer,
  Photo,
} from "./services/photos/photos.service.ts";

// vcfer's CJS exports have the class at .default (Deno npm interop)
// deno-lint-ignore no-explicit-any
const Vcfer = (VcferRaw as any).default as { new(input?: string): VcferInst };

export const getUidFromVcard = (input: string): Returns<string> => {
  if (typeof input !== "string") {
    return { success: false, error: "Invalid vcard #C4tXK8", code: "vcard.invalid" };
  }

  const lines = input.split("\n");
  const uidLine = lines.find((line) => line.startsWith("UID"));

  if (typeof uidLine === "undefined") {
    return { success: false, error: "Failed to find UID #VR5mde", code: "vcard.nouid" };
  }

  if (uidLine.startsWith("UID:")) {
    return { success: true, result: uidLine.slice(4).trim() };
  }

  if (uidLine.startsWith("UID;VALUE=uri:")) {
    return { success: true, result: uidLine.slice(14).trim() };
  }

  return { success: false, error: "Could not parse UID #dE2zIq", code: "vcard.invaliduid" };
};

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
        const { name: { first, middle, last, prefix, suffix } } =
          contact as Required<Contact>;

        if (typeof first === "string") vcf.addFirstName(first);
        else if (Array.isArray(first)) first.forEach((v) => vcf.addFirstName(v));

        if (typeof middle === "string") vcf.addMiddleName(middle);
        else if (Array.isArray(middle)) middle.forEach((v) => vcf.addMiddleName(v));

        if (typeof last === "string") vcf.addLastName(last);
        else if (Array.isArray(last)) last.forEach((v) => vcf.addLastName(v));

        if (typeof prefix === "string") vcf.addPrefixName(prefix);
        else if (Array.isArray(prefix)) prefix.forEach((v) => vcf.addPrefixName(v));

        if (typeof suffix === "string") vcf.addMiddleName(suffix);
        else if (Array.isArray(suffix)) suffix.forEach((v) => vcf.addSuffixName(v));

        break;
      }

      case "nickname": {
        vcf.addNickname((contact as Required<Contact>).nickname);
        break;
      }

      case "photo": {
        const photoDataURI = await getPhotoAsDataURL(
          mdDirectory,
          (contact as Required<Contact>).photo
        );
        vcf.addPhoto(photoDataURI);
        break;
      }

      case "company": {
        vcf.addOrganization((contact as Required<Contact>).company, []);
        break;
      }

      case "phones": {
        for (const phone of (contact as Required<Contact>).phones) {
          if (typeof phone === "string") {
            vcf.addPhone(phone);
          } else {
            vcf.addPhone(phone.phone, { type: phone.type });
          }
        }
        break;
      }

      case "emails": {
        for (const email of (contact as Required<Contact>).emails) {
          if (typeof email === "string") {
            vcf.addEmail(email);
          } else {
            vcf.addEmail(email.email, { type: email.type });
          }
        }
        break;
      }

      case "urls": {
        for (const url of (contact as Required<Contact>).urls) {
          if (typeof url === "string") {
            vcf.addUrl(url);
          } else {
            vcf.addUrl(url.url, { type: url.type });
          }
        }
        break;
      }

      case "addresses": {
        for (const address of (contact as Required<Contact>).addresses) {
          const { type, line1, line2, city, state, postcode, country } = address;
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
            typeof type === "string" ? { type } : undefined
          );
        }
        break;
      }

      case "desc": {
        vcf.addNotes((contact as Required<Contact>).desc);
        break;
      }

      default: {
        const _neverCheck: never = key;
        throw new Error("Missing a key in generateVcardFromContact() #TmdQqv");
      }
    }
  }

  try {
    return vcf.toVcard();
  } catch (error) {
    if (error instanceof Error && error.message.includes("name is mandatory")) {
      if (typeof contact.company === "string" && contact.company.trim().length > 0) {
        vcf.setFullName(contact.company);
        return vcf.toVcard();
      }

      if (typeof contact.emails !== "undefined" && contact.emails.length > 0) {
        const [email] = contact.emails;
        const emailAddress = typeof email === "string" ? email : email.email;
        if (emailAddress.trim().length > 0) {
          vcf.setFullName(emailAddress);
          return vcf.toVcard();
        }
      }
    }
    throw error;
  }
};

const getType = (type?: unknown): string | undefined => {
  if (typeof type === "string") return type;
  if (Array.isArray(type)) return type[0] as string;
  return undefined;
};

const replaceStrings = (input: string): string =>
  input.replace(/\\n/g, "\n").replace(/\\,/g, ",");

const ensureTitleExists = (data: Partial<Contact>): Partial<Contact> => {
  const { title, name, company, emails } = data;

  if (typeof title === "string" && title.trim().length > 0) return data;

  if (typeof name !== "undefined") {
    const { first, last } = name;
    const firstString = Array.isArray(first) ? first.join(" ") : first;
    const lastString = Array.isArray(last) ? last.join(" ") : last;
    const t = [firstString, lastString].join(" ").trim();
    if (t.length > 0) return { ...data, title: t };
  }

  if (typeof company === "string" && company.trim().length > 0) {
    return { ...data, title: company };
  }

  if (typeof emails !== "undefined") {
    const [email] = emails;
    const t = typeof email === "string" ? email : email.email;
    return { ...data, title: t };
  }

  return data;
};

const dataFromVcard = (
  context: CommandContext,
  vcard: VcferInst,
  uid: string
): Omit<Contact, "photo" | "desc"> => {
  const debug = extendDebugIfPossible(context.debug, "dataFromVcard");

  const keys = Object.keys(ContactSchema.shape) as ContactField[];

  const data: Partial<Contact> = keys.reduce((data, key) => {
    switch (key) {
      case "uid":
        return { ...data, uid };

      case "title": {
        const title = replaceStrings(vcard.getOne("fn")?.getValue() || "");
        return title.length > 0 ? { ...data, title } : data;
      }

      case "name": {
        const names = vcard.getOne("n");
        const [last, first, middle, prefix, suffix] =
          names?.getValue().split(";") || [];
        return { ...data, name: { first, last, middle, prefix, suffix } };
      }

      case "nickname": {
        const prop = vcard.getOne("nickname");
        if (typeof prop === "undefined") return data;
        return { ...data, nickname: prop.getValue() };
      }

      case "photo":
        return data;

      case "company": {
        const companies = vcard.getOne("org")?.getValue();
        if (typeof companies === "undefined") return data;
        const [companyRough] = companies.split(";");
        return { ...data, company: replaceStrings(companyRough) };
      }

      case "phones": {
        const vals = vcard.get("tel");
        if (vals.length === 0) return data;
        const phones = vals.map((val: VcferProp) => {
          const phone = val.getValue().replace(/\s/g, " ");
          const type = getType(val.params.type);
          return typeof type === "undefined" ? phone : { phone, type };
        });
        return { ...data, phones };
      }

      case "emails": {
        const vals = vcard.get("email");
        if (vals.length === 0) return data;
        const emails = vals.map((val: VcferProp) => {
          const email = val.getValue();
          const type = getType(val.params.type);
          return typeof type === "undefined" ? email : { email, type };
        });
        return { ...data, emails };
      }

      case "urls": {
        const vals = vcard.get("url");
        if (vals.length === 0) return data;
        const urls = vals.map((val: VcferProp) => {
          const url = val.getValue();
          const type = getType(val.params.type);
          return typeof type === "undefined" ? url : { url, type };
        });
        return { ...data, urls };
      }

      case "addresses": {
        const adrs = vcard.get("adr");
        if (!adrs || adrs.length === 0) return data;
        const addresses = adrs.map((adr: VcferProp) => {
          const [, , lines, city, state, postcode, country] = adr
            .getValue()
            .split(";");
          const [line1, line2] = lines.split(",");
          const type = getType(adr.params.type);
          return { type, line1, line2, city, state, postcode, country };
        });
        return { ...data, addresses };
      }

      case "desc":
        return data;

      default: {
        const _neverCheck: never = key;
        throw new Error("Missing a key in dataFromVcard() #DBryL4");
      }
    }
  }, {});

  const cleaned = clean(data) as Partial<Contact>;
  const withTitle = ensureTitleExists(cleaned);
  const result = ContactSchema.safeParse(withTitle);

  if (result.success) return result.data;

  debug("Failed to create contact #zLK86E", data, cleaned, result);
  throw new Error("Failed to build vcard #VASeQn");
};

export const _getFilenames = (data: Contact): string[] => {
  const { title, uid } = data;
  const titleProcessed = title.replace(/[.@]/g, "-");
  const titleSlug = slugify(titleProcessed, { lower: true, strict: true });
  return [titleSlug, uid];
};

const getNote = (vcard: VcferInst): string | undefined => {
  const notes = vcard.getOne("note")?.getValue();
  if (typeof notes === "undefined") return undefined;
  return replaceStrings(notes);
};

export const generateContactFromVcard = (
  context: CommandContext,
  vcf: string,
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
      return { success: false, error: "Found VCF without UID. #ChLMwK", code: "vcard.uidnotstring" };
    }

    const data = dataFromVcard(context, vcard, uid);
    const filenames = _getFilenames(data);
    const photo = getPhotoFromVcfer(vcard);
    const notes = getNote(vcard);

    if (returnNotesSeparately) {
      return { success: true, result: { data, notes, photo, filenames } };
    }

    const desc = typeof notes === "undefined" ? {} : { desc: notes };
    return { success: true, result: { data: { ...data, ...desc }, photo, filenames } };
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
  { firstVcfer, secondVcfer }: { firstVcfer: VcferInst; secondVcfer: VcferInst }
): boolean => {
  const { debug } = context;
  const firstUid = firstVcfer.getOne("uid");
  const secondUid = secondVcfer.getOne("uid");

  if (typeof firstUid === "undefined" || typeof secondUid === "undefined") {
    debug("#BMFiNA Comparing VCards but at least 1 is missing a UID");
    return false;
  }

  if (firstUid.getValue() === secondUid.getValue()) return true;

  debug("#Huh1KE UIDs did not match", { firstUid, secondUid });
  return false;
};

const JPEG_LEADER = "data:image/jpeg\\," as const;
export const _stripJpegLeader = (input: string): string =>
  input.startsWith(JPEG_LEADER) ? input.slice(JPEG_LEADER.length) : input;

export const _arePhotosEquivalent = (
  context: CommandContext,
  { firstVcfer, secondVcfer }: { firstVcfer: VcferInst; secondVcfer: VcferInst }
): boolean => {
  const { debug } = context;
  const firstPhoto = firstVcfer.getOne("photo");
  const secondPhoto = secondVcfer.getOne("photo");

  if (typeof firstPhoto === "undefined" && typeof secondPhoto === "undefined") return true;
  if (typeof firstPhoto === "undefined" || typeof secondPhoto === "undefined") return false;

  const firstPhotoValue = firstPhoto.getValue();
  const secondPhotoValue = secondPhoto.getValue();

  if (_stripJpegLeader(firstPhotoValue) === _stripJpegLeader(secondPhotoValue)) return true;

  debug("#wWrW6B photos are not the same", { firstPhotoValue, secondPhotoValue });
  return false;
};

// version/uid/photo compared separately; prodid+rev are server-generated metadata we never write
const SKIP_PROPS: readonly string[] = ["version", "uid", "photo", "prodid", "rev"] as const;

export const areVCardsEquivalent = (
  context: CommandContext,
  { first, second }: { first: string; second: string }
): boolean => {
  const { debug } = context;
  const firstVcfer = new Vcfer(first);
  const secondVcfer = new Vcfer(second);

  if (!_areUidsEquivalent(context, { firstVcfer, secondVcfer })) return false;
  if (!_arePhotosEquivalent(context, { firstVcfer, secondVcfer })) return false;

  const propNames = [
    ...firstVcfer.props.keys(),
    ...secondVcfer.props.keys(),
  ].filter((value, index, self) => self.indexOf(value) === index);

  for (const propName of propNames) {
    if (SKIP_PROPS.includes(propName)) continue;

    const firstProps = firstVcfer.get(propName);
    const secondProps = secondVcfer.get(propName);

    if (firstProps.length === 0 && secondProps.length === 0) continue;

    if (firstProps.length !== secondProps.length) {
      debug("#Qp96DP found different prop counts when comparing vcards");
      return false;
    }

    for (const [index, firstProp] of firstProps.entries()) {
      const secondProp = secondProps[index];

      if (firstProp.getValue() !== secondProp.getValue()) {
        debug("#CjtlTq found differing props when comparing vcards", {
          firstPropValue: firstProp.getValue(),
          secondPropValue: secondProp.getValue(),
        });
        return false;
      }

      if (!isEqual(firstProp.params.type, secondProp.params.type)) {
        debug("#uNjJCW found differing params comparing vcards", {
          firstProp,
          secondProp,
        });
        return false;
      }
    }
  }

  debug("#4XT2hN vcards are equivalent");
  return true;
};
