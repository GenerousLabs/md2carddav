import { generateVcardFromContact } from "../../../src/services/vcard/vcard.service";
import { expect, test } from "@oclif/test";

describe("vcard.service", () => {
  test.it("Correctly encodes only a full name #TnoaQo", async () => {
    expect(
      await generateVcardFromContact({ uid: "1", name: { full: "Jane Doe" } })
    ).to.equal(
      `BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nUID:1\r\nEND:VCARD`
    );
  });

  test.it(
    "Correctly encodes a full, first, and last name #BYGiqJ",
    async () => {
      expect(
        await generateVcardFromContact({
          uid: "1",
          name: { full: "Jane Doe", first: "Janis", last: "Donis" },
        })
      ).to.equal(
        `BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nN:Donis;Janis;;;\r\nUID:1\r\nEND:VCARD`
      );
    }
  );

  test.it(
    "Correctly encodes an array of phone numbers with types #O54AMf",
    async () => {
      expect(
        await generateVcardFromContact({
          uid: "1",
          name: { full: "Jane Doe" },
          phones: [{ type: "mobile", phone: "+1 123 12345" }],
        })
      ).to.equal(
        `BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nTEL;TYPE=mobile:+1 123 12345\r\nUID:1\r\nEND:VCARD`
      );
    }
  );

  test.it(
    "Correctly encodes an array of phone numbers as strings #gqnt3J",
    async () => {
      expect(
        await generateVcardFromContact({
          uid: "1",
          name: { full: "Jane Doe" },
          phones: ["+1 123 12345"],
        })
      ).to.equal(
        `BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nTEL:+1 123 12345\r\nUID:1\r\nEND:VCARD`
      );
    }
  );
});
