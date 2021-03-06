import { expect, test } from "@oclif/test";
import { getContactFromYamlFrontmatterData } from "../../../../../src/services/md/services/contacts/contacts.service";

const baseContact = {
  uid: "1",
  title: "JD",
};

const expectValidHelper = (input: any) => {
  const result = getContactFromYamlFrontmatterData(input);
  expect(result).to.have.keys("success", "result");
  expect(result).to.have.property("success", true);
  expect((result as any).result).to.be.a("object");
};

const expectInvalidHelper = (input: any) => {
  const result = getContactFromYamlFrontmatterData(input);
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

  test.it("Rejects a record without a title #yOHwJm", () => {
    expectInvalidHelper({
      uid: "1",
      emails: ["md@domain.tld"],
    });
  });

  test.it("Accepts a record with only a title & first name #ooTQiK", () => {
    expectValidHelper({ uid: "1", title: "Jane", name: { first: "Jane" } });
  });

  test.it("Accepts a record with only a title & last name #Q64LNK", () => {
    expectValidHelper({ uid: "1", title: "Doe", name: { last: "Doe" } });
  });

  test.it("Accepts a record with only a title & company name #4fH3w3", () => {
    expectValidHelper({ uid: "1", title: "JD Inc", company: "JD Inc" });
  });

  test.it("Accepts a record with only a title #2TUTOi", () => {
    expectValidHelper({ uid: "1", title: "Jane Doe" });
  });
});
