import { generateVcardFromContact } from "../../../src/services/vcard/vcard.service";
import { expect, test } from "@oclif/test";

describe("vcard.service", () => {
  test.it("Correctly encodes only a full name #TnoaQo", () => {
    expect(
      generateVcardFromContact({ vcf_uid: "1", name: { full: "Jane Doe" } })
    ).to.equal(
      `BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nUID:1\r\nEND:VCARD`
    );
  });
});
