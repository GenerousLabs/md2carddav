import { Command, Flags } from "@oclif/core";
import { getClientAndAccount } from "../../services/carddav/carddav.service";
import { getContext } from "../../shared.utils";

// TODO - Could add a `--verbose` flag which logs each contact as its deleted
// and the count of contacts to be deleted at the start

export default class CarddavWipe extends Command {
  static description = `delete every contact in an address book
  This command is extremely destructive, it will delete every contact in a given address book. It is highly recommended to run fetch first and take a backup.
  Why? This command can be useful if you want to delete all contacts and then push again from markdown. Otherwise contacts will never be deleted.
  Use the list command to list address books, each one must be wiped separately.`;

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    "address-book": Flags.string({
      char: "a",
      description: "address book to wipe",
      required: true,
    }),
    force: Flags.boolean({ char: "f" }),
    verbose: Flags.boolean({ char: "v" }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(CarddavWipe);
    const { force, "address-book": addressBookDisplayName, verbose } = flags;

    if (!force) {
      return this.error("Refusing to run without the --force flag.");
    }

    const context = await getContext(this);

    const { client, account } = await getClientAndAccount(context);

    const addressBooks = await client.fetchAddressBooks({ account });

    const addressBook = addressBooks.find(
      ({ displayName }) => displayName === addressBookDisplayName
    );

    if (typeof addressBook === "undefined") {
      this.debug("No address book match. #5nfKaD", addressBooks);
      return this.error(
        "Invalid address book. Not found on the configured CardDAV server. #4UruD6"
      );
    }

    const vCards = await client.fetchVCards({ addressBook });
    this.debug("Fetched VCards #MQfF1Q", vCards);

    for (const vCard of vCards) {
      this.debug("About to delete vcard #RehJiY", vCard);
      // eslint-disable-next-line no-await-in-loop
      await client.deleteVCard({ vCard });
      if (verbose) {
        this.log(`Deleted #L5cPlO ${vCard.url}`);
      }
    }

    this.log(`Deleted ${vCards.length} contacts #xFTULL`);
  }
}
