import { expect, test } from "@oclif/test";
import { generateVcardFromContact } from "../../../src/services/vcard/vcard.service";

describe("vcard.service", () => {
  describe("generateContactFromVcard()", () => {
    test.it("Correctly encodes only a full name #TnoaQo", async () => {
      expect(
        await generateVcardFromContact("/tmp", {
          uid: "1",
          title: "Jane Doe",
        })
      ).to.equal(
        `BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nN:Doe;Jane;;;\r\nUID:1\r\nEND:VCARD`
      );
    });

    test.it(
      "Correctly encodes a full, first, and last name #BYGiqJ",
      async () => {
        expect(
          await generateVcardFromContact("/tmp", {
            uid: "1",
            title: "Jane Doe",
            name: {
              first: "Janis",
              last: "Donis",
            },
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
          await generateVcardFromContact("/tmp", {
            uid: "1",
            title: "Jane Doe",
            phones: [{ type: "mobile", phone: "+1 123 12345" }],
          })
        ).to.equal(
          `BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nN:Doe;Jane;;;\r\nTEL;TYPE=mobile:+1 123 12345\r\nUID:1\r\nEND:VCARD`
        );
      }
    );

    test.it(
      "Correctly encodes an array of phone numbers as strings #gqnt3J",
      async () => {
        expect(
          await generateVcardFromContact("/tmp", {
            uid: "1",
            title: "Jane Doe",
            phones: ["+1 123 12345"],
          })
        ).to.equal(
          `BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nN:Doe;Jane;;;\r\nTEL:+1 123 12345\r\nUID:1\r\nEND:VCARD`
        );
      }
    );

    test.it("Correctly encodes a photo #lz7uNX");
  });
});
