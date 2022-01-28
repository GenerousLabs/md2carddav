import { Command } from "@oclif/core";
import {
  getClientAndAccount,
  getVCards,
} from "../../services/carddav/carddav.service";
import { getMdContacts } from "../../services/md/md.service";
import { generateVcardFromContact } from "../../services/vcard/vcard.service";
import { getContext } from "../../shared.utils";

export default class MdPush extends Command {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    // // flag with a value (-n, --name=VALUE)
    // name: Flags.string({ char: "n", description: "name to print" }),
    // // flag with no value (-f, --force)
    // force: Flags.boolean({ char: "f" }),
  };

  static args = [{ name: "file" }];

  public async run(): Promise<void> {
    // const { args, flags } = await this.parse(MdPush);

    const context = await getContext(this);

    const {
      config: {
        carddav: { syncAddressBookDisplayName },
      },
    } = context;
    if (typeof syncAddressBookDisplayName === "undefined") {
      this.error(
        "syncAddressBookDisplayName must be set to use this commmand. #NwUjk3"
      );
    }

    this.debug("got context #5mjOU9");
    this.debug(context);

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

    const contacts = await getMdContacts(context);
    this.debug("Got contacts #iI2F1l", contacts);

    const { client } = clientAndAccount;

    for (const contact of contacts) {
      const {
        contact: { uid },
      } = contact;
      const existingVcard = vcards.find((vcard) => vcard.uid === uid);
      if (typeof existingVcard === "undefined") {
        const vcard = generateVcardFromContact(contact.contact);
        // eslint-disable-next-line no-await-in-loop
        const result = await client.createVCard({
          addressBook,
          filename: `${uid}.vcf`,
          vCardString: vcard,
        });

        if (!result.ok) {
          this.debug("Failed to push vcf #bifKkH", result);
          this.error("Failed to push vcf #E5ysfm");
        }
      } else {
        // eslint-disable-next-line no-await-in-loop
        const result = await client.updateVCard({
          vCard: {
            url: existingVcard.vcard.url,
            etag: existingVcard.vcard.etag,
            data: existingVcard,
          },
        });

        if (!result.ok) {
          this.debug("Failed to update vcf #4Xb28G", result);
          this.error("Failed to update vcf #6TqyU3");
        }
      }
    }
  }
}
