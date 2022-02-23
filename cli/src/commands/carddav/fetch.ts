import { Command, Flags } from "@oclif/core";
import { path, writeAsync } from "fs-jetpack";
import slugify from "slugify";
import {
  getClientAndAccount,
  getVCards,
} from "../../services/carddav/carddav.service";
import { getContext } from "../../shared.utils";
export default class CarddavFetch extends Command {
  static description = `fetch vcf files from carddav server into a local directory

fetch does the following:

1 - Connects to your configured CardDAV server
2 - Retrieves a list of address books on that server
3 - Fetches every VCard in every address book
4 - Saves them all into your target directory
- In a folder with the address book display name (slugified)
- In a file named UID.vcf where UID is the UID of the VCard
For example addressbook/5182b11b-7ff4-511d-8d92-d45369ec1fac.vcf
NOTE: This command does not remove any existing files, it is recommended to start with an empty directory.`;

  static examples = [
    "<%= config.bin %> <%= command.id %>",
    `fetch -d /path/to/put/vcf/files/`,
  ];

  static flags = {
    directory: Flags.string({
      char: "d",
      description: "path to save VCF files",
      required: true,
    }),
    verbose: Flags.boolean({
      char: "v",
      description: "Output more information about each step in the process.",
    }),
  };

  static args = [];

  public async run(): Promise<void> {
    const {
      flags: { directory, verbose },
    } = await this.parse(CarddavFetch);

    const context = await getContext(this);
    this.debug(`#VrBonm Got context ${JSON.stringify(context)}`);

    const clientAndAccount = await getClientAndAccount(context);

    const addressBooks = await getVCards(context, clientAndAccount);

    if (verbose) {
      this.log(`#1mV657 Got ${addressBooks.length} address books.`);
    }

    for (const addressBook of addressBooks) {
      const { vcards, displayName } = addressBook;

      if (typeof displayName === "undefined") {
        this.warn("Found address book without display name. #1kyeDg");
        continue;
      }

      const slug = slugify(displayName);
      for (const card of vcards) {
        if (typeof card.vcard.data !== "string") {
          this.warn("Found vcard without data. #tTKwcI");
          this.debug(card);
          continue;
        }

        if (typeof card.uid === "undefined") {
          this.warn("Found vcard without uid. #0W953Y");
          this.debug(card);
          continue;
        }

        const writePath = path(directory, slug, `${card.uid}.vcf`);
        // eslint-disable-next-line no-await-in-loop
        await writeAsync(writePath, card.vcard.data);
      }

      if (verbose) {
        this.log(
          `#58HoPP Fetched ${vcards.length} VCards for address book named "${displayName}"`
        );
      }
    }

    this.debug("Got addressBooks with vcards #VHvQJe");
    this.debug(addressBooks);
  }
}
