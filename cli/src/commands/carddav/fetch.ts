import { Command, Flags } from "@oclif/core";
import { path, writeAsync } from "fs-jetpack";
import slugify from "slugify";
import {
  getClientAndAccount,
  getVCards,
} from "../../services/carddav/carddav.service";
import { getContext } from "../../shared.utils";
export default class CarddavFetch extends Command {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    directory: Flags.string({
      char: "d",
      description: "path to save VCF files",
      required: true,
    }),
  };

  static args = [];

  public async run(): Promise<void> {
    const {
      flags: { directory },
    } = await this.parse(CarddavFetch);

    const context = await getContext(this);

    const clientAndAccount = await getClientAndAccount(context);

    const addressBooks = await getVCards(context, clientAndAccount);

    // eslint-disable-next-line guard-for-in
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
    }

    this.debug("Got addressBooks with vcards #VHvQJe");
    this.debug(addressBooks);
  }
}
