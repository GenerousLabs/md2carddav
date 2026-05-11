const NEWLINE = "\r\n";
const BEGIN_TOKEN = "BEGIN:VCARD";
const VERSION_TOKEN_V4 = "VERSION:4.0";
const VERSION_TOKEN_V3 = "VERSION:3.0";
const END_TOKEN = "END:VCARD";

type Params = {
  label?: string;
  language?: string;
  value?: string;
  pref?: string;
  altId?: string;
  pid?: string;
  type?: string;
  mediatype?: string;
  calscale?: string;
  sortAs?: string;
  geo?: string;
  timezone?: string;
};

type NameData = {
  fullNames?: string[];
  firstNames?: string[];
  lastNames?: string[];
  middleNames?: string[];
  honorificsPre?: string[];
  honorificsSuf?: string[];
  params?: Params;
};

type SingleValuedProp = { value: string; params?: Params };
type AddressData = {
  street?: string;
  locality?: string;
  region?: string;
  postCode?: string;
  country?: string;
  params?: Params;
};
type OrgData = { values: string[]; params?: Params };
type RevisionData = { value?: string; params?: Params };

export type VCardData = {
  name: NameData;
  nicknames?: SingleValuedProp[];
  photos?: SingleValuedProp[];
  addresses?: AddressData[];
  phones?: SingleValuedProp[];
  emails?: SingleValuedProp[];
  titles?: SingleValuedProp[];
  roles?: SingleValuedProp[];
  organizations?: OrgData[];
  notes?: SingleValuedProp[];
  url?: SingleValuedProp[];
  revision?: RevisionData;
  uid?: RevisionData;
};

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v as object).length === 0;
  return false;
}

export class Formatter {
  format(vCard: VCardData, forceV3 = false): string {
    const lines = [
      BEGIN_TOKEN,
      forceV3 ? VERSION_TOKEN_V3 : VERSION_TOKEN_V4,
      this.getFullName(vCard),
      this.getNameComponents(vCard),
      ...this.getNicknames(vCard),
      ...this.getPhotos(vCard),
      ...this.getAddresses(vCard),
      ...this.getPhones(vCard),
      ...this.getEmails(vCard),
      ...this.getTitles(vCard),
      ...this.getRoles(vCard),
      ...this.getOrganizations(vCard),
      ...this.getNotes(vCard),
      ...this.getUrl(vCard),
      this.getRevision(vCard),
      this.getUID(vCard),
      END_TOKEN,
    ];
    return lines
      .reduce(
        (accumulator, current) =>
          accumulator + current + (current ? NEWLINE : ""),
        ""
      )
      .trim();
  }

  getFullName(vCard: VCardData): string {
    const name = vCard.name;
    if (!name || this.checkIfNameExists(name)) {
      throw new Error(
        "tried to format a vcard that had no name entry while name is mandatory"
      );
    }
    if (name.fullNames && name.fullNames.length) {
      return (
        "FN" +
        this.getFormattedParams(name.params) +
        ":" +
        this.e(name.fullNames[0])
      );
    } else if (name) {
      return (
        "FN:" +
        this.e(
          (name.honorificsPre?.length ? name.honorificsPre[0] + " " : "") +
            (name.firstNames?.length ? name.firstNames[0] + " " : "") +
            (name.middleNames?.length ? name.middleNames[0] + " " : "") +
            (name.lastNames?.length ? name.lastNames[0] + " " : "") +
            (name.honorificsSuf?.length ? name.honorificsSuf[0] + " " : "")
        ).trim()
      );
    }
    return "";
  }

  getNameComponents(vCard: VCardData): string {
    const name = vCard.name;
    if (!name) return "";
    const components = [
      this.concatWith(name.lastNames),
      this.concatWith(name.firstNames),
      this.concatWith(name.middleNames),
      this.concatWith(name.honorificsPre),
      this.concatWith(name.honorificsSuf),
    ];
    if (components.every((c) => c === "")) return "";
    const result = components.reduce(
      (acc, cur, idx) => acc + cur + (idx !== 4 ? ";" : ""),
      ""
    );
    return "N:" + result;
  }

  getNicknames(vCard: VCardData): string[] {
    return this.getSingleValuedProperty(vCard.nicknames, "NICKNAME");
  }

  getPhotos(vCard: VCardData): string[] {
    return this.getSingleValuedProperty(vCard.photos, "PHOTO");
  }

  getAddresses(vCard: VCardData): string[] {
    const addresses = vCard.addresses;
    if (!addresses || !addresses.length) return [];
    return addresses
      .filter((addr) => !!addr && !isEmpty(addr))
      .map(
        (addr) =>
          "ADR" +
          this.getFormattedParams(addr.params) +
          ":;;" +
          this.e(addr.street) +
          ";" +
          this.e(addr.locality) +
          ";" +
          this.e(addr.region) +
          ";" +
          this.e(addr.postCode) +
          ";" +
          this.e(addr.country)
      );
  }

  getPhones(vCard: VCardData): string[] {
    return this.getSingleValuedProperty(vCard.phones, "TEL");
  }

  getEmails(vCard: VCardData): string[] {
    return this.getSingleValuedProperty(vCard.emails, "EMAIL");
  }

  getTitles(vCard: VCardData): string[] {
    return this.getSingleValuedProperty(vCard.titles, "TITLE");
  }

  getRoles(vCard: VCardData): string[] {
    return this.getSingleValuedProperty(vCard.roles, "ROLE");
  }

  getOrganizations(vCard: VCardData): string[] {
    const orgs = vCard.organizations;
    if (!orgs || !orgs.length) return [];
    return orgs
      .filter((org) => !!org && !!org.values && !!org.values.length)
      .map(
        (org) =>
          "ORG" +
          this.getFormattedParams(org.params) +
          ":" +
          org.values.map((v) => this.e(v)).join(";")
      );
  }

  getNotes(vCard: VCardData): string[] {
    return this.getSingleValuedProperty(vCard.notes, "NOTE");
  }

  getRevision(vCard: VCardData): string {
    const rev = vCard.revision;
    if (!rev || !rev.value) return "";
    return (
      "REV" + this.getFormattedParams(rev.params) + ":" + this.e(rev.value)
    );
  }

  getUID(vCard: VCardData): string {
    const uid = vCard.uid;
    if (!uid || !uid.value) return "";
    return (
      "UID" + this.getFormattedParams(uid.params) + ":" + this.e(uid.value)
    );
  }

  getUrl(vCard: VCardData): string[] {
    return this.getSingleValuedProperty(vCard.url, "URL");
  }

  e(s?: string): string {
    if (!s) return "";
    const escapedBackslashes = s.split("\\").join("\\\\");
    const escapedCommas = escapedBackslashes.split(",").join("\\,");
    const escapedSemicolons = escapedCommas.split(";").join("\\;");
    const escapedNewlines = escapedSemicolons.split("\n").join("\\n");
    return escapedNewlines;
  }

  concatWith(list?: string[], separator = ","): string {
    if (!list || !list.length) return "";
    return list.reduce(
      (acc, cur) => acc + (acc ? separator : "") + this.e(cur),
      ""
    );
  }

  getFormattedParams(params?: Params): string {
    if (!params) return "";
    let result = "";
    if (params.label) result += `;LABEL=${this.sanitizeParamValue(params.label)}`;
    if (params.language) result += `;LANGUAGE=${this.sanitizeParamValue(params.language)}`;
    if (params.value) result += `;VALUE=${this.sanitizeParamValue(params.value)}`;
    if (params.pref) result += `;PREF=${this.sanitizeParamValue(params.pref)}`;
    if (params.altId) result += `;ALTID=${this.sanitizeParamValue(params.altId)}`;
    if (params.pid) result += `;PID=${this.sanitizeParamValue(params.pid)}`;
    if (params.type) result += `;TYPE=${this.sanitizeParamValue(params.type)}`;
    if (params.mediatype) result += `;MEDIATYPE=${this.sanitizeParamValue(params.mediatype)}`;
    if (params.calscale) result += `;CALSCALE=${this.sanitizeParamValue(params.calscale)}`;
    if (params.sortAs) result += `;SORT-AS=${this.sanitizeParamValue(params.sortAs)}`;
    if (params.geo) result += `;GEO=${this.sanitizeParamValue(params.geo)}`;
    if (params.timezone) result += `;TZ=${this.sanitizeParamValue(params.timezone)}`;
    return result;
  }

  sanitizeParamValue(value?: string): string {
    if (!value) return "";
    let result = value.split('"').join("");
    result = result.split("\n").join("\\n");
    if (
      result.indexOf(":") !== -1 ||
      result.indexOf(";") !== -1 ||
      result.indexOf(",") !== -1
    ) {
      return '"' + result + '"';
    }
    return result;
  }

  getSingleValuedProperty(
    entities: SingleValuedProp[] | undefined,
    propertyIdentifier: string
  ): string[] {
    if (!entities || !entities.length) return [];
    return entities
      .filter((entity) => !!entity && entity.value)
      .map(
        (entity) =>
          propertyIdentifier +
          this.getFormattedParams(entity.params) +
          ":" +
          this.e(entity.value)
      );
  }

  checkIfNameExists(name: NameData): boolean {
    return (
      !name ||
      (isEmpty(name.fullNames) &&
        isEmpty(name.firstNames) &&
        isEmpty(name.middleNames) &&
        isEmpty(name.lastNames) &&
        isEmpty(name.honorificsPre) &&
        isEmpty(name.honorificsSuf))
    );
  }
}
