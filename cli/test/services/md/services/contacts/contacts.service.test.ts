/* eslint-disable camelcase */
import { expect, test } from "@oclif/test";
import { isValidContact } from "../../../../../src/services/md/services/contacts/contacts.service";

const baseContact = {
  vcf_uid: "1",
  full_name: "JD",
};

const expectValidHelper = (input: any) => {
  expect(isValidContact(input)).eql({
    success: true,
    result: true,
  });
};

const expectInvalidHelper = (input: any) => {
  const result = isValidContact(input);
  expect(result).to.have.keys(["success", "code", "error"]);
  expect(result).to.have.property("success", false);
  expect((result as any).code).to.be.a("string");
  expect((result as any).error).to.be.a("string");
};

describe("contacts.service", () => {
  test.it("Accepts phone numbers as object of type & phone #T0Eizu", () => {
    expectValidHelper({
      ...baseContact,
      phones: [{ type: "mobile", phone: "+1 123 123 1234" }],
    });
  });

  test.it("Accepts phone numbers as a string #jsuF8R", () => {
    expectValidHelper({
      ...baseContact,
      phones: ["+1 123 123 1234"],
    });
  });

  test.it("Accepts emails as object of type & email #elspVt", () => {
    expectValidHelper({
      ...baseContact,
      emails: [{ type: "work", email: "md@domain.tld" }],
    });
  });

  test.it("Accepts emails as a string #OeRpjI", () => {
    expectValidHelper({
      ...baseContact,
      phones: ["md@domain.tld"],
    });
  });

  test.it("Rejects a single email as a string #WoIrfH", () => {
    expectInvalidHelper({ ...baseContact, emails: "md@domain.tld" });
  });

  test.it("Accepts urls as object of type & url #MXbCVf", () => {
    expectValidHelper({
      ...baseContact,
      emails: [{ type: "mastodon", email: "https://domain.tld" }],
    });
  });

  test.it("Accepts emails as a string #xq6ACt", () => {
    expectValidHelper({
      ...baseContact,
      urls: ["https://domain.tld"],
    });
  });

  test.it("Rejects a record without a name #yOHwJm", () => {
    expectInvalidHelper({ vcf_uid: "1", emails: ["md@domain.tld"] });
  });

  test.it("Accepts a record with only a first name #ooTQiK", () => {
    expectValidHelper({ vcf_uid: "1", name: { first: "Jane" } });
  });

  test.it("Accepts a record with only a last name #Q64LNK", () => {
    expectValidHelper({ vcf_uid: "1", name: { last: "Doe" } });
  });

  test.it("Accepts a record with only a company name #4fH3w3", () => {
    expectValidHelper({ vcf_uid: "1", company: "JD Inc" });
  });

  test.it("Accepts a record with only a full name #2TUTOi", () => {
    expectValidHelper({ vcf_uid: "1", full_name: "Jane Doe" });
  });
});
