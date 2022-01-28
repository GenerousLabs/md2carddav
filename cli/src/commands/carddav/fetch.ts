import { Command, Flags } from "@oclif/core";
import { path, writeAsync } from "fs-jetpack";
import slugify from "slugify";
import { createDAVClient } from "tsdav";
import { getUidFromVcard } from "../../services/vcard/vcard.service";

const serverUrl = process.env.URL as string;
const username = process.env.USER as string;
const password = process.env.TOKEN as string;

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

  private async getVcards() {
    const client = await createDAVClient({
      serverUrl,
      authMethod: "Basic",
      credentials: {
        username,
        password,
      },
    });

    this.log("Got client #bVoqc1");
    this.debug(client);

    const account = await client.createAccount({
      account: {
        serverUrl,
        accountType: "carddav",
      },
    });

    this.log("Got account #ToupBB");
    this.debug(account);

    const addressBooks = await client.fetchAddressBooks({ account });

    this.log("Got address books #kzx54I");
    this.debug(addressBooks);

    const vcardsEntries = await Promise.all(
      addressBooks.map(async (addressBook, index) => {
        const slug = slugify(addressBook.displayName || index.toString(), {
          lower: true,
        });
        const vcards = await client.fetchVCards({
          addressBook,
        });
        const expandedVcards = vcards.map((vcard) => {
          const uidResult = getUidFromVcard(vcard.data);
          return {
            vcard,
            uid: uidResult.success ? uidResult.result : undefined,
          };
        });
        return [slug, expandedVcards] as const;
      })
    );

    const vcards = Object.fromEntries(vcardsEntries);

    this.log("Got vcards #DN3ahi");
    this.debug(vcards);

    return vcards;
  }

  public async run(): Promise<void> {
    const {
      flags: { directory },
    } = await this.parse(CarddavFetch);

    const vcards = await this.getVcards();

    // eslint-disable-next-line guard-for-in
    for (const slug in vcards) {
      const expandedVcards = vcards[slug];
      for (const card of expandedVcards) {
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

    this.log("Got vcards #VHvQJe");
    this.debug(vcards);
  }
}
