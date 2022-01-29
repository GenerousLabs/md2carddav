import {
  generateVcardFromContact,
  _getFilenames,
} from "../../../src/services/vcard/vcard.service";
import { expect, test } from "@oclif/test";

describe("vcard.service", () => {
  describe("generateContactFromVcard()", () => {
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

    test.it("Correctly encodes a photo #lz7uNX");
  });

  describe("_getFilenames()", () => {
    test.it("Ignores empty names #CpofbI", () => {
      expect(
        _getFilenames({
          uid: "1",
          name: { full: "", first: " ", middle: " ", last: "   " },
        })
      ).to.eql(["1"]);
    });

    test.it("Ignores undefined names #w3xluR", () => {
      expect(
        _getFilenames({
          uid: "1",
          name: {
            full: undefined,
            first: undefined,
            middle: undefined,
            last: undefined,
          },
        })
      ).to.eql(["1"]);
    });

    test.it("Correctly joins and lowercases full name #5vpfra", () => {
      expect(_getFilenames({ uid: "1", name: { full: "Jane Doe" } })).to.eql([
        "jane-doe",
        "1",
      ]);
    });

    test.it("Returns the uid when there is no name #5vpfra", () => {
      expect(_getFilenames({ uid: "1" })).to.eql(["1"]);
    });

    test.it("Returns a company name when there is nothing else #ER3qmD", () => {
      expect(_getFilenames({ uid: "1", company: "JD Inc" })).to.eql([
        "jd-inc",
        "1",
      ]);
    });

    test.it(
      "Does not return a company name if a full name exists #8w8ji8",
      () => {
        expect(
          _getFilenames({
            uid: "1",
            name: { full: "Jane Doe" },
            company: "JD Inc",
          })
        ).to.eql(["jane-doe", "1"]);
      }
    );

    test.it("Returns an email when there is nothing else #dF5e3F", () => {
      expect(_getFilenames({ uid: "1", emails: ["jd@domain.tld"] })).to.eql([
        "jd-domain-tld",
        "1",
      ]);
    });
  });
});
