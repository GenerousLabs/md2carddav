import { Command, Flags } from "@oclif/core";
import {
  getClientAndAccount,
  getVCards,
} from "../../services/carddav/carddav.service";
import { getMdContacts } from "../../services/md/md.service";
import { generateVcardFromContact } from "../../services/vcard/vcard.service";
import { getContext } from "../../shared.utils";

export default class MdPush extends Command {
  static description =
    `Push contacts from markdown to CardDAV\n` +
    `Load all contacts from markdown, load all contacts from CardDAV, find ` +
    `any which need created or update, and then create or update them on ` +
    `configured the CardDAV server`;

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    verbose: Flags.boolean({ char: "v" }),
  };

  public async run(): Promise<void> {
    const {
      flags: { verbose },
    } = await this.parse(MdPush);

    const context = await getContext(this);

    const {
      config: {
        carddav: { syncAddressBookDisplayName },
        md: { directory: mdDirectory },
      },
    } = context;
    if (typeof syncAddressBookDisplayName === "undefined") {
      this.error(
        "syncAddressBookDisplayName must be set to use this commmand. #NwUjk3"
      );
    }

    this.debug("Got context #5mjOU9", context);

    const clientAndAccount = await getClientAndAccount(context);

    const addressBooks = await getVCards(context, clientAndAccount);
    for (const addressBook of addressBooks) {
      this.debug("Got vcards #Oh7EXz", addressBook, addressBook.vcards);
    }

    const addressBook = addressBooks.find(
      ({ displayName }) => displayName === syncAddressBookDisplayName
    );

    if (typeof addressBook === "undefined") {
      this.error(
        "Cannot find address book that matches syncAddressBookDisplayName. #ewDxnI"
      );
    }

    const { vcards } = addressBook;

    if (verbose) {
      this.log(`Found ${vcards.length} VCards. #vGWp2R`);
    }

    const contacts = await getMdContacts(context);
    this.debug("Got contacts #iI2F1l", contacts.length, contacts);

    if (verbose) {
      this.log(`Found ${contacts.length} markdown contacts. #aofT8L`);
    }

    const { client } = clientAndAccount;

    for (const contact of contacts) {
      const {
        contact: { uid },
      } = contact;
      // eslint-disable-next-line no-await-in-loop
      const vcard = await generateVcardFromContact(
        mdDirectory,
        contact.contact
      );

      const existingVcard = vcards.find((vcard) => vcard.uid === uid);

      if (typeof existingVcard === "undefined") {
        this.debug("Did not find existing vcard to update #HriKMD", uid);

        // eslint-disable-next-line no-await-in-loop
        const result = await client.createVCard({
          addressBook,
          filename: `${uid}.vcf`,
          vCardString: vcard,
        });

        if (!result.ok) {
          this.warn(
            `Failed to create new VCard #bifKkH UID: ${uid}, Result: ${result}`
          );
          this.error("Failed to push vcf #E5ysfm");
        }

        if (verbose) {
          this.log(`Successfully created new VCard #r5gYBn UID: ${uid}`);
        }

        continue;
      }

      this.debug("Found existing vcard to update #svKzvh", uid);

      if (vcard === existingVcard.vcard.data) {
        this.debug("No changes in vcard, skipping update #B07yJK", uid);
        if (verbose) {
          this.log(
            `Skipping VCard which does not require update #ivh1lh UID: ${uid}`
          );
        }

        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      const result = await client.updateVCard({
        vCard: {
          url: existingVcard.vcard.url,
          etag: existingVcard.vcard.etag,
          data: vcard,
        },
      });

      if (!result.ok) {
        this.warn(
          `Failed to update VCard #4Xb28G UID: ${uid}, Result: ${result}`
        );
        this.error("Failed to update vcf #6TqyU3");
      }

      this.debug("Successfully updated vcard #V6VG0x", uid, vcard, result);
      if (verbose) {
        this.log(`Successfully synced changes to VCard #tp11hW UID: ${uid}`);
      }
    }
  }
}
