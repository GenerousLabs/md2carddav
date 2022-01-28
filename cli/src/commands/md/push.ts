import { Command, Flags } from "@oclif/core";
import { getVcards } from "../../services/carddav/carddav.service";
import { getMdContacts } from "../../services/md/md.service";
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

    const vcards = await getVcards(context);
    this.debug("Got vcards #Oh7EXz", vcards);

    const addressBook = vcards[syncAddressBookDisplayName];
    if (typeof addressBook === "undefined") {
      this.error(
        "Cannot find address book that matches syncAddressBookDisplayName. #ewDxnI"
      );
    }

    const contacts = await getMdContacts(context);
    this.debug("Got contacts #iI2F1l", contacts);

    for (const contact of contacts) {
      const existingVcard = addressBook.find(
        (vcard) => vcard.uid === contact.contact.vcf_uid
      );
      if (typeof existingVcard === "undefined") {
        // create the contact
      } else {
        // update the contact
      }
    }
  }
}
