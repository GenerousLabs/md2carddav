import { Formatter, type VCardData } from "./formatter.ts";

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v as object).length === 0;
  return false;
}

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

const formatter = new Formatter();

export class VCard {
  private _name: VCardData["name"];
  private _nicknames: NonNullable<VCardData["nicknames"]>;
  private _photos: NonNullable<VCardData["photos"]>;
  private _addresses: NonNullable<VCardData["addresses"]>;
  private _phones: NonNullable<VCardData["phones"]>;
  private _emails: NonNullable<VCardData["emails"]>;
  private _titles: NonNullable<VCardData["titles"]>;
  private _roles: NonNullable<VCardData["roles"]>;
  private _organizations: NonNullable<VCardData["organizations"]>;
  private _notes: NonNullable<VCardData["notes"]>;
  private _revision: NonNullable<VCardData["revision"]>;
  private _uid: NonNullable<VCardData["uid"]>;
  private _url: NonNullable<VCardData["url"]>;

  constructor(data?: Partial<VCardData>) {
    this._name = {};
    this._nicknames = [];
    this._photos = [];
    this._addresses = [];
    this._phones = [];
    this._emails = [];
    this._titles = [];
    this._roles = [];
    this._organizations = [];
    this._notes = [];
    this._revision = {};
    this._uid = {};
    this._url = [];

    if (!data) return;
    data = structuredClone(data);
    this._name = data.name ?? {};
    this._nicknames = data.nicknames ?? [];
    this._photos = data.photos ?? [];
    this._addresses = data.addresses ?? [];
    this._phones = data.phones ?? [];
    this._emails = data.emails ?? [];
    this._titles = data.titles ?? [];
    this._roles = data.roles ?? [];
    this._organizations = data.organizations ?? [];
    this._notes = data.notes ?? [];
    this._revision = data.revision ?? {};
    this._uid = data.uid ?? {};
    this._url = data.url ?? [];
  }

  toJSON(): VCardData {
    return structuredClone({
      name: this._name,
      nicknames: this._nicknames,
      photos: this._photos,
      addresses: this._addresses,
      phones: this._phones,
      emails: this._emails,
      titles: this._titles,
      roles: this._roles,
      organizations: this._organizations,
      notes: this._notes,
      revision: this._revision,
      uid: this._uid,
      url: this._url,
    });
  }

  toVcard(forceV3 = false): string {
    return formatter.format(this.toJSON(), forceV3);
  }

  toString(forceV3 = false): string {
    return this.toVcard(forceV3);
  }

  addFirstName(firstName: string): this {
    this._name.firstNames = this._name.firstNames || [];
    this._name.firstNames.push(firstName);
    return this;
  }

  addMiddleName(middleName: string): this {
    this._name.middleNames = this._name.middleNames || [];
    this._name.middleNames.push(middleName);
    return this;
  }

  addLastName(lastName: string): this {
    this._name.lastNames = this._name.lastNames || [];
    this._name.lastNames.push(lastName);
    return this;
  }

  addPrefixName(pre: string): this {
    this._name.honorificsPre = this._name.honorificsPre || [];
    this._name.honorificsPre.push(pre);
    return this;
  }

  addSuffixName(suf: string): this {
    this._name.honorificsSuf = this._name.honorificsSuf || [];
    this._name.honorificsSuf.push(suf);
    return this;
  }

  setFullName(fullname: string): this {
    this._name.fullNames = this._name.fullNames || [];
    this._name.fullNames.push(fullname);
    return this;
  }

  addNickname(nickname: string, params?: Params): this {
    this._nicknames = this._nicknames || [];
    this._nicknames.push({ value: nickname, params });
    return this;
  }

  addPhoto(uri: string, params?: Params): this {
    this._photos.push({ value: uri, params });
    return this;
  }

  addAddress(
    street: string,
    locality: string,
    region: string,
    postCode: string,
    country: string,
    params?: Params
  ): this {
    this._addresses = this._addresses || [];
    const address = { street, locality, region, postCode, country, params };
    if (!isEmpty(address)) this._addresses.push(address);
    return this;
  }

  addPhone(number: string, params?: Params): this {
    this._phones = this._phones || [];
    this._phones.push({ value: number, params });
    return this;
  }

  addEmail(email: string, params?: Params): this {
    this._emails = this._emails || [];
    this._emails.push({ value: email, params });
    return this;
  }

  addTitle(title: string, params?: Params): this {
    this._titles = this._titles || [];
    this._titles.push({ value: title, params });
    return this;
  }

  addRole(role: string, params?: Params): this {
    this._roles = this._roles || [];
    this._roles.push({ value: role, params });
    return this;
  }

  addOrganization(
    organization: string,
    organizationUnits: string[],
    params?: Params
  ): this {
    const units = organizationUnits?.length ? organizationUnits.slice() : [];
    units.splice(0, 0, organization);
    this._organizations = this._organizations || [];
    this._organizations.push({ values: units, params });
    return this;
  }

  addNotes(notes: string, params?: Params): this {
    this._notes = this._notes || [];
    this._notes.push({ value: notes, params });
    return this;
  }

  addUrl(url: string, params?: Params): this {
    this._url = this._url || [];
    this._url.push({ value: url, params });
    return this;
  }

  setRevision(rev: string, params?: Params): this {
    this._revision = { value: rev, params };
    return this;
  }

  setUID(uid: string, params?: Params): this {
    this._uid = { value: uid, params };
    return this;
  }
}
